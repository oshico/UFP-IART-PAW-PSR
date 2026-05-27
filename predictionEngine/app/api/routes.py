import logging
from datetime import datetime

from fastapi import APIRouter, HTTPException, Query

from app.api.schemas import (
    FirePredictionOut,
    FirePredictionsResponse,
    HealthResponse,
    ModelInfo,
    ModelsListResponse,
    RainPredictionOut,
    RainPredictionsResponse,
    TrainResponse,
)
from app.data.loader import load_fires, load_rains, save_predictions
from app.data.preprocessor import preprocess_fires, preprocess_rains
from app.models.fire_predictor import FirePredictor
from app.models.rain_predictor import RainPredictor
from app.storage.minio import list_models

logger = logging.getLogger(__name__)

router = APIRouter()

fire_predictor = FirePredictor()
rain_predictor = RainPredictor()


@router.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(
        status="ok",
        fire_models_loaded=len(fire_predictor.get_districts()),
        rain_models_loaded=len(rain_predictor.get_cities()),
    )


@router.post("/train/fires", response_model=TrainResponse)
def train_fires():
    df = load_fires()
    if df.empty:
        raise HTTPException(status_code=400, detail="No fire data found in database")

    series = preprocess_fires(df)
    if not series:
        raise HTTPException(status_code=400, detail="No fire series could be preprocessed")

    version = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    trained: list[str] = []

    for district, data in series.items():
        model = fire_predictor.train_district(district, data)
        if model is not None:
            fire_predictor.save(district, version)
            trained.append(district)

    return TrainResponse(
        status="completed",
        model_type="fire",
        regions_trained=trained,
        model_version=version,
    )


@router.post("/train/rains", response_model=TrainResponse)
def train_rains():
    df = load_rains()
    if df.empty:
        raise HTTPException(status_code=400, detail="No rain data found in database")

    series = preprocess_rains(df)
    if not series:
        raise HTTPException(status_code=400, detail="No rain series could be preprocessed")

    version = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    trained: list[str] = []

    for city, data in series.items():
        model = rain_predictor.train_city(city, data)
        if model is not None:
            rain_predictor.save(city, version)
            trained.append(city)

    return TrainResponse(
        status="completed",
        model_type="rain",
        regions_trained=trained,
        model_version=version,
    )


@router.get("/predictions/fires", response_model=FirePredictionsResponse)
def predict_fires(
    district: str | None = Query(None, description="Filter by district"),
    months: int = Query(12, ge=1, le=60, description="Number of months to predict"),
):
    df = load_fires()
    if df.empty:
        raise HTTPException(status_code=400, detail="No fire data found")

    coords = df.groupby("district")[["lat", "long"]].mean().to_dict("index")

    series = preprocess_fires(df)
    if not series:
        raise HTTPException(status_code=400, detail="No fire series could be preprocessed")

    version = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    predictions: list[FirePredictionOut] = []
    model_name = "prophet_fire_v1"

    districts_to_predict = [district] if district else list(series.keys())

    for dist in districts_to_predict:
        data = series.get(dist)
        if data is None:
            continue

        model = fire_predictor.models.get(dist)
        if model is None:
            model = fire_predictor.load(dist)

        if model is None:
            logger.info("Training new model on the fly for district: %s", dist)
            model = fire_predictor.train_district(dist, data)

        if model is None:
            continue

        forecast = fire_predictor.predict_district(dist, months)

        for _, row in forecast.iterrows():
            pred_date = row["ds"]
            lat = coords.get(dist, {}).get("lat")
            long = coords.get(dist, {}).get("long")

            predictions.append(
                FirePredictionOut(
                    district=dist,
                    lat=lat,
                    long=long,
                    date=str(pred_date.date()),
                    predicted_count=round(max(0, row["yhat"]), 1),
                    confidence_lower=round(max(0, row["yhat_lower"]), 1),
                    confidence_upper=round(max(0, row["yhat_upper"]), 1),
                )
            )

    db_rows = [
        {
            "type": "fire",
            "region": p.district,
            "lat": p.lat,
            "long": p.long,
            "predicted_date": p.date,
            "value": p.predicted_count,
            "confidence_lower": p.confidence_lower,
            "confidence_upper": p.confidence_upper,
            "model_name": model_name,
            "model_version": version,
            "metadata": "{}",
        }
        for p in predictions
    ]
    if db_rows:
        save_predictions(db_rows)

    return FirePredictionsResponse(
        predictions=predictions,
        model_name=model_name,
        model_version=version,
        generated_at=datetime.utcnow(),
    )


