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
def get_orders():
    """Returns all real rows without artificial sampling or limits."""
    return orders_df.fillna("").to_dict(orient="records")


@app.post("/predict")
def predict_risk(order: OrderFeatures):
    """Predicts risk and returns top matching suppliers for this category."""
    df_in = pd.DataFrame([order.model_dump()])
    probability = float(model.predict_proba(df_in)[0][1])

    if probability >= 0.70:
        category = "High"
    elif probability >= 0.40:
        category = "Medium"
    else:
        category = "Low"

    # Find suppliers who handle this category, sorted by lowest late rate
    matched_suppliers = []
    if "item_category" in orders_df.columns and "supplier_id" in orders_df.columns:
        filtered = orders_df[
            orders_df["item_category"].str.lower() == order.item_category.lower()
        ]
        
        # If possible, also match supplier risk class
        if "supplier_risk_class" in orders_df.columns:
            class_filtered = filtered[
                filtered["supplier_risk_class"].str.lower() == order.supplier_risk_class.lower()
            ]
            if not class_filtered.empty:
                filtered = class_filtered

        # Group by supplier to aggregate performance
        if not filtered.empty and "historical_late_rate" in filtered.columns:
            agg_suppliers = (
                filtered.groupby("supplier_id")
                .agg({
                    "historical_late_rate": "mean",
                    "historical_avg_delay": "mean" if "historical_avg_delay" in filtered.columns else "count",
                    "order_id": "count"
                })
                .reset_index()
                .rename(columns={"order_id": "orders_count"})
                .sort_values(by="historical_late_rate", ascending=True)
                .head(3)
            )

            for _, row in agg_suppliers.iterrows():
                matched_suppliers.append({
                    "supplier_id": row["supplier_id"],
                    "late_rate": round(float(row["historical_late_rate"]) * 100, 1),
                    "avg_delay": round(float(row["historical_avg_delay"]), 1) if "historical_avg_delay" in row else 0.0,
                    "orders_completed": int(row["orders_count"])
                })
        else:
            # Fallback unique suppliers
            for s in filtered["supplier_id"].unique()[:3]:
                matched_suppliers.append({"supplier_id": str(s), "late_rate": 0.0, "avg_delay": 0.0, "orders_completed": 0})

    return {
        "risk_score": round(probability, 4),
        "risk_score_percent": round(probability * 100, 2),
        "predicted_late_delivery": int(probability >= 0.5),
        "risk_category": category,
        "recommended_suppliers": matched_suppliers
    }