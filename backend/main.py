import os
import json
from typing import List, Optional, Dict, Any

import joblib
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
import numpy as np
import pandas as pd

# -------------------------------------------------------------------
# 0) Environment / setup
# -------------------------------------------------------------------

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in environment.")

gemini = genai.Client(api_key=GEMINI_API_KEY)

# -------------------------------------------------------------------
# 1) Load ML models + scalers
# -------------------------------------------------------------------

# Base RF model
MODEL1_PATH = "model/model1-rf/rf_median_model.pkl"
SCALER1_PATH = "model/model1-rf/robust_scaler.pkl"

if not os.path.exists(MODEL1_PATH):
    raise FileNotFoundError(f"Base model not found at {MODEL1_PATH}")

if not os.path.exists(SCALER1_PATH):
    raise FileNotFoundError(f"Base scaler not found at {SCALER1_PATH}")

ml_model = joblib.load(MODEL1_PATH)
scaler = joblib.load(SCALER1_PATH)

# Optional: weighted model (if you have it)
MODEL2_PATH = "model/model2-rf-weighted/rf_weighted_model.pkl"
SCALER2_PATH = "model/model2-rf-weighted/robust_scaler_weighted.pkl"

weighted_model = None
weighted_scaler = None

if os.path.exists(MODEL2_PATH) and os.path.exists(SCALER2_PATH):
    weighted_model = joblib.load(MODEL2_PATH)
    weighted_scaler = joblib.load(SCALER2_PATH)

# -------------------------------------------------------------------
# 1.5) Load city normalization data (6 category norms per city)
# -------------------------------------------------------------------

CITY_NORM_PATH = "model/city_norm_values.csv"

if not os.path.exists(CITY_NORM_PATH):
    raise FileNotFoundError(f"City normalization file not found at {CITY_NORM_PATH}")

# Expect columns:
# City, housing_norm, food_norm, restaurants_norm,
# transport_norm, internet_utils_norm, lifestyle_norm
city_norm_df = pd.read_csv(CITY_NORM_PATH)

# Clean up City column a bit
city_norm_df["City"] = city_norm_df["City"].astype(str).str.strip()

# -------------------------------------------------------------------
# 2) FastAPI app
# -------------------------------------------------------------------

app = FastAPI(title="Livio Cost-of-Living API")

# -------------------------------------------------------------------
# 3) Pydantic models
# -------------------------------------------------------------------

class ChatRequest(BaseModel):
    prompt: str


class ChatResponse(BaseModel):
    reply: str


class PredictRequest(BaseModel):
    features: List[float]  # Must match training feature order


class PredictResponse(BaseModel):
    prediction: float


class SmartRequest(BaseModel):
    text: str
    features: List[float]


class SmartResponse(BaseModel):
    gemini_summary: str
    ml_prediction: float


class ConversationRequest(BaseModel):
    message: str


class ConversationResponse(BaseModel):
    reply: str
    city: Optional[str] = None
    kids: Optional[int] = None
    housing: Optional[str] = None


# -------------------------------------------------------------------
# 4) Simple conversation state (could be replaced by Redis, DB, etc.)
# -------------------------------------------------------------------

conversation_state: Dict[str, Any] = {
    "city": None,
    "kids": None,
    "housing": None,
}

# -------------------------------------------------------------------
# 5) Helper: extract structured info from a user message using Gemini
# -------------------------------------------------------------------

def extract_structured_info(user_message: str) -> Dict[str, Any]:
    """
    Ask Gemini to extract (city, kids, housing) from free text.
    Returns a dict: {"city": str | None, "kids": int | None, "housing": "rent"|"buy"|None}
    """

    extraction_prompt = f"""
    Extract structured information from the user's message.
    If a field is missing, return null.

    Fields:
    - city: the city name they are asking about (e.g. "Toronto, Canada").
    - kids: number of children (integer).
    - housing: "rent" if they say they are renting or plan to rent,
               "buy" if they say they will buy / own a house,
               null otherwise.

    USER MESSAGE: "{user_message}"

    Return ONLY valid JSON, no extra text.
    Example:
    {{
        "city": "Toronto, Canada",
        "kids": 2,
        "housing": "rent"
    }}
    """

    resp = gemini.models.generate_content(
        model="gemini-1.5-flash",
        contents=extraction_prompt,
    )

    text = resp.text.strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        data = {"city": None, "kids": None, "housing": None}

    # normalize
    city = data.get("city")
    kids = data.get("kids")
    housing = data.get("housing")

    # ensure correct types
    if isinstance(kids, str):
        try:
            kids = int(kids)
        except ValueError:
            kids = None

    if housing is not None:
        housing = housing.lower()
        if housing not in ("rent", "buy"):
            housing = None

    return {"city": city, "kids": kids, "housing": housing}


