import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
try:
    from backend.app.core.database import get_db
    from backend.app.models.models import LandingPage, ActivityLog
    from backend.app.schemas.schemas import LandingPageContent, LandingPageResponse
except ImportError:
    from app.core.database import get_db
    from app.models.models import LandingPage, ActivityLog
    from app.schemas.schemas import LandingPageContent, LandingPageResponse

router = APIRouter(prefix="/landing", tags=["Landing Page"])

def serialize_landing(landing: LandingPage) -> LandingPageResponse:
    return LandingPageResponse(
        id=landing.id,
        hero_heading=landing.hero_heading,
        hero_description=landing.hero_description,
        hero_image=landing.hero_image,
        featured_book_ids=json.loads(landing.featured_book_ids) if landing.featured_book_ids else [],
        latest_publications=json.loads(landing.latest_publications) if landing.latest_publications else [],
        popular_categories=json.loads(landing.popular_categories) if landing.popular_categories else [],
        about_title=landing.about_title,
        about_description=landing.about_description,
        about_stats=json.loads(landing.about_stats) if landing.about_stats else [],
        contact_email=landing.contact_email,
        contact_phone=landing.contact_phone,
        contact_address=landing.contact_address,
        footer_text=landing.footer_text,
        updated_at=landing.updated_at
    )

@router.get("", response_model=LandingPageResponse)
def get_landing_content(db: Session = Depends(get_db)):
    landing = db.query(LandingPage).first()
    if not landing:
        landing = LandingPage(id=1)
        db.add(landing)
        db.commit()
        db.refresh(landing)
    return serialize_landing(landing)

@router.put("", response_model=LandingPageResponse)
def update_landing_content(content_in: LandingPageContent, db: Session = Depends(get_db)):
    landing = db.query(LandingPage).first()
    if not landing:
        landing = LandingPage(id=1)
        db.add(landing)

    landing.hero_heading = content_in.hero_heading
    landing.hero_description = content_in.hero_description
    landing.hero_image = content_in.hero_image
    landing.featured_book_ids = json.dumps(content_in.featured_book_ids)
    landing.latest_publications = json.dumps(content_in.latest_publications)
    landing.popular_categories = json.dumps(content_in.popular_categories)
    landing.about_title = content_in.about_title
    landing.about_description = content_in.about_description
    landing.about_stats = json.dumps(content_in.about_stats)
    landing.contact_email = content_in.contact_email
    landing.contact_phone = content_in.contact_phone
    landing.contact_address = content_in.contact_address
    landing.footer_text = content_in.footer_text

    log = ActivityLog(
        action_type="update",
        entity_type="landing",
        entity_id=landing.id,
        entity_name="Public Homepage Content",
        description="Updated landing page hero, featured sections, and institutional profile"
    )
    db.add(log)
    db.commit()
    db.refresh(landing)

    return serialize_landing(landing)
