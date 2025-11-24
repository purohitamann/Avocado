import os
import json
from typing import Optional, Dict, Any
from datetime import datetime

import joblib
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from google import genai
import numpy as np
import pandas as pd
from fastapi import Query
from services.news_service import get_city_news
from services.weather_service import get_weather

# -------------------------------
# ENV + APP SETUP
# -------------------------------
load_dotenv()
app = FastAPI()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY missing in .env")

gemini = genai.Client(api_key=GEMINI_API_KEY)

# Session memory (per session_id)
session_memory: Dict[str, Dict[str, Any]] = {}

# -------------------------------
# LOAD ML MODELS (BASE MODEL ONLY)
# -------------------------------
MODEL1_PATH = "model/model2-rf-weighted/rf_weighted_model.pkl"
SCALER1_PATH = "model/model2-rf-weighted/robust_scaler_weighted.pkl"

ml_model = joblib.load(MODEL1_PATH)
scaler = joblib.load(SCALER1_PATH)

# --- OPTIONAL: weighted model (kept but commented out) ---
# MODEL2_PATH = "../model/model2-rf-weighted/rf_weighted_model.pkl"
# SCALER2_PATH = "../model/model2-rf-weighted/robust_scaler_weighted.pkl"
# weighted_model = joblib.load(MODEL2_PATH)
# weighted_scaler = joblib.load(SCALER2_PATH)

# -------------------------------
# LOAD CITY NORMS (IF AVAILABLE)
# -------------------------------
# Expect columns:
# City, housing_norm, food_norm, restaurants_norm,
# transport_norm, internet_utils_norm, lifestyle_norm

CITY_NORMS_PATHS = [
    "../dataset/cost_of_living-processed.csv",
    # "../model/city_norm_values.csv",
]

city_norms_df = None
for path in CITY_NORMS_PATHS:
    if os.path.exists(path):
        city_norms_df = pd.read_csv(path)
        city_norms_df["City"] = city_norms_df["City"].astype(str).str.strip()
        print(f"Loaded city norms from: {path}")
        break

if city_norms_df is None:
    print("⚠️ No city_norm_values.csv found. Will use Gemini for norms.")


# -------------------------------
# Request + Response Models
# -------------------------------
class ConversationRequest(BaseModel):
    session_id: str
    message: str


class ConversationResponse(BaseModel):
    session_id: str
    reply: str
    city: Optional[str] = None
    kids: Optional[int] = None
    housing: Optional[str] = None
    cars: Optional[int] = None
    score: Optional[float] = None
    monthly_estimate: Optional[int] = None
    range_low: Optional[int] = None
    range_high: Optional[int] = None
    # Cost breakdown by category
    housing_cost: Optional[int] = None
    food_cost: Optional[int] = None
    restaurants_cost: Optional[int] = None
    transport_cost: Optional[int] = None
    internet_utils_cost: Optional[int] = None
    lifestyle_cost: Optional[int] = None
    # City insights
    news: Optional[Dict[str, Any]] = None
    weather: Optional[Dict[str, Any]] = None


# -------------------------------
# JSON Helper
# -------------------------------
def clean_json(raw: str) -> dict:
    """Remove ```json ... ``` wrappers and parse JSON safely."""
    cleaned = (
        raw.replace("```json", "")
           .replace("```", "")
           .strip()
    )
    print("Cleaned response:", cleaned)

    try:
        return json.loads(cleaned)
    except Exception as e:
        print("JSON parse error:", e)
        return {}


