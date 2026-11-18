import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env file from project root or backend directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_paths = [
    BASE_DIR / ".env",
    BASE_DIR.parent / ".env",
    Path(".env")
]
for p in env_paths:
    if p.exists():
        load_dotenv(p, override=True)
        break
else:
    load_dotenv()

def normalize_database_url(raw_url: str) -> str:
    if not raw_url:
        return "sqlite:///./dotcom_publications.db"
    # Supabase gives postgres:// or postgresql://
    # SQLAlchemy 1.4+ requires postgresql:// or postgresql+psycopg2://
    if raw_url.startswith("postgres://"):
        return raw_url.replace("postgres://", "postgresql+psycopg2://", 1)
    if raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+"):
        return raw_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return raw_url

class Settings(BaseModel):
    PROJECT_NAME: str = "Dotcom Publications Admin API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Supabase PostgreSQL connection string (defaults to SQLite if not provided)
    RAW_DATABASE_URL: str = os.getenv("SUPABASE_DATABASE_URL", os.getenv("DATABASE_URL", ""))
    DATABASE_URL: str = normalize_database_url(os.getenv("SUPABASE_DATABASE_URL", os.getenv("DATABASE_URL", "")))
    
    # Supabase Storage & API credentials (optional for cloud storage uploads)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", os.getenv("SUPABASE_ANON_KEY", os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")))
    SUPABASE_STORAGE_BUCKET: str = os.getenv("SUPABASE_STORAGE_BUCKET", "media")

    # In serverless Vercel environment, local files can only be written to /tmp
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "/tmp/uploads" if os.getenv("VERCEL") else "uploads")
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"]

settings = Settings()