@router.get("/predictions/rains", response_model=RainPredictionsResponse)
def predict_rains(
    city: str | None = Query(None, description="Filter by city"),
    years: int = Query(5, ge=1, le=20, description="Number of years to predict"),
):
    df = load_rains()
    if df.empty:
        raise HTTPException(status_code=400, detail="No rain data found")

    coords = df.groupby("city")[["lat", "long"]].mean().to_dict("index")

    series = preprocess_rains(df)
    if not series:
        raise HTTPException(status_code=400, detail="No rain series could be preprocessed")

    version = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    predictions: list[RainPredictionOut] = []
    model_name = "prophet_rain_v1"

    cities_to_predict = [city] if city else list(series.keys())

    for c in cities_to_predict:
        data = series.get(c)
        if data is None:
            continue

        model = rain_predictor.models.get(c)
        if model is None:
            model = rain_predictor.load(c)

        if model is None:
            logger.info("Training new model on the fly for city: %s", c)
            model = rain_predictor.train_city(c, data)

        if model is None:
            continue

        forecast = rain_predictor.predict_city(c, years)

        for _, row in forecast.iterrows():
            pred_date = row["ds"]
            lat = coords.get(c, {}).get("lat")
            long = coords.get(c, {}).get("long")

            predictions.append(
                RainPredictionOut(
                    city=c,
                    lat=lat,
                    long=long,
                    date=str(pred_date.date()),
                    predicted_precipitation_mm=round(max(0, row["yhat"]), 1),
                    confidence_lower=round(max(0, row["yhat_lower"]), 1),
                    confidence_upper=round(max(0, row["yhat_upper"]), 1),
                )
            )

    db_rows = [
        {
            "type": "rain",
            "region": p.city,
            "lat": p.lat,
            "long": p.long,
            "predicted_date": p.date,
            "value": p.predicted_precipitation_mm,
            "confidence_lower": p.confidence_lower,
            "confidence_upper": p.confidence_upper,
            "model_name": model_name,
            "model_version": version,
            "metadata": "{}",
        }
        for p in predictions
    ]
    if db_rows:
        save_predictions(db_rows)

    return RainPredictionsResponse(
        predictions=predictions,
        model_name=model_name,
        model_version=version,
        generated_at=datetime.utcnow(),
    )


@router.get("/models", response_model=ModelsListResponse)
def list_trained_models():
    stored = list_models("models/")

    loaded: list[ModelInfo] = []
    seen = set()

    for m in stored:
        parts = m["name"].split("/", 1)
        if len(parts) == 2:
            model_type, region = parts
        else:
            model_type, region = "unknown", parts[0]
        loaded.append(
            ModelInfo(
                name=m["name"],
                type=model_type,
                region=region,
                trained_at=m["last_modified"],
            )
        )
        seen.add(m["name"])

    for district in fire_predictor.get_districts():
        key = f"fire/{district}"
        if key not in seen:
            loaded.append(ModelInfo(name=key, type="fire", region=district))

    for city in rain_predictor.get_cities():
        key = f"rain/{city}"
        if key not in seen:
            loaded.append(ModelInfo(name=key, type="rain", region=city))

    return ModelsListResponse(models=loaded)