# -------------------------------
# 1) Extract city / kids / housing / cars
# -------------------------------
def extract_info_with_gemini(text: str) -> Dict[str, Any]:
    """
    Use Gemini to extract:
      - city (string or null)
      - kids (int or null)
      - housing ("rent" / "buy" / null)
      - cars (int or null)
    """

    prompt = f"""
    You MUST return ONLY JSON. No sentences.

    The JSON must contain exactly:
    - city (string or null)
    - kids (integer or null)
    - housing ("rent", "buy", or null)
    - cars (integer or null)

    USER MESSAGE: "{text}"

    Example:
    {{
        "city": "Toronto, Canada",
        "kids": 2,
        "housing": "rent",
        "cars": 1
    }}

    Output ONLY JSON:
    """

    resp = gemini.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config={
            "temperature": 0.3,  # Lower temperature for accurate extraction
        }
    )

    raw = resp.text.strip()
    print("Gemini raw (extract):", raw)

    data = clean_json(raw)

    city = data.get("city")
    kids = data.get("kids")
    housing = data.get("housing")
    cars = data.get("cars")

    # Type fixes
    if isinstance(kids, str):
        try:
            kids = int(kids)
        except Exception:
            kids = None

    if isinstance(cars, str):
        try:
            cars = int(cars)
        except Exception:
            cars = None

    if housing:
        housing = str(housing).lower()
        if housing not in ("rent", "buy"):
            housing = None

    return {
        "city": city,
        "kids": kids,
        "housing": housing,
        "cars": cars,
    }


# -------------------------------
# 2) Build base city features (6 norms)
# -------------------------------
def build_city_features(city: str) -> np.ndarray:
    """
    1) If city exists in CSV, use its 6 norm values.
    2) Otherwise, ask Gemini to approximate them (fallback).
    """

    # --- Try CSV first ---
    if city_norms_df is not None:
        mask = city_norms_df["City"].str.lower() == city.strip().lower()
        row = city_norms_df[mask]
        if not row.empty:
            base = row.iloc[0]
            vals = [
                float(base["housing_norm"]),
                float(base["food_norm"]),
                float(base["restaurants_norm"]),
                float(base["transport_norm"]),
                float(base["internet_utils_norm"]),
                float(base["lifestyle_norm"]),
            ]
            return np.array(vals, dtype=float)

    # --- Fallback to Gemini if city not found or CSV doesn't exist ---
    prompt = f"""
    Analyze the cost of living for "{city}" and provide 6 normalized values (0 to 1):

    - housing_norm: Rent/property prices relative to global average
    - food_norm: Grocery and supermarket costs
    - restaurants_norm: Dining out and cafe prices
    - transport_norm: Public transit, fuel, vehicle costs
    - internet_utils_norm: Internet, electricity, water, gas
    - lifestyle_norm: Entertainment, gym, hobbies, shopping

    Scale: 0 = very cheap (e.g., rural India), 0.5 = moderate (e.g., mid-tier US city), 1 = extremely expensive (e.g., Singapore, Zurich)

    Consider:
    - The city's country, economic status, and currency strength
    - Urban vs suburban areas
    - Known reputation (e.g., NYC/London expensive, Bangkok/Mexico City cheaper)
    - Regional differences within countries
    
    BE SPECIFIC AND VARIED for "{city}". Don't use generic 0.5-0.7 range for everything.
    Use the full 0-1 scale appropriately based on the city's actual cost characteristics.

    Output ONLY JSON:
    {{
        "housing_norm": 0.XX,
        "food_norm": 0.XX,
        "restaurants_norm": 0.XX,
        "transport_norm": 0.XX,
        "internet_utils_norm": 0.XX,
        "lifestyle_norm": 0.XX
    }}
    """

    resp = gemini.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config={
            "temperature": 0.7,  # Some variety while maintaining accuracy
            "top_p": 0.9,
        }
    )

    raw = resp.text.strip()
    print("Gemini raw (norms):", raw)
    data = clean_json(raw)

    h = float(data.get("housing_norm", 0.5))
    f = float(data.get("food_norm", 0.5))
    r = float(data.get("restaurants_norm", 0.5))
    t = float(data.get("transport_norm", 0.5))
    i = float(data.get("internet_utils_norm", 0.5))
    l = float(data.get("lifestyle_norm", 0.5))

    vals = [h, f, r, t, i, l]
    vals = [max(0, min(1, v)) for v in vals]
    return np.array(vals, dtype=float)


