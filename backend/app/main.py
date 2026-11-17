import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import settings
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.seed_data import seed_database
from backend.app.api import (
    books, authors, categories, publishers, media, landing, settings as site_settings, dashboard
)

# Create tables
Base.metadata.create_all(bind=engine)

# Seed demonstration data if needed
with SessionLocal() as db:
    seed_database(db)

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

# Ensure upload directory exists and mount it
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers under API prefix
api_prefix = settings.API_V1_STR
app.include_router(dashboard.router, prefix=api_prefix)
app.include_router(books.router, prefix=api_prefix)
app.include_router(authors.router, prefix=api_prefix)
app.include_router(categories.router, prefix=api_prefix)
app.include_router(publishers.router, prefix=api_prefix)
app.include_router(media.router, prefix=api_prefix)
app.include_router(landing.router, prefix=api_prefix)
app.include_router(site_settings.router, prefix=api_prefix)

@app.get("/")
def root():
    return {
        "platform": "Dotcom Publications Admin API",
        "client": "Dotcom Publications",
        "vendor": "TL Technologics",
        "version": settings.VERSION,
        "docs": "/docs",
        "status": "operational"
    }
