import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Supplier Delivery Risk API")

# Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load artifacts
model = joblib.load("supplier_delivery_risk_model.pkl")
orders_df = pd.read_csv("../data/supplier_risk_predictions.csv")


class OrderFeatures(BaseModel):
    item_category: str
    supplier_risk_class: str
    region: str
    order_quantity: float
    unit_cost: float
    order_value: float
    promised_lead_time: float
    historical_avg_delay: float
    historical_late_rate: float
    defect_rate: float
    order_month: int
    order_dayofweek: int


@app.get("/orders")
def get_orders(limit: int = 150):
    """Returns a balanced mix of High, Medium, and Low risk orders, or top records."""
    if "risk_category" in orders_df.columns:
        # Take a balanced sample from each category so all tabs have data
        high = orders_df[orders_df["risk_category"] == "High"].head(limit // 3)
        med = orders_df[orders_df["risk_category"] == "Medium"].head(limit // 3)
        low = orders_df[orders_df["risk_category"] == "Low"].head(limit // 3)
        combined = pd.concat([high, med, low]).sample(frac=1, random_state=42)
        sample = combined.fillna("")
    else:
        sample = orders_df.head(limit).fillna("")

    return sample.to_dict(orient="records")


@app.post("/predict")
def predict_risk(order: OrderFeatures):
    """Predicts delivery risk for a new order."""
    df_in = pd.DataFrame([order.model_dump()])
    probability = float(model.predict_proba(df_in)[0][1])

    if probability >= 0.70:
        category = "High"
    elif probability >= 0.40:
        category = "Medium"
    else:
        category = "Low"

    return {
        "risk_score": round(probability, 4),
        "risk_score_percent": round(probability * 100, 2),
        "predicted_late_delivery": int(probability >= 0.5),
        "risk_category": category,
    }