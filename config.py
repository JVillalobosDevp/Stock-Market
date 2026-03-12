from dataclasses import dataclass
from datetime import date


@dataclass
class ProjectConfig:
    """Configuración básica del proyecto."""

    ticker: str = "AAPL"
    start_date: str = "2015-01-01"
    end_date: str = date.today().strftime("%Y-%m-%d")
    prediction_horizon_days: int = 5  # Horizonte para predecir ganancias
    data_folder: str = "data"
    models_folder: str = "models"


config = ProjectConfig()
