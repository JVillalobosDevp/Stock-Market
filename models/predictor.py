from typing import Optional

import numpy as np
import pandas as pd

from prediccion_acciones.data.downloader import download_price_history
from prediccion_acciones.features.engineering import add_return_features
from prediccion_acciones.models.trainer import load_model


def predict_future_return(
    model_path: str = "rf_returns.joblib",
    ticker: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> float:
    """
    Usa un modelo entrenado para predecir el rendimiento futuro más reciente disponible.

    Devuelve un escalar con la predicción de rendimiento (por ejemplo, 0.05 = +5%).
    """
    price_df = download_price_history(
        ticker=ticker,
        start_date=start_date,
        end_date=end_date,
    )

    X, _ = add_return_features(price_df)
    if X.empty:
        raise ValueError("No hay suficientes datos para generar características.")

    model = load_model(model_path)
    latest_features = X.iloc[[-1]]  # última fila como muestra
    predicted_return: np.ndarray = model.predict(latest_features)
    return float(predicted_return[0])

