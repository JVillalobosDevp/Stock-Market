from typing import Tuple

import numpy as np
import pandas as pd

from config import config


def add_return_features(
    df: pd.DataFrame, horizon_days: int | None = None
) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Crea características simples basadas en rendimientos y el objetivo a predecir.

    - Features: rendimientos logarítmicos y medias móviles.
    - Target: rendimiento acumulado futuro en `horizon_days`.
    """
    horizon_days = horizon_days or config.prediction_horizon_days

    df = df.copy()
    df["log_return_1d"] = np.log(df["Close"]).diff()
    df["log_return_5d"] = np.log(df["Close"]).diff(5)
    df["ma_5"] = df["Close"].rolling(window=5).mean()
    df["ma_20"] = df["Close"].rolling(window=20).mean()

    future_price = df["Close"].shift(-horizon_days)
    df["future_return"] = (future_price - df["Close"]) / df["Close"]

    df = df.dropna().copy()

    feature_cols = ["log_return_1d", "log_return_5d", "ma_5", "ma_20"]
    X = df[feature_cols]
    y = df["future_return"]

    return X, y

