from pydantic import BaseSettings, Field
from pathlib import Path


class Settings(BaseSettings):
    environment: str = Field("dev", description="Runtime environment")
    data_dir: Path = Field(Path("data"), description="Base data directory")
    enable_categorizer: bool = Field(True, description="Load product categorizer model")
    enable_detector: bool = Field(True, description="Load receipt detector model")
    enable_visualizer: bool = Field(
        False, description="Enable visual report generation"
    )

    class Config:
        env_prefix = "SR_"
        case_sensitive = False


settings = Settings()
