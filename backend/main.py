import os
from fastapi import FastAPI
from pydantic import BaseModel
from google import genai
import joblib 
from dotenv import load_dotenv
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)
app = FastAPI()
print("Loaded API Key:", GEMINI_API_KEY)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Give prediction for average cost of living in Toronto",
)

print(response.text)





# # ---------- 1) Load Gemini client ----------
# gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# # ---------- 2) Load your ML model ----------
# # Example: scikit-learn model saved as model.pkl
# MODEL_PATH = "model.pkl"
# ml_model = joblib.load(MODEL_PATH)

# # ---------- Request/Response models ----------

# class ChatRequest(BaseModel):
#     prompt: str

# class ChatResponse(BaseModel):
#     reply: str

# class PredictRequest(BaseModel):
#     features: list[float]  # adjust to your model input

# class PredictResponse(BaseModel):
#     prediction: float | int | str  # adjust to your output

# class SmartRequest(BaseModel):
#     text: str
#     features: list[float]

# class SmartResponse(BaseModel):
#     gemini_summary: str
#     ml_prediction: float | int | str


# # ---------- 3) Endpoint to talk to Gemini ----------

# @app.post("/gemini-chat", response_model=ChatResponse)
# async def gemini_chat(req: ChatRequest):
#     response = gemini_client.models.generate_content(
#         model="gemini-1.5-flash",
#         contents=req.prompt,
#     )
#     # response.text is the combined output (client handles parts)
#     return ChatResponse(reply=response.text)


# # ---------- 4) Endpoint to talk to your ML model ----------

# @app.post("/predict", response_model=PredictResponse)
# async def predict(req: PredictRequest):
#     # Example: model expects [ [f1, f2, f3, ...] ]
#     pred = ml_model.predict([req.features])[0]
#     return PredictResponse(prediction=pred)


# # ---------- 5) Endpoint that uses BOTH ----------

# @app.post("/smart-endpoint", response_model=SmartResponse)
# async def smart_endpoint(req: SmartRequest):
#     # Step 1: Use your ML model
#     pred = ml_model.predict([req.features])[0]

#     # Step 2: Ask Gemini to explain / summarize
#     prompt = f"""
#     A model predicted value: {pred}.
#     Input description: {req.text}.
#     Explain this prediction to a non-technical user in 3–4 sentences.
#     """

#     gemini_resp = gemini_client.models.generate_content(
#         model="gemini-1.5-flash",
#         contents=prompt,
#     )

#     return SmartResponse(
#         gemini_summary=gemini_resp.text,
#         ml_prediction=pred
#     )
