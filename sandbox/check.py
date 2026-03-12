"""
Sandbox script to validate the core backend pipeline.

Run from the repo root:
    python sandbox/check.py

What it checks (in order):
1) Fetch OHLCV historical data with yfinance
2) Prepare/clean the data for plotting
3) Generate matplotlib figures (price + moving average)
4) Save plots to PNG so you can verify output
"""

from __future__ import annotations

import os
import sys
from pathlib import Path


def _ensure_repo_on_syspath() -> None:
    """
    Ensure the repository root is importable.

    This allows running `python sandbox/check.py` without needing to install
    the project as a package.
    """

    repo_root = Path(__file__).resolve().parents[1]
    if str(repo_root) not in sys.path:
        sys.path.insert(0, str(repo_root))


def _configure_writable_runtime_dirs() -> None:
    """
    Configure cache/temp directories to be writable.

    Some third-party libraries (including yfinance dependencies) may try to
    write to user cache locations (e.g. ~/.cache). When running inside
    restricted environments, that path can be read-only.
    """
    base_dir = Path(__file__).resolve().parent / "output" / "_runtime"
    base_dir.mkdir(parents=True, exist_ok=True)

    # Common standards respected by many Python libraries.
    os.environ.setdefault("XDG_CACHE_HOME", str(base_dir / "cache"))
    os.environ.setdefault("XDG_CONFIG_HOME", str(base_dir / "config"))
    os.environ.setdefault("XDG_DATA_HOME", str(base_dir / "data"))
    os.environ.setdefault("TMPDIR", str(base_dir / "tmp"))

    # Ensure these directories exist.
    Path(os.environ["XDG_CACHE_HOME"]).mkdir(parents=True, exist_ok=True)
    Path(os.environ["XDG_CONFIG_HOME"]).mkdir(parents=True, exist_ok=True)
    Path(os.environ["XDG_DATA_HOME"]).mkdir(parents=True, exist_ok=True)
    Path(os.environ["TMPDIR"]).mkdir(parents=True, exist_ok=True)

    # Fallback for libraries that still rely on HOME.
    os.environ.setdefault("HOME", str(base_dir / "home"))
    Path(os.environ["HOME"]).mkdir(parents=True, exist_ok=True)


def main() -> int:
    """
    Execute the sandbox validation.

    Prints basic diagnostics and writes PNG plots into `sandbox/output/`.
    """

    _ensure_repo_on_syspath()
    _configure_writable_runtime_dirs()

    # Use a non-interactive backend to work in headless environments.
    import matplotlib

    matplotlib.use("Agg")

    from data.downloader import fetch_stock_data
    from data.processing import prepare_price_data
    from plots.stock_plots import plot_moving_average, plot_price_history

    ticker = "AAPL"
    start_date = "2020-01-01"
    end_date = "2020-12-31"
    interval = "1d"

    print("Fetching data...")
    raw_df = fetch_stock_data(
        ticker=ticker,
        start_date=start_date,
        end_date=end_date,
        interval=interval,
    )
    print(f"- fetched rows: {len(raw_df)} | columns: {list(raw_df.columns)}")

    print("Preparing data...")
    df = prepare_price_data(raw_df)
    print(
        f"- prepared rows: {len(df)} | "
        f"timestamp range: {df['timestamp'].min()} -> {df['timestamp'].max()}"
    )

    print("Generating plots...")
    fig_price = plot_price_history(df, ticker=ticker)
    fig_ma = plot_moving_average(df, ticker=ticker, window=20)

    out_dir = Path(__file__).resolve().parent / "output"
    out_dir.mkdir(parents=True, exist_ok=True)

    price_path = out_dir / f"{ticker}_{start_date}_{end_date}_price.png"
    ma_path = out_dir / f"{ticker}_{start_date}_{end_date}_ma20.png"

    fig_price.savefig(price_path, dpi=150, bbox_inches="tight")
    fig_ma.savefig(ma_path, dpi=150, bbox_inches="tight")

    print("Saved plots:")
    print(f"- {price_path}")
    print(f"- {ma_path}")
    print("OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

