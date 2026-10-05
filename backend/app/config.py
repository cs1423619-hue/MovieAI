from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    TMDB_API_KEY: str = ""
    SECRET_KEY: str = "change_me_in_production"
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'movieai.db'}"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
