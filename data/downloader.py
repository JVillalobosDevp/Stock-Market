from pathlib import Path
from typing import Optional

import pandas as pd
import yfinance as yf

from prediccion_acciones.config import config


def download_price_history(
    ticker: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> pd.DataFrame:
    """
    Descarga datos históricos de precios desde yfinance.

    Devuelve un DataFrame con índices de fecha y columnas OHLCV.
    """
    ticker = ticker or config.ticker
    start_date = start_date or config.start_date
    end_date = end_date or config.end_date

    data = yf.download(ticker, start=start_date, end=end_date, auto_adjust=True)
    if data.empty:
        raise ValueError(f"No se obtuvieron datos para {ticker}.")
    return data


def save_price_history(df: pd.DataFrame, filename: str = "price_history.csv") -> Path:
    """Guarda los datos de precios en la carpeta configurada."""
    data_dir = Path(config.data_folder)
    data_dir.mkdir(parents=True, exist_ok=True)
    path = data_dir / filename
    df.to_csv(path, index=True)
    return path


def load_price_history(filename: str = "price_history.csv") -> pd.DataFrame:
    """Carga datos de precios previamente guardados."""
    data_dir = Path(config.data_folder)
    path = data_dir / filename
    if not path.exists():
        raise FileNotFoundError(f"No se encontró el archivo de datos: {path}")
    return pd.read_csv(path, index_col=0, parse_dates=True)

