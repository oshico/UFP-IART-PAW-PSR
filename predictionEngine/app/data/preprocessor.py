import pandas as pd


def preprocess_fires(df: pd.DataFrame) -> dict[str, pd.DataFrame]:
    if df.empty:
        return {}

    df = df.copy()
    df["ds"] = pd.to_datetime(df[["year", "month", "day"]])
    df["month_start"] = df["ds"].dt.to_period("M").dt.start_time

    result: dict[str, pd.DataFrame] = {}
    for district in df["district"].unique():
        sub = df[df["district"] == district]
        monthly = (
            sub.groupby("month_start")
            .size()
            .reset_index(name="y")
        )
        monthly = monthly.rename(columns={"month_start": "ds"})
        monthly = monthly.sort_values("ds")
        result[district] = monthly

    return result


def preprocess_rains(df: pd.DataFrame) -> dict[str, pd.DataFrame]:
    if df.empty:
        return {}

    df = df.copy()
    df["ds"] = pd.to_datetime(df["year"].astype(str) + "-01-01")
    df = df.rename(columns={"precipitation_mm": "y"})
    df = df[["ds", "y", "city", "lat", "long"]].dropna()

    result: dict[str, pd.DataFrame] = {}
    for city in df["city"].unique():
        city_df = df[df["city"] == city][["ds", "y"]].copy()
        city_df = city_df.sort_values("ds")
        result[city] = city_df

    return result
