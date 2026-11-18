import json
from datetime import datetime
from sqlalchemy.orm import Session
try:
    from backend.app.models.models import (
        Author, Publisher, Category, Book, Media, LandingPage, SiteSettings, ActivityLog, book_authors
    )
except ImportError:
    from app.models.models import (
        Author, Publisher, Category, Book, Media, LandingPage, SiteSettings, ActivityLog, book_authors
    )

def wipe_all_dummy_data(db: Session):
    """
    Wipes out all demonstration mock books, authors, categories, publishers, media, and activity logs.
    Preserves clean system architecture.
    """
    try:
        # Delete many-to-many associations first
        db.execute(book_authors.delete())
        
        # Delete entities
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

def init_database(db: Session, wipe_dummy: bool = True):
    """
    Initializes clean system baseline for production or actual Supabase PostgreSQL database.
    Creates default SiteSettings and LandingPage singletons if not present.
    Ensures ZERO dummy books, authors, publishers, or categories exist.
    """
    if wipe_dummy:
        wipe_all_dummy_data(db)

    # 1. Ensure Default Site Settings Exist (Clean corporate publisher profile)
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

    # 2. Ensure Default Landing Page CMS Singleton Exists (Clean template, no dummy books)
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
                {"label": "Published Titles", "value": "0"},
                {"label": "Contributing Scholars", "value": "0"},
                {"label": "Partner Universities", "value": "0"},
                {"label": "Global Readers", "value": "0"}
            ]),
            contact_email="editor@dotcompublications.com",
            contact_phone="+91 11 4567 8900",
            contact_address="Knowledge Park III, Institutional Area, Greater Noida, Delhi NCR, India",
            footer_text="© 2026 Dotcom Publications. Developed with pride by TL Technologics. All Rights Reserved."
        )
        db.add(landing)
        db.commit()
    else:
        # Reset any dummy book or category references
        landing.featured_book_ids = "[]"
        landing.latest_publications = "[]"
        landing.popular_categories = "[]"
        db.commit()

    print("[OK] Dotcom Publications database initialized with clean production schema.")

# Backward compatibility alias
seed_database = init_database
