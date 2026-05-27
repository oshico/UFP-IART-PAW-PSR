import logging

import pandas as pd
from prophet import Prophet

from app.storage.minio import download_model, upload_model

logger = logging.getLogger(__name__)


class FirePredictor:
    def __init__(self):
        self.models: dict[str, Prophet] = {}

    def train_district(self, district: str, data: pd.DataFrame):
        if len(data) < 2:
            logger.warning("Not enough data for district: %s (%d rows)", district, len(data))
            return None

        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            interval_width=0.80,
        )
        model.fit(data[["ds", "y"]])
        self.models[district] = model
        return model

    def predict_district(
        self, district: str, periods: int, freq: str = "MS"
    ) -> pd.DataFrame:
        model = self.models.get(district)
        if model is None:
            raise ValueError(f"No trained model for district: {district}")

        future = model.make_future_dataframe(periods=periods, freq=freq)
        forecast = model.predict(future)
        return forecast.tail(periods)

    def save(self, district: str, version: str):
        model = self.models.get(district)
        if model is None:
            raise ValueError(f"No model to save for district: {district}")
        upload_model(f"fire/{district}", model, version)

    def load(self, district: str):
        model = download_model(f"fire/{district}")
        if model is not None:
            self.models[district] = model
        return model

    def get_districts(self) -> list[str]:
        return list(self.models.keys())