# -------------------------------------------------------------------
# 6) Helper: build feature vector for a given city (+ optional modifiers)
# -------------------------------------------------------------------

def _clip01(x: float) -> float:
    """Ensure value stays in [0,1] range."""
    return float(max(0.0, min(1.0, x)))


def get_city_features(city_name: str, kids: Optional[int], housing: Optional[str]) -> np.ndarray:
    """
    Build the 6-feature input vector for the ML models using:
      - housing_norm
      - food_norm
      - restaurants_norm
      - transport_norm
      - internet_utils_norm
      - lifestyle_norm

    If the city exists in city_norm_values.csv we use that.
    If it doesn't exist, we ask Gemini to approximate these values
    (user will never see that we didn't have this city).
    """

    # -------- 1) Try to find city in our CSV (case-insensitive match) --------
    mask = city_norm_df["City"].str.lower() == city_name.strip().lower()
    row = city_norm_df[mask]

    if not row.empty:
        base = row.iloc[0]
        housing_norm = float(base["housing_norm"])
        food_norm = float(base["food_norm"])
        restaurants_norm = float(base["restaurants_norm"])
        transport_norm = float(base["transport_norm"])
        internet_utils_norm = float(base["internet_utils_norm"])
        lifestyle_norm = float(base["lifestyle_norm"])
    else:
        # -------- 2) City not in training data → let Gemini approximate --------
        known_cities = city_norm_df["City"].tolist()
        known_str = ", ".join(known_cities[:80])  # just first 80 for brevity in prompt

        prompt = f"""
        We have a cost-of-living model that uses 6 normalized scores between 0 and 1:
        - housing_norm
        - food_norm
        - restaurants_norm
        - transport_norm
        - internet_utils_norm
        - lifestyle_norm

        0 means very cheap, 1 means extremely expensive in that category.

        The user city is: "{city_name}".
        Known example cities (for reference only): {known_str}.

        Based on general world knowledge, estimate reasonable normalized values
        for that city for each of the 6 categories. Return ONLY valid JSON like:

        {{
          "housing_norm": 0.75,
          "food_norm": 0.60,
          "restaurants_norm": 0.65,
          "transport_norm": 0.55,
          "internet_utils_norm": 0.50,
          "lifestyle_norm": 0.58
        }}
        """

        resp = gemini.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
        )

        try:
            data = json.loads(resp.text.strip())
            housing_norm = float(data.get("housing_norm", 0.5))
            food_norm = float(data.get("food_norm", 0.5))
            restaurants_norm = float(data.get("restaurants_norm", 0.5))
            transport_norm = float(data.get("transport_norm", 0.5))
            internet_utils_norm = float(data.get("internet_utils_norm", 0.5))
            lifestyle_norm = float(data.get("lifestyle_norm", 0.5))
        except Exception:
            # very defensive fallback
            housing_norm = food_norm = restaurants_norm = transport_norm = internet_utils_norm = lifestyle_norm = 0.5

    # -------- 3) Adjust based on kids / housing choice --------

    if kids is not None and kids > 0:
        # Each child slightly increases food & transport burden
        food_norm += 0.05 * kids
        transport_norm += 0.03 * kids

    if housing == "buy":
        housing_norm += 0.10
    elif housing == "rent":
        housing_norm += 0.03

    # Clip all to [0,1]
    housing_norm = _clip01(housing_norm)
    food_norm = _clip01(food_norm)
    restaurants_norm = _clip01(restaurants_norm)
    transport_norm = _clip01(transport_norm)
    internet_utils_norm = _clip01(internet_utils_norm)
    lifestyle_norm = _clip01(lifestyle_norm)

    features = np.array([
        housing_norm,
        food_norm,
        restaurants_norm,
        transport_norm,
        internet_utils_norm,
        lifestyle_norm
    ], dtype=float)

    return features


def run_models_for_city(city: str, kids: Optional[int], housing: Optional[str]) -> Dict[str, float]:
    """
    Wrapper that:
    - builds features for this city
    - scales them
    - gets predictions from base model (+ optional weighted model)
    """

    features = get_city_features(city, kids, housing)  # 1D array

    if features.ndim == 1:
        features = features.reshape(1, -1)

    # Base model
    scaled1 = scaler.transform(features)
    pred1 = float(ml_model.predict(scaled1)[0])

    result = {
    "base_model_raw": pred1
    }

    if weighted_model is not None:
        result["weighted_model_raw"] = pred2


    # Optional weighted model
    if weighted_model is not None and weighted_scaler is not None:
        scaled2 = weighted_scaler.transform(features)
        pred2 = float(weighted_model.predict(scaled2)[0])
        result["weighted_model"] = pred2

    return result

