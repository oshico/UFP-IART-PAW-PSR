import logging

import pandas as pd
from prophet import Prophet

from app.storage.minio import download_model, upload_model

logger = logging.getLogger(__name__)


class RainPredictor:
    def __init__(self):
        self.models: dict[str, Prophet] = {}

    def train_city(self, city: str, data: pd.DataFrame):
        if len(data) < 2:
            logger.warning("Not enough data for city: %s (%d rows)", city, len(data))
            return None

        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
            interval_width=0.80,
        )
        model.fit(data[["ds", "y"]])
        self.models[city] = model
        return model

    def predict_city(
        self, city: str, periods: int, freq: str = "YS"
    ) -> pd.DataFrame:
        model = self.models.get(city)
        if model is None:
            raise ValueError(f"No trained model for city: {city}")

        future = model.make_future_dataframe(periods=periods, freq=freq)
        forecast = model.predict(future)
        return forecast.tail(periods)

    def save(self, city: str, version: str):
        model = self.models.get(city)
        if model is None:
            raise ValueError(f"No model to save for city: {city}")
        upload_model(f"rain/{city}", model, version)

    def load(self, city: str):
        model = download_model(f"rain/{city}")
        if model is not None:
            self.models[city] = model
        return model

    def get_cities(self) -> list[str]:
        return list(self.models.keys())
