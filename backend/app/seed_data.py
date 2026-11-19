import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
try:
    from backend.app.models.models import (
        Author, Publisher, Category, Book, Media, LandingPage, SiteSettings, ActivityLog, User, book_authors
    )
    from backend.app.core.security import hash_password
except ImportError:
    from app.models.models import (
        Author, Publisher, Category, Book, Media, LandingPage, SiteSettings, ActivityLog, User, book_authors
    )
    from app.core.security import hash_password

def wipe_all_dummy_data(db: Session):
    """
    Wipes out demonstration mock records if requested.
    Preserves clean system architecture.
    """
    try:
        db.execute(book_authors.delete())
        db.query(Book).delete()
        db.query(Author).delete()
        db.query(Category).delete()
        db.query(Publisher).delete()
        db.query(Media).delete()
        db.query(ActivityLog).delete()
        db.commit()
        print("[OK] All dummy demonstration data removed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Note during data wipe: {e}")

def init_database(db: Session, wipe_dummy: bool = False):
    """
    Initializes clean system baseline for production or Supabase PostgreSQL database.
    Ensures default SiteSettings, LandingPage singleton, and initial administrative accounts.
    """
    if wipe_dummy:
        wipe_all_dummy_data(db)

    # 1. Ensure Default Administrative Users Exist
    user_count = db.query(User).count()
    if user_count == 0:
        initial_users = [
            User(
                username="admin",
                email="admin@dotcompublications.com",
                full_name="Master Administrator",
                role="super-admin",
                hashed_password=hash_password("DotcomAdmin@2026"),
                is_active=True,
                created_at=datetime.now(timezone.utc)
            ),
            User(
                username="editor",
                email="editor@dotcompublications.com",
                full_name="Senior Content Editor",
                role="content_manager",
                hashed_password=hash_password("DotcomEditor@2026"),
                is_active=True,
                created_at=datetime.now(timezone.utc)
            ),
            User(
                username="fulfillment",
                email="fulfillment@dotcompublications.com",
                full_name="Order Fulfillment Officer",
                role="order_manager",
                hashed_password=hash_password("DotcomOrders@2026"),
                is_active=True,
                created_at=datetime.now(timezone.utc)
            ),
            User(
                username="viewer",
                email="viewer@dotcompublications.com",
                full_name="Institutional Auditor",
                role="viewer",
                hashed_password=hash_password("DotcomViewer@2026"),
                is_active=True,
                created_at=datetime.now(timezone.utc)
            ),
        ]
        db.add_all(initial_users)
        db.commit()
        print("[OK] Initialized administrative accounts (admin, editor, fulfillment, viewer).")

    # 2. Ensure Default Site Settings Exist
    settings = db.query(SiteSettings).filter(SiteSettings.id == 1).first()
    if not settings:
        settings = SiteSettings(
            id=1,
            company_name="Dotcom Publications",
            logo_url="/logo.jpg",
            description="Educational and Academic Book Publisher — High-calibre pedagogy, research monographs, and global university textbooks.",
            contact_email="contact@dotcompublications.com",
            phone="+91 11 4567 8900",
            address="Knowledge Park III, Institutional Area, Greater Noida, Delhi NCR, India",
            social_links=json.dumps({
                "twitter": "https://twitter.com/dotcombooks",
                "linkedin": "https://linkedin.com/company/dotcom-publications",
                "facebook": "https://facebook.com/dotcombooks",
                "instagram": "https://instagram.com/dotcombooks"
            }),
            currency="INR",
            catalogue_download_url="",
            maintenance_mode=False
        )
        db.add(settings)
        db.commit()
    elif not settings.logo_url:
        settings.logo_url = "/logo.jpg"
        db.commit()

    # 3. Ensure Default Landing Page CMS Singleton Exists
    landing = db.query(LandingPage).filter(LandingPage.id == 1).first()
    if not landing:
        landing = LandingPage(
            id=1,
            hero_heading="Advancing Knowledge Through Academic Excellence",
            hero_description="Dotcom Publications brings you peer-reviewed academic textbooks, research monographs, and educational resources trusted by leading institutions and scholars worldwide.",
            hero_image="",
            featured_book_ids="[]",
            latest_publications="[]",
            popular_categories="[]",
            about_title="About Dotcom Publications",
            about_description="Established as a premier academic imprint, Dotcom Publications is dedicated to high-calibre pedagogical literature, cutting-edge scholarly research, and empowering students and researchers across disciplines.",
            about_stats=json.dumps([
                {"label": "Published Titles", "value": "6"},
                {"label": "Contributing Scholars", "value": "6"},
                {"label": "Partner Universities", "value": "45+"},
                {"label": "Academic Disciplines", "value": "5"}
            ]),
            contact_email="editor@dotcompublications.com",
            contact_phone="+91 11 4567 8900",
            contact_address="Knowledge Park III, Institutional Area, Greater Noida, Delhi NCR, India",
            footer_text="© 2026 Dotcom Publications. Developed with pride by TL Technologics. All Rights Reserved."
        )
        db.add(landing)
        db.commit()

    print("[OK] Dotcom Publications database initialized with clean production schema.")

seed_database = init_database
