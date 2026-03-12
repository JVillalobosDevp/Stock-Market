Stock-Market
----
This project present a web page focus on stock market with predicctions.

## Backend market data and plots

The backend contains a small, modular pipeline to:

- **Fetch historical OHLCV data** using `yfinance`.
- **Process and clean the data** to obtain plot‑ready time series.
- **Generate matplotlib figures** for price history and moving averages.

### 1. Fetch stock data

Main function (interface for the web layer) lives in `data/downloader.py`:

```python
from data.downloader import fetch_stock_data

df = fetch_stock_data(
    ticker="AAPL",
    start_date="2020-01-01",
    end_date="2020-12-31",
    interval="1d",
)

# Returned DataFrame columns:
# - timestamp (UTC)
# - open
# - high
# - low
# - close
# - volume
```

### 2. Process data for plotting

Utility functions for cleaning and transforming data live in `data/processing.py`:

- **prepare_price_data(df)**: converts `timestamp` to UTC, removes missing values, and ensures correct time ordering.
- **add_moving_average(df, window, price_column="close")**: adds a simple moving average column.
- **normalize_series(df, column, method="minmax" | "zscore")**: normalizes a numeric column.
- **resample_ohlcv(df, rule)**: resamples OHLCV data to another interval (e.g. `"1W"`, `"1M"`).

These helpers operate on pandas DataFrames and keep the original data immutable by returning new DataFrames.

### 3. Plotting utilities

Plot functions live in `plots/stock_plots.py` and use matplotlib:

```python
from data.downloader import fetch_stock_data
from plots.stock_plots import (
    plot_price_history,
    plot_moving_average,
)

ticker = "AAPL"
df = fetch_stock_data(
    ticker=ticker,
    start_date="2020-01-01",
    end_date="2020-12-31",
    interval="1d",
)

# Price history figure
fig_price = plot_price_history(df, ticker=ticker)

# Price + moving average figure
fig_ma = plot_moving_average(df, ticker=ticker, window=20)
```

Both functions return a matplotlib `Figure` object that can be:

- Rendered directly in a local session using `plt.show()`.
- Exported to an image buffer (PNG, SVG, etc.) in an API endpoint.

The design is intentionally modular so that, in the future, it can be extended to:

- Handle **multiple tickers** in a single plot.
- Include technical indicators such as **RSI** or **MACD**.
- Integrate **real‑time streaming data**.
- Add **caching** or **database storage** behind the data retrieval layer.
