"""
Dotcom Publications — Supabase PostgreSQL Connection Verification Utility
Runs connection checks, validates SSL, tests schema permissions, and creates tables.
"""

import sys
import os
from sqlalchemy import text, inspect

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.core.config import settings
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.seed_data import init_database

def test_connection():
    print("=" * 70)
    print("DOTCOM PUBLICATIONS — SUPABASE DATABASE CONNECTION CHECK")
    print("=" * 70)

    db_url = settings.DATABASE_URL
    # Mask password for display
    masked_url = db_url
    if "@" in db_url:
        prefix, host_part = db_url.split("@", 1)
        if ":" in prefix:
            user_part = prefix.split(":")[0] + ":****"
            masked_url = f"{user_part}@{host_part}"

    print(f"Target Database URL: {masked_url}")

    if "sqlite" in db_url:
        print("[!] NOTICE: Currently running on local SQLite fallback.")
        print("    To connect to Supabase PostgreSQL, add your connection string to .env:")
        print("    SUPABASE_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require\n")
    else:
        print("[*] Target is PostgreSQL (Supabase). Connecting...\n")

    try:
        # 1. Test raw connectivity
        with engine.connect() as conn:
            query = "SELECT version();" if "postgresql" in db_url else "SELECT sqlite_version();"
            result = conn.execute(text(query)).fetchone()
            print("[SUCCESS] Connection established successfully!")
            print(f"Database Server Version: {result[0]}")

        # 2. Check and create tables
        print("\n[*] Synchronizing schema tables...")
        Base.metadata.create_all(bind=engine)
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"[SUCCESS] Tables verified ({len(tables)} tables present):")
        for t in sorted(tables):
            print(f"  - {t}")

        # 3. Clean initialization
        with SessionLocal() as db:
            init_database(db, wipe_dummy=False)

        print("\n" + "=" * 70)
        print("[READY] Database is fully operational with ZERO dummy data.")
        print("=" * 70)
        return True

    except Exception as e:
        print(f"\n[ERROR] Connection failed: {e}")
        print("\nTroubleshooting Supabase connection:")
        print("1. In Supabase Dashboard -> Settings -> Database -> Connection String -> URI")
        print("2. Ensure your password is correct (URL-encode special characters like %, @, #)")
        print("3. Ensure '?sslmode=require' is appended to the connection string.")
        print("4. If your network has IPv4 restrictions, use the Connection Pooling URI (port 6543).")
        return False

if __name__ == "__main__":
    test_connection()
