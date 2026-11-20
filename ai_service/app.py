import os
import json
from datetime import datetime, timedelta
from typing import List, Optional
import pandas as pd
import numpy as np
import joblib
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "neighbourshare_demand_model.joblib")
HISTORY_PATH = os.path.join(BASE_DIR, "neighbourshare_demand_history.csv")
METADATA_PATH = os.path.join(BASE_DIR, "model_metadata.json")
LIVE_TX_PATH = os.path.join(BASE_DIR, "live_borrowing_demand.json")

EQUIPMENT_CATEGORIES = [
    "Aerator",
    "Dehumidifier",
    "Forklift",
    "Heater",
    "Mini dumper",
    "Pipe pressing machine"
]

# Category mapping from household tools to construction equipment categories for safe transfer learning
HOUSEHOLD_TO_ML_MAPPING = {
    "electrical-tools": "Pipe pressing machine",
    "home-repair-tools": "Pipe pressing machine",
    "gardening-equipment": "Aerator",
    "cleaning-equipment": "Dehumidifier",
    "household-appliances": "Heater",
    "other-equipment": "Mini dumper"
}

app = FastAPI(
    title="NeighbourShare AI Equipment Rental Demand Prediction Service",
    description="Custom Random Forest ML service predicting daily equipment rental demand without external AI APIs.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model & history storage
ml_model = None
demand_history_df = None
model_metadata = {}

@app.on_event("startup")
def load_model_and_data():
    global ml_model, demand_history_df, model_metadata
    try:
        print("Loading trained Random Forest model from", MODEL_PATH)
        ml_model = joblib.load(MODEL_PATH)
        print("[OK] Model successfully loaded into memory.")

        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                model_metadata = json.load(f)
            print("[OK] Model metadata loaded.")

        print("Loading historical demand dataset from", HISTORY_PATH)
        df = pd.read_csv(HISTORY_PATH)
        df["Rental Date"] = pd.to_datetime(df["Rental Date"])
        df = df.sort_values(["Category", "Rental Date"]).reset_index(drop=True)
        demand_history_df = df
        print(f"[OK] Historical dataset loaded ({len(df):,} records).")
    except Exception as e:
        print(f"Error loading model or data: {e}")
        raise e


class ForecastRequest(BaseModel):
    category: str = "All"
    days: int = 7


class TransactionIngestRequest(BaseModel):
    id: str
    equipmentId: str
    equipmentName: str
    category: Optional[str] = "electrical-tools"
    status: str
    startDate: str
    endDate: str
    calculatedFee: float


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "NeighbourShare AI Demand Prediction Service",
        "model_loaded": ml_model is not None,
        "historical_records": len(demand_history_df) if demand_history_df is not None else 0,
        "supported_categories": EQUIPMENT_CATEGORIES,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/model-info")
def get_model_info():
    if not ml_model:
        raise HTTPException(status_code=503, detail="Model is not loaded")

    regressor = ml_model.named_steps.get("regressor", None)
    regressor_params = {}
    if regressor:
        regressor_params = {
            "n_estimators": len(regressor.estimators_),
            "max_depth": regressor.max_depth,
            "min_samples_leaf": regressor.min_samples_leaf,
            "random_state": regressor.random_state
        }

    return {
        "project": model_metadata.get("project", "NeighbourShare"),
        "model_architecture": model_metadata.get("model", "Random Forest Regressor"),
        "target": model_metadata.get("target", "Daily equipment rental demand"),
        "features": model_metadata.get("features", []),
        "evaluation_metrics": {
            "MAE": model_metadata.get("MAE", 1.165),
            "RMSE": model_metadata.get("RMSE", 1.937),
            "R2": model_metadata.get("R2", 0.511)
        },
        "sklearn_version": model_metadata.get("sklearn_version", "1.6.1"),
        "regressor_hyperparameters": regressor_params,
        "categories": EQUIPMENT_CATEGORIES
    }


def compute_category_forecast(cat: str, days: int = 7):
    """
    Computes iterative multi-step forecast using the actual trained Random Forest model.
    Lag features (Lag_1, Lag_7, Lag_14, Lag_28) and Rolling Means (7, 28)
    are calculated dynamically from history and recursive predictions.
    """
    cat_df = demand_history_df[demand_history_df["Category"] == cat].copy()
    cat_df = cat_df.sort_values("Rental Date").reset_index(drop=True)

    # Historical demand series as a list of floats
    demands = list(cat_df["Demand"].astype(float).values)
    dates = list(cat_df["Rental Date"].values)
    last_date = pd.to_datetime(dates[-1])

    forecast_results = []

    # Current forecast date starts the day after the last historical date
    # (or relative to now if desired, but using consecutive calendar logic)
    for day_offset in range(1, days + 1):
        target_date = last_date + timedelta(days=day_offset)

        # Feature calculation strictly matching model training logic
        day_of_week = target_date.dayofweek
        month = target_date.month
        day_of_year = target_date.dayofyear
        is_weekend = 1 if day_of_week >= 5 else 0

        # Lags from the end of the demands list
        lag_1 = demands[-1]
        lag_7 = demands[-7] if len(demands) >= 7 else demands[-1]
        lag_14 = demands[-14] if len(demands) >= 14 else demands[-1]
        lag_28 = demands[-28] if len(demands) >= 28 else demands[-1]

        # Rolling means
        rolling_7 = float(np.mean(demands[-7:]))
        rolling_28 = float(np.mean(demands[-28:]))

        row_dict = {
            "Category": cat,
            "Day_of_Week": day_of_week,
            "Month": month,
            "Day_of_Year": day_of_year,
            "Is_Weekend": is_weekend,
            "Lag_1": lag_1,
            "Lag_7": lag_7,
            "Lag_14": lag_14,
            "Lag_28": lag_28,
            "Rolling_Mean_7": rolling_7,
            "Rolling_Mean_28": rolling_28
        }

        X_step = pd.DataFrame([row_dict])
        
        # Predict using trained model
        pred_val = float(ml_model.predict(X_step)[0])
        # Demand cannot be negative
        pred_clean = max(0.0, round(pred_val, 2))

        # Append prediction to series for subsequent lag steps (autoregressive loop)
        demands.append(pred_clean)

        forecast_results.append({
            "date": target_date.strftime("%Y-%m-%d"),
            "dayName": target_date.strftime("%A"),
            "category": cat,
            "predictedDemand": pred_clean,
            "isWeekend": bool(is_weekend),
            "featuresUsed": {
                "dayOfWeek": int(day_of_week),
                "month": int(month),
                "dayOfYear": int(day_of_year),
                "lag1": round(lag_1, 2),
                "lag7": round(lag_7, 2),
                "rolling7": round(rolling_7, 2)
            }
        })

    return forecast_results


@app.post("/predict/forecast")
def predict_forecast(req: ForecastRequest):
    if not ml_model or demand_history_df is None:
        raise HTTPException(status_code=503, detail="Model or historical data not loaded")

    days = max(1, min(req.days, 30))

    if req.category != "All" and req.category not in EQUIPMENT_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category '{req.category}'. Must be one of {EQUIPMENT_CATEGORIES} or 'All'."
        )

    categories_to_run = EQUIPMENT_CATEGORIES if req.category == "All" else [req.category]

    category_forecasts = {}
    for cat in categories_to_run:
        category_forecasts[cat] = compute_category_forecast(cat, days)

    # Build aggregated daily totals
    daily_aggregated = []
    for day_idx in range(days):
        sample_entry = category_forecasts[categories_to_run[0]][day_idx]
        date_str = sample_entry["date"]
        day_name = sample_entry["dayName"]

        cat_breakdown = {}
        day_total = 0.0

        for cat in categories_to_run:
            val = category_forecasts[cat][day_idx]["predictedDemand"]
            cat_breakdown[cat] = val
            day_total += val

        daily_aggregated.append({
            "date": date_str,
            "dayName": day_name,
            "totalDemand": round(day_total, 2),
            "isWeekend": sample_entry["isWeekend"],
            "breakdown": cat_breakdown
        })

    return {
        "category": req.category,
        "forecastDays": days,
        "dailyForecast": daily_aggregated,
        "categoryDetails": category_forecasts,
        "disclaimer": "Predictions generated by trained Random Forest model based on historical patterns. Not a guarantee of equipment availability."
    }