def score_to_cost(score: float) -> dict:
    """
    Convert the ML score into a dollar estimate and range.
    Tuned to match your example:
    score = 0.4212 → $681 CAD (approx)
    """
    base = (score * 1100) + 200   # core formula
    monthly = round(base)

    low = round(monthly * 0.85)
    high = round(monthly * 1.25)

    return {
        "score": round(score, 4),
        "monthly_estimate": monthly,
        "range_low": low,
        "range_high": high
    }




# -------------------------------------------------------------------
# 7) Endpoints
# -------------------------------------------------------------------

@app.post("/gemini-chat", response_model=ChatResponse)
async def gemini_chat(req: ChatRequest):
    resp = gemini.models.generate_content(
        model="gemini-1.5-flash",
        contents=req.prompt,
    )
    return ChatResponse(reply=resp.text)


@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    """
    Direct prediction endpoint:
    frontend sends full numeric feature list (6 normalized values).
    """
    if not req.features:
        raise HTTPException(status_code=400, detail="features list is empty")

    arr = np.array(req.features, dtype=float).reshape(1, -1)
    scaled = scaler.transform(arr)
    pred = float(ml_model.predict(scaled)[0])
    return PredictResponse(prediction=pred)


@app.post("/smart-endpoint", response_model=SmartResponse)
async def smart_endpoint(req: SmartRequest):
    """
    Uses your ML model + Gemini to explain the prediction.
    """
    if not req.features:
        raise HTTPException(status_code=400, detail="features list is empty")

    arr = np.array(req.features, dtype=float).reshape(1, -1)
    scaled = scaler.transform(arr)
    pred = float(ml_model.predict(scaled)[0])

    prompt = f"""
    A cost-of-living model produced the prediction: {pred}.
    Input context from the user: "{req.text}".
    Explain this prediction in simple, friendly language in 3–5 sentences.
    Do not talk about machine learning, just talk like a human advisor.
    """

    gem_resp = gemini.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt,
    )

    return SmartResponse(
        gemini_summary=gem_resp.text,
        ml_prediction=pred,
    )


@app.post("/ai-chat", response_model=ConversationResponse)
async def ai_chat(req: ConversationRequest):
    """
    Main conversational endpoint (the one your frontend should use):

    - Takes free text from user
    - Uses Gemini to extract city / kids / housing
    - Updates conversation_state
    - Runs ML model(s) for that city (using category norms)
    - Asks Gemini to generate a human reply using model outputs
    """

    user_message = req.message

    # Step 1: extract info
    extracted = extract_structured_info(user_message)

    if extracted.get("city"):
        conversation_state["city"] = extracted["city"]

    if extracted.get("kids") is not None:
        conversation_state["kids"] = extracted["kids"]

    if extracted.get("housing"):
        conversation_state["housing"] = extracted["housing"]

    city = conversation_state["city"]
    kids = conversation_state["kids"]
    housing = conversation_state["housing"]

    # If we still do not have a city, ask user for it
    if city is None:
        reply = "Sure, I can help you with cost of living. Which city are you interested in?"
        return ConversationResponse(reply=reply, city=None, kids=kids, housing=housing)

    # Step 2: run ML predictions for this city
    preds = run_models_for_city(city, kids, housing)

    base_pred = preds.get("base_model")
    weighted_pred = preds.get("weighted_model")

    # Step 3: build natural language reply using Gemini
    pred_text = f"Base model estimate: {base_pred:.2f} (relative cost index)."
    if weighted_pred is not None:
        pred_text += f" Weighted model estimate (with lifestyle weights): {weighted_pred:.2f}."

    kids_text = f"The user has {kids} children." if kids is not None else "The user has not specified children."
    housing_text = (
        f"The user is planning to {housing} a home."
        if housing in ("rent", "buy")
        else "The user has not specified if they will rent or buy."
    )

    prompt = f"""
    The user said: "{user_message}"

    Extracted structured info:
    - City: {city}
    - Kids: {kids}
    - Housing: {housing}

    Model outputs:
    {pred_text}

    Additional context:
    {kids_text}
    {housing_text}

    Write a friendly, human explanation in 3–6 sentences:
    - Start by confirming the city.
    - Mention the estimated cost-of-living level in simple terms (cheap, moderate, expensive).
    - Briefly touch on how kids and housing choice might affect real-world monthly budget.
    - Suggest what else the user could tell you (like car, salary range, or more lifestyle details).
    Do not mention machine learning, models, or 'internal calculations'.
    """

    gem_resp = gemini.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt,
    )

    base_struct = score_to_cost(base_pred)

    weighted_struct = None
    if weighted_pred is not None:
        weighted_struct = score_to_cost(weighted_pred)

    return ConversationResponse(
        reply=gem_resp.text,
        city=city,
        kids=kids,
        housing=housing,
        base_model=base_struct,
        weighted_model=weighted_struct
    )

