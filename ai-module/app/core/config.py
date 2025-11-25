from pathlib import Path
from functools import lru_cache

class Settings:
    BASE_DIR = Path(__file__).resolve().parent.parent.parent

    # Ścieżki danych
    UPLOAD_DIR = BASE_DIR / "data/uploads"
    VISUAL_DIR = BASE_DIR / "data/visualizations"
    MODELS_DIR = BASE_DIR / "src/nlp/models"

    # Konfiguracja API
    API_V1_STR = "/api/v1"
    PROJECT_NAME = "SmartReceipt AI Module"

    MAX_CONCURRENT_REQUESTS = 1 #TODO: change to higher value in production using async workers and bigger GPU resources

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()

settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.VISUAL_DIR.mkdir(parents=True, exist_ok=True)