from __future__ import annotations

from typing import Literal

import pandas as pd


def prepare_price_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Limpia y estandariza un DataFrame de precios para su uso en gráficas.

    - Asegura la existencia de una columna ``timestamp``.
    - Convierte la columna de tiempo a tipo datetime y la normaliza a UTC.
    - Ordena los registros cronológicamente.
    - Elimina filas con valores faltantes críticos.
    """
    if "timestamp" not in df.columns:
        msg = "El DataFrame debe contener una columna 'timestamp' para poder graficar."
        raise ValueError(msg)

    cleaned = df.copy()
    cleaned["timestamp"] = pd.to_datetime(cleaned["timestamp"], utc=True)
    cleaned = cleaned.sort_values("timestamp")

    critical_cols = ["open", "high", "low", "close", "volume"]
    cols_to_check = [c for c in critical_cols if c in cleaned.columns]
    cleaned = cleaned.dropna(subset=["timestamp", *cols_to_check])

    cleaned = cleaned.reset_index(drop=True)
    return cleaned


def add_moving_average(
    df: pd.DataFrame,
    window: int,
    price_column: str = "close",
    ma_column: str | None = None,
) -> pd.DataFrame:
    """
    Añade una media móvil simple (SMA) sobre una columna de precios.

    La función no modifica el DataFrame original, sino que devuelve
    una copia con la nueva columna.
    """
    if price_column not in df.columns:
        msg = f"La columna de precio '{price_column}' no está presente en el DataFrame."
        raise ValueError(msg)

    result = df.copy()
    column_name = ma_column or f"{price_column}_ma_{window}"
    result[column_name] = result[price_column].rolling(window=window).mean()
    return result


def normalize_series(
    df: pd.DataFrame,
    column: str,
    method: Literal["minmax", "zscore"] = "minmax",
    normalized_column: str | None = None,
) -> pd.DataFrame:
    """
    Normaliza una columna numérica para facilitar comparaciones en gráficas.

    - ``minmax``: escala a [0, 1].
    - ``zscore``: resta la media y divide por la desviación estándar.
    """
    if column not in df.columns:
        raise ValueError(f"La columna '{column}' no está presente en el DataFrame.")

    result = df.copy()
    target_col = normalized_column or f"{column}_norm_{method}"

    series = result[column].astype("float64")
    if method == "minmax":
        min_val = series.min()
        max_val = series.max()
        if max_val == min_val:
            result[target_col] = 0.0
        else:
            result[target_col] = (series - min_val) / (max_val - min_val)
    elif method == "zscore":
        mean = series.mean()
        std = series.std(ddof=0)
        if std == 0:
            result[target_col] = 0.0
        else:
            result[target_col] = (series - mean) / std
    else:
        raise ValueError(f"Método de normalización no soportado: {method!r}")

    return result


def resample_ohlcv(
    df: pd.DataFrame,
    rule: str,
) -> pd.DataFrame:
    """
    Re-muestrea datos OHLCV a un intervalo temporal diferente.

    El DataFrame de entrada debe tener una columna ``timestamp`` que
    será utilizada como índice temporal para el re-muestreo.
    """
    required_cols = {"open", "high", "low", "close", "volume"}
    missing = required_cols.difference(df.columns)
    if missing:
        raise ValueError(
            f"No se puede re-muestrear porque faltan columnas OHLCV: {missing}"
        )

    working = prepare_price_data(df).set_index("timestamp")

    ohlcv_agg = {
        "open": "first",
        "high": "max",
        "low": "min",
        "close": "last",
        "volume": "sum",
    }
    resampled = working.resample(rule).agg(ohlcv_agg).dropna(how="any")

    resampled = resampled.reset_index()
    resampled = resampled.rename(columns={"timestamp": "timestamp"})
    return resampled

