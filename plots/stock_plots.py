from __future__ import annotations

from typing import Optional

import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import pandas as pd
from matplotlib.figure import Figure

from data.processing import (
    add_moving_average,
    prepare_price_data,
)


def _configure_time_axis(ax: plt.Axes) -> None:
    """
    Aplica un formato legible al eje temporal de una gráfica.

    Esta función configura el formateador y la rotación de las etiquetas
    de fecha para mejorar la legibilidad en gráficos de series temporales.
    """
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%Y-%m-%d"))
    ax.xaxis.set_major_locator(mdates.AutoDateLocator())
    for label in ax.get_xticklabels():
        label.set_rotation(45)
        label.set_horizontalalignment("right")


def plot_price_history(
    df: pd.DataFrame,
    ticker: str,
    ax: Optional[plt.Axes] = None,
) -> Figure:
    """
    Genera una gráfica de la historia de precios de cierre para un ticker.

    Devuelve un objeto ``Figure`` de matplotlib que puede ser renderizado
    a PNG o insertado en la respuesta de la API.
    """
    prepared = prepare_price_data(df)
    fig: Figure
    if ax is None:
        fig, ax = plt.subplots(figsize=(10, 5))
    else:
        fig = ax.figure

    ax.plot(prepared["timestamp"], prepared["close"], label="Precio cierre")

    ax.set_title(f"Histórico de precios - {ticker}")
    ax.set_xlabel("Fecha (UTC)")
    ax.set_ylabel("Precio de cierre")
    ax.legend()
    ax.grid(True, linestyle="--", alpha=0.3)

    _configure_time_axis(ax)
    fig.tight_layout()
    return fig


def plot_moving_average(
    df: pd.DataFrame,
    ticker: str,
    window: int = 20,
    ax: Optional[plt.Axes] = None,
) -> Figure:
    """
    Genera una gráfica de precios que incluye una media móvil simple.

    El DataFrame de entrada debe contener datos OHLCV estándar con una
    columna ``timestamp`` y una columna ``close``.
    """
    base = prepare_price_data(df)
    with_ma = add_moving_average(base, window=window, price_column="close")
    ma_column = f"close_ma_{window}"

    fig: Figure
    if ax is None:
        fig, ax = plt.subplots(figsize=(10, 5))
    else:
        fig = ax.figure

    ax.plot(with_ma["timestamp"], with_ma["close"], label="Precio cierre")
    ax.plot(
        with_ma["timestamp"],
        with_ma[ma_column],
        label=f"Media móvil {window} días",
    )

    ax.set_title(f"Precio y media móvil ({window}) - {ticker}")
    ax.set_xlabel("Fecha (UTC)")
    ax.set_ylabel("Precio de cierre")
    ax.legend()
    ax.grid(True, linestyle="--", alpha=0.3)

    _configure_time_axis(ax)
    fig.tight_layout()
    return fig


def example_usage_aapl() -> None:
    """
    Demostración mínima de uso para AAPL.

    Esta función no se utiliza en el flujo principal del proyecto, pero
    puede ejecutarse manualmente desde la línea de comandos para
    verificar que el pipeline de descarga, procesamiento y graficación
    funciona correctamente.
    """
    from data.downloader import fetch_stock_data

    ticker = "AAPL"
    df = fetch_stock_data(
        ticker=ticker,
        start_date="2020-01-01",
        end_date="2020-12-31",
        interval="1d",
    )

    plot_price_history(df, ticker=ticker)
    plot_moving_average(df, ticker=ticker, window=20)
    plt.show()


if __name__ == "__main__":  # pragma: no cover - utilidad manual
    example_usage_aapl()