@app.get("/predict/summary")
def get_predict_summary():
    """
    Returns high-level summary for the dashboard:
    - 7-day total predicted demand
    - Category-wise demand comparison
    - Highest demand category
    - Actual AI-generated insights
    """
    if not ml_model or demand_history_df is None:
        raise HTTPException(status_code=503, detail="Model or data not ready")

    seven_day_by_cat = {}
    cat_totals = {}

    for cat in EQUIPMENT_CATEGORIES:
        forecast = compute_category_forecast(cat, days=7)
        seven_day_by_cat[cat] = forecast
        cat_totals[cat] = round(sum(f["predictedDemand"] for f in forecast), 2)

    total_7_day_demand = round(sum(cat_totals.values()), 2)
    highest_category = max(cat_totals.items(), key=lambda x: x[1])

    # Dynamic AI insights derived from the model output
    insights = []
    
    # 1. Top category insight
    pct_top = round((highest_category[1] / max(1.0, total_7_day_demand)) * 100, 1)
    insights.append(
        f"Highest Demand Category: '{highest_category[0]}' accounts for {pct_top}% ({highest_category[1]} units) of total 7-day predicted rentals."
    )

    # 2. Weekend vs Weekday analysis across predictions
    weekend_demand = 0.0
    weekday_demand = 0.0
    for cat, items in seven_day_by_cat.items():
        for item in items:
            if item["isWeekend"]:
                weekend_demand += item["predictedDemand"]
            else:
                weekday_demand += item["predictedDemand"]

    if weekend_demand > 0 and weekday_demand > 0:
        avg_weekend = weekend_demand / 2.0
        avg_weekday = weekday_demand / 5.0
        if avg_weekend > avg_weekday:
            diff_pct = round(((avg_weekend - avg_weekday) / avg_weekday) * 100, 1)
            insights.append(
                f"Weekend Surge Detected: Daily weekend demand averages {round(avg_weekend, 1)} units vs {round(avg_weekday, 1)} on weekdays (+{diff_pct}% increase)."
            )
        else:
            insights.append(
                f"Steady Weekday Usage: Equipment demand remains consistent throughout the work week with an average of {round(avg_weekday, 1)} daily rentals."
            )

    # 3. Model performance reminder
    insights.append(
        f"Consensus Confidence: Model validated with Mean Absolute Error (MAE) of {model_metadata.get('MAE', 1.17):.2f} units and R² score of {model_metadata.get('R2', 0.51):.3f} across historical test splits."
    )

    # Aggregated 7-day timeline
    timeline = []
    for day_idx in range(7):
        sample = seven_day_by_cat[EQUIPMENT_CATEGORIES[0]][day_idx]
        day_total = sum(seven_day_by_cat[cat][day_idx]["predictedDemand"] for cat in EQUIPMENT_CATEGORIES)
        timeline.append({
            "date": sample["date"],
            "dayName": sample["dayName"],
            "totalDemand": round(day_total, 2),
            "isWeekend": sample["isWeekend"],
            **{cat: seven_day_by_cat[cat][day_idx]["predictedDemand"] for cat in EQUIPMENT_CATEGORIES}
        })

    return {
        "totalPredictedDemand7Days": total_7_day_demand,
        "highestDemandCategory": {
            "name": highest_category[0],
            "units": highest_category[1],
            "percentage": pct_top
        },
        "categoryTotals": cat_totals,
        "timeline": timeline,
        "insights": insights,
        "modelMeta": model_metadata
    }


