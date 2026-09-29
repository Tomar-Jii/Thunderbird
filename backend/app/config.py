from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "StormSight AI"
    VERSION: str = "1.4.2"
    PROBLEM_STATEMENT: str = "SIH26072"
    ORGANIZATION: str = "Ministry of Earth Sciences / India Meteorological Department"
    API_V1_PREFIX: str = "/api/v1"
    MODE: str = "DEMO"
    CORS_ORIGINS: List[str] = ["*"]
    SURVEILLANCE_REGION: str = "Central India (Madhya Pradesh)"
    DEFAULT_LEAD_TIME_MINUTES: int = 120

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
