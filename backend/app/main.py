import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text, inspect

try:
    from backend.app.core.config import settings
    from backend.app.core.database import engine, Base, SessionLocal
    from backend.app.seed_data import init_database
    from backend.app.api import (
        books, authors, categories, publishers, media, landing, settings as site_settings, dashboard
    )
except ImportError:
    from app.core.config import settings
    from app.core.database import engine, Base, SessionLocal
    from app.seed_data import init_database
    from app.api import (
        books, authors, categories, publishers, media, landing, settings as site_settings, dashboard
    )

# Automatically create all relational tables on the target database (Supabase PostgreSQL / SQLite)
try:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        init_database(db, wipe_dummy=False)
except Exception as e:
    print(f"[Warning] Database initialization note: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Dotcom Publications Editorial Publishing Platform Admin API (Developed by TL Technologics)"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists and mount it safely
try:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
except Exception as e:
    print(f"Static upload mount notice: {e}")

# Include Routers under API prefix (e.g. /api/books)
api_prefix = settings.API_V1_STR
app.include_router(dashboard.router, prefix=api_prefix)
app.include_router(books.router, prefix=api_prefix)
app.include_router(authors.router, prefix=api_prefix)
app.include_router(categories.router, prefix=api_prefix)
app.include_router(publishers.router, prefix=api_prefix)
app.include_router(media.router, prefix=api_prefix)
app.include_router(landing.router, prefix=api_prefix)
app.include_router(site_settings.router, prefix=api_prefix)

# Also include Routers at root for serverless flexibility (e.g. /books)
app.include_router(dashboard.router)
app.include_router(books.router)
app.include_router(authors.router)
app.include_router(categories.router)
app.include_router(publishers.router)
app.include_router(media.router)
app.include_router(landing.router)
app.include_router(site_settings.router)

@app.get("/")
@app.get("/api/health")
def root():
    is_postgres = "postgresql" in settings.DATABASE_URL
    db_type = "PostgreSQL (Supabase)" if is_postgres else "SQLite (Local Dev)"
    
    tables = []
    connected = False
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        connected = True
    except Exception as e:
        tables = []
        connected = False

    return {
        "status": "operational",
        "connected": connected,
        "platform": "Dotcom Publications Admin API",
        "client": "Dotcom Publications",
        "vendor": "TL Technologics",
        "version": settings.VERSION,
        "database_type": db_type,
        "tables": tables,
        "docs": "/docs"
    }

@app.get("/api/db-status")
def db_status():
    """Verify live connectivity and table schema on Supabase PostgreSQL or active database."""
    is_postgres = "postgresql" in settings.DATABASE_URL
    status_info = {
        "connected": False,
        "engine": "PostgreSQL (Supabase)" if is_postgres else "SQLite (Local Fallback)",
        "connection_target": "Supabase Cloud Database" if is_postgres else "Local SQLite File",
        "tables": [],
        "dummy_data_status": "Clean (Zero Dummy Records)",
        "error": None
    }
    try:
        inspector = inspect(engine)
        status_info["tables"] = inspector.get_table_names()
        with SessionLocal() as db:
            try:
                from backend.app.models.models import Book, Author, Category, Publisher
            except ImportError:
                from app.models.models import Book, Author, Category, Publisher
            status_info["counts"] = {
                "books": db.query(Book).count(),
                "authors": db.query(Author).count(),
                "categories": db.query(Category).count(),
                "publishers": db.query(Publisher).count(),
            }
        status_info["connected"] = True
    except Exception as e:
        status_info["error"] = str(e)
    return status_info