@app.get("/historical/comparison")
def get_historical_comparison(
    category: str = Query("Heater", description="Category to compare"),
    days: int = Query(21, description="Number of recent historical days to compare")
):
    """
    Returns actual vs predicted values for a historical slice so users
    can verify model accuracy directly on real data.
    """
    if demand_history_df is None or ml_model is None:
        raise HTTPException(status_code=503, detail="Data not loaded")

    if category not in EQUIPMENT_CATEGORIES:
        category = "Heater"

    cat_df = demand_history_df[demand_history_df["Category"] == category].copy()
    cat_df = cat_df.sort_values("Rental Date").reset_index(drop=True)

    # Feature engineering matching training
    cat_df["Day_of_Week"] = cat_df["Rental Date"].dt.dayofweek
    cat_df["Month"] = cat_df["Rental Date"].dt.month
    cat_df["Day_of_Year"] = cat_df["Rental Date"].dt.dayofyear
    cat_df["Is_Weekend"] = (cat_df["Day_of_Week"] >= 5).astype(int)

    for lag in [1, 7, 14, 28]:
        cat_df[f"Lag_{lag}"] = cat_df["Demand"].shift(lag)

    cat_df["Rolling_Mean_7"] = cat_df["Demand"].shift(1).rolling(7).mean()
    cat_df["Rolling_Mean_28"] = cat_df["Demand"].shift(1).rolling(28).mean()

    cat_df = cat_df.dropna().reset_index(drop=True)
    sample_df = cat_df.tail(days).copy()

    features = [
        "Category", "Day_of_Week", "Month", "Day_of_Year", "Is_Weekend",
        "Lag_1", "Lag_7", "Lag_14", "Lag_28", "Rolling_Mean_7", "Rolling_Mean_28"
    ]

    preds = ml_model.predict(sample_df[features])

    records = []
    for idx, (_, row) in enumerate(sample_df.iterrows()):
        records.append({
            "date": row["Rental Date"].strftime("%Y-%m-%d"),
            "actual": int(row["Demand"]),
            "predicted": round(float(max(0.0, preds[idx])), 2),
            "category": category
        })

    # Summary error calculation
    actuals = np.array([r["actual"] for r in records])
    predictions = np.array([r["predicted"] for r in records])
    slice_mae = round(float(np.mean(np.abs(actuals - predictions))), 2)

    return {
        "category": category,
        "sampleDays": len(records),
        "sliceMAE": slice_mae,
        "data": records
    }


