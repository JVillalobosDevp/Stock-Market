from pathlib import Path
from typing import Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split

from prediccion_acciones.config import config


def train_model(
    X: pd.DataFrame,
    y: pd.Series,
    test_size: float = 0.2,
    random_state: int = 42,
) -> Tuple[RandomForestRegressor, float]:
    """
    Entrena un modelo de regresión para predecir rendimientos futuros.

    Devuelve el modelo entrenado y el RMSE en el conjunto de prueba.
    """
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, shuffle=False
    )

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=None,
        random_state=random_state,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    rmse = mean_squared_error(y_test, y_pred, squared=False)
    return model, rmse


def save_model(model: RandomForestRegressor, filename: str = "rf_returns.joblib") -> Path:
    """Guarda el modelo entrenado en disco."""
    models_dir = Path(config.models_folder)
    models_dir.mkdir(parents=True, exist_ok=True)
    path = models_dir / filename
    joblib.dump(model, path)
    return path


def load_model(filename: str = "rf_returns.joblib") -> RandomForestRegressor:
    """Carga un modelo entrenado desde disco."""
    models_dir = Path(config.models_folder)
    path = models_dir / filename
    if not path.exists():
        raise FileNotFoundError(f"No se encontró el archivo de modelo: {path}")
    model: RandomForestRegressor = joblib.load(path)
    return model

