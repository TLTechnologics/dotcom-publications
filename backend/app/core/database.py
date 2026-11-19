from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
try:
    from backend.app.core.config import settings
except ImportError:
    from app.core.config import settings

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
try:
    from backend.app.core.config import settings
except ImportError:
    from app.core.config import settings

connect_args = {}
engine_kwargs = {
    "pool_pre_ping": True,
}

def create_database_engine():
    global connect_args, engine_kwargs
    db_url = settings.DATABASE_URL
    if db_url.startswith("sqlite"):
        return create_engine(db_url, connect_args={"check_same_thread": False}, **engine_kwargs)
    
    # Try PostgreSQL / Supabase
    try:
        # Test connection with a fast pre-check timeout
        test_kwargs = dict(engine_kwargs)
        test_kwargs.update({
            "pool_size": 5,
            "max_overflow": 10,
            "pool_recycle": 300,
        })
        test_engine = create_engine(
            db_url,
            connect_args={"connect_timeout": 3},
            **test_kwargs
        )
        with test_engine.connect() as conn:
            pass
        return test_engine
    except Exception as e:
        # Fallback to local SQLite when remote database is unreachable
        print(f"[Notice] Remote database unreachable ({e}). Using local SQLite database.")
        db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "dotcom_publications.db"))
        return create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})

engine = create_database_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