# -------------------------------
# 3) Run base ML model on city
# -------------------------------
def run_base_model(city: str) -> Dict[str, Any]:
    feats = build_city_features(city).reshape(1, -1)
    scaled = scaler.transform(feats)
    score = float(ml_model.predict(scaled)[0])

    result = {
        "base_score": score,
        "norms": {
            "housing": float(feats[0][0]),
            "food": float(feats[0][1]),
            "restaurants": float(feats[0][2]),
            "transport": float(feats[0][3]),
            "internet_utils": float(feats[0][4]),
            "lifestyle": float(feats[0][5]),
        }
    }

    # --- OPTIONAL second model (commented out) ---
    # feats2 = feats
    # scaled2 = weighted_scaler.transform(feats2)
    # weighted_score = float(weighted_model.predict(scaled2)[0])
    # result["weighted_score"] = weighted_score

    return result


# -------------------------------
# 4) Convert score → base monthly cost
# -------------------------------
def score_to_cost(score: float) -> Dict[str, float]:
    min=1000
    max =5000
    """
    Convert the ML score into a base monthly estimate.
    (You can tweak this mapping as you like.)
    """
    base = min+(score*(max - min))
    monthly = round(base)
    return {
        "score": round(score, 4),
        "monthly": monthly,
        "range_low": round(monthly * 0.85),
        "range_high": round(monthly * 1.25),
    }


# -------------------------------
# 5) Option C: manual rules + (optional) Gemini fallback
# -------------------------------
def adjust_monthly_with_rules(
    city: str,
    base_monthly: int,
    kids: Optional[int],
    housing: Optional[str],
    cars: Optional[int],
) -> int:
    """
    Option C:
    - Start from base_monthly (1 adult, neutral situation).
    - Apply manual multipliers for kids, housing, cars.
    - If we still have almost no info, we could call Gemini to refine (optional).
    """

    multiplier = 1.0

    # Kids → add ~20% per child, capped
    if kids is not None and kids > 0:
        extra_kids = min(0.20 * kids, 0.60)  # cap at +60%
        multiplier += extra_kids

    # Housing → assume base is closer to 'baseline rent'
    if housing == "rent":
        multiplier += 0.05  # slight bump vs base
    elif housing == "buy":
        multiplier += 0.35  # buying is significantly more

    # Cars → ~18% per car, capped
    if cars is not None and cars > 0:
        extra_cars = min(0.18 * cars, 0.54)  # cap at +54%
        multiplier += extra_cars

    adjusted = round(base_monthly * multiplier)

    # Optional: if we want Gemini to refine *further* when info is thin,
    # we could add a fallback here (kept simple for now).

    return adjusted


# -------------------------------
# 6) Build final human reply with Gemini
# -------------------------------
def build_gemini_reply(
    user_msg: str,
    city: str,
    kids: Optional[int],
    housing: Optional[str],
    cars: Optional[int],
    base_monthly: int,
    final_monthly: int,
) -> str:
    """
    Ask Gemini to write a friendly explanation.
    We do NOT mention ML or internal details.
    """

    kids_text = "no children mentioned"
    if kids is not None:
        kids_text = f"{kids} kid(s)"

    housing_text = "housing type not specified"
    if housing == "rent":
        housing_text = "planning to rent"
    elif housing == "buy":
        housing_text = "planning to buy a home"

    cars_text = "no cars mentioned"
    if cars is not None:
        cars_text = f"{cars} car(s)"

    prompt = f"""
    User message: "{user_msg}"

    City: {city}
    Family: {kids_text}
    Housing: {housing_text}
    Cars: {cars_text}

    Cost Analysis:
    - Base monthly (single person): {base_monthly} CAD
    - Adjusted monthly estimate: {final_monthly} CAD

    Create a detailed, insightful response (5-8 sentences) that:
    
    1. Acknowledges the city and characterizes its cost level (cheap/moderate/expensive) compared to global standards
    2. Provides an IN-DEPTH analysis of WHY this city has these costs:
       - Economic factors (GDP, currency strength, local economy)
       - Housing market dynamics (supply/demand, real estate trends)
       - Transportation infrastructure and costs
       - Food and dining culture/prices
    3. Explains how their specific situation (kids/housing/cars) impacts the estimate with concrete reasoning
    4. Highlights which expense categories will be the biggest budget items for them
    5. Offers practical insights about this city's lifestyle and what to expect
    6. Suggests additional factors to consider (neighborhood choice, lifestyle preferences, income level)
    
    Make it conversational yet informative. Use specific knowledge about {city}.
    Do NOT mention AI, machine learning, models, or technical processes.
    Vary your language - don't use the same phrases for every city.
    """

    resp = gemini.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config={
            "temperature": 0.7,  # Some variety while maintaining accuracy
            "top_p": 0.9,
        }
    )

    return resp.text

