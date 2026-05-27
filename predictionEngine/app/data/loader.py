from sqlalchemy import create_engine, text
import pandas as pd

from app.config import DATABASE_URL

engine = create_engine(DATABASE_URL)

PREDICTIONS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(10) NOT NULL,
    region VARCHAR(100),
    lat DOUBLE PRECISION,
    long DOUBLE PRECISION,
    predicted_date DATE NOT NULL,
    value DOUBLE PRECISION,
    confidence_lower DOUBLE PRECISION,
    confidence_upper DOUBLE PRECISION,
    model_name VARCHAR(100),
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);
"""


def init_db():
    with engine.begin() as conn:
        conn.execute(text(PREDICTIONS_TABLE_SQL))


def load_fires() -> pd.DataFrame:
    query = """
        SELECT year, month, day, district, lat, long
        FROM fires
        WHERE year IS NOT NULL AND district IS NOT NULL
    """
    return pd.read_sql(query, engine)


def load_rains() -> pd.DataFrame:
    query = """
        SELECT year, city, precipitation_mm, lat, long
        FROM rains
        WHERE year IS NOT NULL AND city IS NOT NULL
    """
    return pd.read_sql(query, engine)


def save_predictions(rows: list[dict]):
    insert_sql = """
        INSERT INTO predictions
            (type, region, lat, long, predicted_date, value,
             confidence_lower, confidence_upper, model_name, model_version, metadata)
        VALUES
            (:type, :region, :lat, :long, :predicted_date, :value,
             :confidence_lower, :confidence_upper, :model_name, :model_version, :metadata::jsonb)
    """
    with engine.begin() as conn:
        conn.execute(text(insert_sql), rows)
