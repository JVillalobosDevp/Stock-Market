from pathlib import Path
from typing import Optional

import pandas as pd
import yfinance as yf

from config import config


def download_price_history(
    ticker: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    interval: str = "1d",
) -> pd.DataFrame:
    """
    Descarga datos históricos de precios desde yfinance.

    Devuelve un DataFrame con índices de fecha y columnas OHLCV.

    Esta función mantiene compatibilidad hacia atrás con el resto del
    proyecto y sirve como punto centralizado para obtener datos crudos
    de precios antes de cualquier procesamiento adicional.
    """
    ticker = ticker or config.ticker
    start_date = start_date or config.start_date
    end_date = end_date or config.end_date

    try:
        data = yf.download(
            ticker,
            start=start_date,
            end=end_date,
            interval=interval,
            auto_adjust=True,
        )
    except Exception as exc:  # pragma: no cover - dependencia externa
        msg = f"Error al descargar datos para {ticker} con yfinance: {exc!r}"
        raise RuntimeError(msg) from exc

    if data.empty:
        raise ValueError(f"No se obtuvieron datos para {ticker}.")

    # Algunas versiones/configuraciones de yfinance devuelven columnas MultiIndex
    # con el ticker como segundo nivel (p.ej. ("Close", "AAPL")).
    if isinstance(data.columns, pd.MultiIndex):
        tickers = set(data.columns.get_level_values(-1))
        if ticker not in tickers:
            raise ValueError(
                f"Se obtuvo un DataFrame con columnas multi-ticker, pero no contiene {ticker!r}. "
                f"Tickers disponibles: {sorted(tickers)}"
            )
        data = data.xs(ticker, axis=1, level=-1, drop_level=True)

    required_cols = {"Open", "High", "Low", "Close", "Volume"}
    if not required_cols.issubset(set(data.columns)):
        raise ValueError(
            f"Los datos descargados no contienen todas las columnas OHLCV requeridas: "
            f"{required_cols}. Columnas obtenidas: {set(data.columns)}"
        )

    return data


def fetch_stock_data(
    ticker: str,
    start_date: str,
    end_date: str,
    interval: str = "1d",
) -> pd.DataFrame:
    """
    Obtiene datos históricos OHLCV listos para graficar.

    Esta función implementa la interfaz solicitada para el backend de la
    aplicación web. Devuelve un DataFrame con las columnas:
    - ``timestamp`` (columna explícita en lugar de índice)
    - ``open``, ``high``, ``low``, ``close``, ``volume``

    Los errores comunes (ticker inválido, problemas de red o dataset
    vacío) se transforman en excepciones con mensajes claros.
    """
    raw_df = download_price_history(
        ticker=ticker,
        start_date=start_date,
        end_date=end_date,
        interval=interval,
    )

    df = raw_df.copy()
    df = df.sort_index()
    df = df.reset_index().rename(
        columns={
            df.index.name or "Date": "timestamp",
            "Open": "open",
            "High": "high",
            "Low": "low",
            "Close": "close",
            "Volume": "volume",
        }
    )

    # Aseguramos presencia y tipo correcto de columnas esperadas.
    expected_columns = {"timestamp", "open", "high", "low", "close", "volume"}
    missing = expected_columns.difference(df.columns)
    if missing:
        raise ValueError(
            f"Faltan columnas requeridas en el DataFrame devuelto: {missing}"
        )

    return df[["timestamp", "open", "high", "low", "close", "volume"]]


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