@app.get("/city-insights")
async def city_insights(city: str = Query(..., description="City name")):
    news = await get_city_news(city)
    weather = await get_weather(city)

    return {
        "city": city,
        "news": news,
        "weather": weather
    }

# -------------------------------
# MAIN ENDPOINT
# -------------------------------
@app.post("/ai-chat", response_model=ConversationResponse)
async def ai_chat(req: ConversationRequest):

    session_id = req.session_id
    user_msg = req.message

    # Create session if not exists
    if session_id not in session_memory:
        session_memory[session_id] = {
            "city": None,
            "kids": None,
            "housing": None,
            "cars": None,
        }

    state = session_memory[session_id]

    # 1) Extract structured info from this message
    info = extract_info_with_gemini(user_msg)

    if info.get("city"):
        state["city"] = info["city"]

    if info.get("kids") is not None:
        state["kids"] = info["kids"]

    if info.get("housing"):
        state["housing"] = info["housing"]

    if info.get("cars") is not None:
        state["cars"] = info["cars"]

    city = state["city"]
    kids = state["kids"]
    housing = state["housing"]
    cars = state["cars"]

    # If city still missing → ask user
    if city is None:
        return ConversationResponse(
            session_id=session_id,
            reply="Sure! I can help with cost of living. Which city are you interested in?",
            city=None,
            kids=kids,
            housing=housing,
            cars=cars,
        )

    # 2) Base model prediction for this city
    print(f"\n🔍 Processing city: {city}")
    print(f"📊 Session state - Kids: {kids}, Housing: {housing}, Cars: {cars}")
    
    base_preds = run_base_model(city)
    base_score = base_preds["base_score"]
    norms = base_preds["norms"]
    
    print(f"📈 Base ML score: {base_score:.4f}")
    print(f"🎯 City norms retrieved: {norms}")
    
    base_cost = score_to_cost(base_score)
    base_monthly = base_cost["monthly"]
    
    print(f"💵 Base monthly cost: ${base_monthly}")

    # 3) Adjust monthly cost using Option C (manual rules)
    final_monthly = adjust_monthly_with_rules(
        city=city,
        base_monthly=base_monthly,
        kids=kids,
        housing=housing,
        cars=cars,
    )
    
    print(f"💰 Final adjusted monthly: ${final_monthly}")

    # Recompute range around final (keep 15–25% band)
    final_range_low = round(final_monthly * 0.85)
    final_range_high = round(final_monthly * 1.25)
    
    print(f"\n🧮 Calculating cost breakdown...")
    print(f"   Using final_monthly: ${final_monthly}")
    print(f"   City norms: {norms}")
    
    # Calculate cost breakdown based on typical spending distribution
    # Adjusted by city norms (higher norm = more expensive in that category)
    base_housing = final_monthly * 0.42
    base_food = final_monthly * 0.14
    base_restaurants = final_monthly * 0.11
    base_transport = final_monthly * 0.04
    base_internet = final_monthly * 0.05
    base_lifestyle = final_monthly * 0.24
    
    print(f"   Base allocations (before norms): H={base_housing:.0f}, F={base_food:.0f}, R={base_restaurants:.0f}, T={base_transport:.0f}, I={base_internet:.0f}, L={base_lifestyle:.0f}")
    
    # Apply norm adjustments (multiply by norm to scale relative expense)
    housing_cost = round(base_housing * norms["housing"] / 0.5)  # 0.5 is baseline
    food_cost = round(base_food * norms["food"] / 0.5)
    restaurants_cost = round(base_restaurants * norms["restaurants"] / 0.5)
    transport_cost = round(base_transport * norms["transport"] / 0.5)
    internet_utils_cost = round(base_internet * norms["internet_utils"] / 0.5)
    lifestyle_cost = round(base_lifestyle * norms["lifestyle"] / 0.5)
    
    # Ensure breakdown sums to approximately total (normalize if needed)
    breakdown_sum = housing_cost + food_cost + restaurants_cost + transport_cost + internet_utils_cost + lifestyle_cost
    if breakdown_sum != final_monthly and breakdown_sum > 0:
        ratio = final_monthly / breakdown_sum
        housing_cost = round(housing_cost * ratio)
        food_cost = round(food_cost * ratio)
        restaurants_cost = round(restaurants_cost * ratio)
        transport_cost = round(transport_cost * ratio)
        internet_utils_cost = round(internet_utils_cost * ratio)
        # Adjust lifestyle to make exact total
        lifestyle_cost = final_monthly - (housing_cost + food_cost + restaurants_cost + transport_cost + internet_utils_cost)
    
    # Log the breakdown for debugging
    print(f"💰 Cost Breakdown for {city}:")
    print(f"  Housing: ${housing_cost} (norm: {norms['housing']:.2f})")
    print(f"  Food: ${food_cost} (norm: {norms['food']:.2f})")
    print(f"  Restaurants: ${restaurants_cost} (norm: {norms['restaurants']:.2f})")
    print(f"  Transport: ${transport_cost} (norm: {norms['transport']:.2f})")
    print(f"  Internet/Utils: ${internet_utils_cost} (norm: {norms['internet_utils']:.2f})")
    print(f"  Lifestyle: ${lifestyle_cost} (norm: {norms['lifestyle']:.2f})")
    print(f"  Total: ${final_monthly}")

    # 4) Fetch city insights (news and weather)
    print(f"🌤️ Fetching city insights for {city}...")
    news = await get_city_news(city)
    weather = await get_weather(city)
    print(f"✅ City insights retrieved: {len(news)} news items, weather data available")

    # 5) Build human explanation with Gemini
    reply = build_gemini_reply(
        user_msg=user_msg,
        city=city,
        kids=kids,
        housing=housing,
        cars=cars,
        base_monthly=base_monthly,
        final_monthly=final_monthly,
    )

    return ConversationResponse(
        session_id=session_id,
        reply=reply,
        city=city,
        kids=kids,
        housing=housing,
        cars=cars,
        score=base_cost["score"],          # base model score
        monthly_estimate=final_monthly,    # adjusted monthly
        range_low=final_range_low,
        range_high=final_range_high,
        housing_cost=housing_cost,
        food_cost=food_cost,
        restaurants_cost=restaurants_cost,
        transport_cost=transport_cost,
        internet_utils_cost=internet_utils_cost,
        lifestyle_cost=lifestyle_cost,
        news=news,
        weather=weather,
    )


# -------------------------------
# ADDITIONAL ENDPOINTS
# -------------------------------
@app.on_event("startup")
async def startup_event():
    print("=" * 50)
    print("🥑 Cistra API Starting...")
    print(f"Port: {os.getenv('PORT', '8000')}")
    print(f"Debug: {os.getenv('DEBUG', 'False')}")
    print(f"Gemini API Key: {'✓ Set' if os.getenv('GEMINI_API_KEY') else '✗ Missing'}")
    print("=" * 50)


@app.get("/health")
async def health_check():
    """Health check endpoint for Cloud Run"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "cistra-api"
    }


@app.get("/")
async def read_root():
    return {"message": "Cistra API is running"}
