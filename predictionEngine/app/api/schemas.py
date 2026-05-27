from datetime import date, datetime

from pydantic import BaseModel


class FirePredictionOut(BaseModel):
    district: str
    lat: float | None = None
    long: float | None = None
    date: str
    predicted_count: float
    confidence_lower: float
    confidence_upper: float


class RainPredictionOut(BaseModel):
    city: str
    lat: float | None = None
    long: float | None = None
    date: str
    predicted_precipitation_mm: float
    confidence_lower: float
    confidence_upper: float


class FirePredictionsResponse(BaseModel):
    predictions: list[FirePredictionOut]
    model_name: str
    model_version: str
    generated_at: datetime


class RainPredictionsResponse(BaseModel):
    predictions: list[RainPredictionOut]
    model_name: str
    model_version: str
    generated_at: datetime


class TrainResponse(BaseModel):
    status: str
    model_type: str
    regions_trained: list[str]
    model_version: str


class ModelInfo(BaseModel):
    name: str
    type: str
    region: str
    version: str | None = None
    trained_at: str | None = None


class ModelsListResponse(BaseModel):
    models: list[ModelInfo]


class HealthResponse(BaseModel):
    status: str
    fire_models_loaded: int
    rain_models_loaded: int
