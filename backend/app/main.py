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
        auth, users, notifications, search,
        books, authors, categories, publishers, media, landing, settings as site_settings, dashboard, orders
    )
except ImportError:
    from app.core.config import settings
    from app.core.database import engine, Base, SessionLocal
    from app.seed_data import init_database
    from app.api import (
        auth, users, notifications, search,
        books, authors, categories, publishers, media, landing, settings as site_settings, dashboard, orders
    )

def run_safe_migrations():
    """Apply non-destructive schema migrations (e.g. adding columns to existing tables)."""
    with engine.connect() as conn:
        # Check and add columns to activity_logs
        for col, ctype in [
            ("user_id", "INTEGER"),
            ("user_name", "VARCHAR(255)"),
            ("ip_address", "VARCHAR(100)")
        ]:
            try:
                conn.execute(text(f"ALTER TABLE activity_logs ADD COLUMN {col} {ctype}"))
                conn.commit()
            except Exception:
                pass

# Automatically create all relational tables and apply migrations
try:
    Base.metadata.create_all(bind=engine)
    run_safe_migrations()
    with SessionLocal() as db:
        init_database(db, wipe_dummy=False)
except Exception as e:
    print(f"[Warning] Database initialization note: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Dotcom Publications Editorial Publishing Platform Admin API (Developed by TL Technologics)"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file uploads mount
try:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
except Exception as e:
    print(f"Static upload mount notice: {e}")

# Include Routers under standard API prefix (/api)
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(users.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)
app.include_router(search.router, prefix=api_prefix)
app.include_router(dashboard.router, prefix=api_prefix)
app.include_router(books.router, prefix=api_prefix)
app.include_router(authors.router, prefix=api_prefix)
app.include_router(categories.router, prefix=api_prefix)
app.include_router(publishers.router, prefix=api_prefix)
app.include_router(media.router, prefix=api_prefix)
app.include_router(landing.router, prefix=api_prefix)
app.include_router(site_settings.router, prefix=api_prefix)
app.include_router(orders.router, prefix=api_prefix)

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
        "counts": {},
        "error": None
    }
    try:
        inspector = inspect(engine)
        status_info["tables"] = inspector.get_table_names()
        with SessionLocal() as db:
            try:
                from backend.app.models.models import Book, Author, Category, Publisher, Order, User
            except ImportError:
                from app.models.models import Book, Author, Category, Publisher, Order, User
            status_info["counts"] = {
                "books": db.query(Book).count(),
                "authors": db.query(Author).count(),
                "categories": db.query(Category).count(),
                "publishers": db.query(Publisher).count(),
                "orders": db.query(Order).count(),
                "users": db.query(User).count(),
            }
        status_info["connected"] = True
    except Exception as e:
        status_info["error"] = str(e)
    return status_info
