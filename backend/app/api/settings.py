import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
try:
    from backend.app.core.database import get_db
    from backend.app.core.deps import require_super_admin, get_current_user
    from backend.app.models.models import SiteSettings, ActivityLog, User
    from backend.app.schemas.schemas import SiteSettingsContent, SiteSettingsResponse
except ImportError:
    from app.core.database import get_db
    from app.core.deps import require_super_admin, get_current_user
    from app.models.models import SiteSettings, ActivityLog, User
    from app.schemas.schemas import SiteSettingsContent, SiteSettingsResponse

router = APIRouter(prefix="/settings", tags=["Settings"])

def serialize_settings(s: SiteSettings) -> SiteSettingsResponse:
    socials = {}
    if s.social_links:
        try:
            socials = json.loads(s.social_links)
        except Exception:
            socials = {}

    return SiteSettingsResponse(
        id=s.id,
        company_name=s.company_name,
        logo_url=s.logo_url,
        description=s.description,
        contact_email=s.contact_email,
        phone=s.phone,
        address=s.address,
        social_links=socials,
        currency=s.currency,
        catalogue_download_url=s.catalogue_download_url,
        maintenance_mode=s.maintenance_mode,
        updated_at=s.updated_at
    )

@router.get("", response_model=SiteSettingsResponse)
def get_site_settings(db: Session = Depends(get_db)):
    """Public endpoint to check operational parameters and maintenance status."""
    settings_obj = db.query(SiteSettings).first()
    if not settings_obj:
        settings_obj = SiteSettings(id=1)
        db.add(settings_obj)
        db.commit()
        db.refresh(settings_obj)
    return serialize_settings(settings_obj)

@router.put("", response_model=SiteSettingsResponse)
def update_site_settings(
    content_in: SiteSettingsContent,
    current_admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Update global publisher settings (Super Admin only)."""
    settings_obj = db.query(SiteSettings).first()
    if not settings_obj:
        settings_obj = SiteSettings(id=1)
        db.add(settings_obj)

    settings_obj.company_name = content_in.company_name
    settings_obj.logo_url = content_in.logo_url
    settings_obj.description = content_in.description
    settings_obj.contact_email = content_in.contact_email
    settings_obj.phone = content_in.phone
    settings_obj.address = content_in.address
    settings_obj.social_links = json.dumps(content_in.social_links)
    settings_obj.currency = content_in.currency
    settings_obj.catalogue_download_url = content_in.catalogue_download_url
    settings_obj.maintenance_mode = content_in.maintenance_mode
    settings_obj.updated_at = datetime.now(timezone.utc)

    log = ActivityLog(
        user_id=current_admin.id,
        user_name=current_admin.username,
        action_type="update",
        entity_type="settings",
        entity_id=settings_obj.id,
        entity_name="Global Site Settings",
        description=f"Super Administrator '{current_admin.username}' updated system settings (Maintenance Mode: {content_in.maintenance_mode})"
    )
    db.add(log)
    db.commit()
    db.refresh(settings_obj)

    return serialize_settings(settings_obj)
