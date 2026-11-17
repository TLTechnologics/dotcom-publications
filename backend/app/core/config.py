import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Dotcom Publications Admin API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    # Supports PostgreSQL if configured (e.g. postgresql://user:password@localhost:5432/dotcom_db),
    # falls back to SQLite for seamless zero-setup persistence
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./dotcom_publications.db")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"]

settings = Settings()