@app.post("/transactions/ingest")
def ingest_live_transaction(req: TransactionIngestRequest):
    """
    Safely captures completed or active borrowing transactions from NeighbourShare.
    Rules:
    - Excludes Cancelled and Rejected requests.
    - Saves separately from the original construction equipment training records
      to avoid contaminating ground-truth distribution without a retraining pipeline.
    """
    if req.status.lower() in ["cancelled", "rejected"]:
        return {
            "status": "ignored",
            "reason": f"Request status '{req.status}' excluded from demand training updates."
        }

    mapped_category = HOUSEHOLD_TO_ML_MAPPING.get(req.category, "Pipe pressing machine")

    tx_entry = {
        "id": req.id,
        "equipmentId": req.equipmentId,
        "equipmentName": req.equipmentName,
        "originalCategory": req.category,
        "mappedMLCategory": mapped_category,
        "status": req.status,
        "startDate": req.startDate,
        "endDate": req.endDate,
        "fee": req.calculatedFee,
        "ingestedAt": datetime.utcnow().isoformat()
    }

    # Persist safely in staging file
    existing = []
    if os.path.exists(LIVE_TX_PATH):
        try:
            with open(LIVE_TX_PATH, "r") as f:
                existing = json.load(f)
        except Exception:
            existing = []

    # Avoid duplicate ingest
    if not any(item.get("id") == req.id for item in existing):
        existing.append(tx_entry)
        with open(LIVE_TX_PATH, "w") as f:
            json.dump(existing, f, indent=2)

    return {
        "status": "ingested",
        "stagedCount": len(existing),
        "mappedCategory": mapped_category,
        "message": "Transaction safely captured in ML staging buffer. Preserved training boundary."
    }
