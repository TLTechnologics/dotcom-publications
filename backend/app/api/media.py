import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session

try:
    from backend.app.core.database import get_db
    from backend.app.core.config import settings
    from backend.app.core.deps import require_content_manager, get_current_user
    from backend.app.models.models import Media, ActivityLog, User
    from backend.app.schemas.schemas import MediaResponse
except ImportError:
    from app.core.database import get_db
    from app.core.config import settings
    from app.core.deps import require_content_manager, get_current_user
    from app.models.models import Media, ActivityLog, User
    from app.schemas.schemas import MediaResponse

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'}

router = APIRouter(prefix="/media", tags=["Media"])

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=List[MediaResponse])
def get_media_items(
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve media gallery assets with optional category filtering and search."""
    query = db.query(Media)
    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            (Media.original_name.ilike(search_filter)) |
            (Media.filename.ilike(search_filter))
        )
    if category and category != "all":
        query = query.filter(Media.category == category)

    return query.order_by(Media.created_at.desc()).all()

@router.post("/upload", response_model=MediaResponse, status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
    category: str = Form("general"),
    current_admin: User = Depends(require_content_manager),
    db: Session = Depends(get_db)
):
    """Upload media asset to Supabase cloud storage or local disk (Content Manager / Super Admin only)."""
    # Validate extension and mime type
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS or not (file.content_type and file.content_type.startswith("image/")):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{ext}'. Only images ({', '.join(sorted(ALLOWED_EXTENSIONS))}) are accepted."
        )

    # Validate file size
    file_bytes = await file.read()
    file_size = len(file_bytes)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed upload size of 10MB ({file_size / (1024 * 1024):.1f}MB uploaded)."
        )

    safe_basename = os.path.basename(file.filename or "upload").replace(' ', '_')
    unique_filename = f"{uuid.uuid4().hex[:12]}_{safe_basename}"
    file_url = None

    # Option A: Cloud persistent upload to Supabase Storage
    if settings.SUPABASE_URL and settings.SUPABASE_KEY:
        try:
            import urllib.request
            bucket = settings.SUPABASE_STORAGE_BUCKET or "media"
            upload_endpoint = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/{bucket}/{unique_filename}"
            req = urllib.request.Request(
                upload_endpoint,
                data=file_bytes,
                headers={
                    "apikey": settings.SUPABASE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_KEY}",
                    "Content-Type": file.content_type or "application/octet-stream",
                    "x-upsert": "true",
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                if resp.status in (200, 201):
                    file_url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/public/{bucket}/{unique_filename}"
        except Exception as e:
            print(f"Supabase storage note (falling back to local): {e}")

    # Option B: Fallback to local /tmp or uploads directory
    if not file_url:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
        with open(file_path, "wb") as buffer:
            buffer.write(file_bytes)
        file_url = f"/uploads/{unique_filename}"

    media = Media(
        filename=unique_filename,
        original_name=file.filename,
        url=file_url,
        file_size=file_size,
        mime_type=file.content_type,
        category=category
    )
    db.add(media)
    db.commit()
    db.refresh(media)

    log = ActivityLog(
        user_id=current_admin.id,
        user_name=current_admin.username,
        action_type="create",
        entity_type="media",
        entity_id=media.id,
        entity_name=media.original_name,
        description=f"Administrator '{current_admin.username}' uploaded asset '{media.original_name}' ({category})"
    )
    db.add(log)
    db.commit()

    return media

@router.delete("/{media_id}")
def delete_media(
    media_id: int,
    current_admin: User = Depends(require_content_manager),
    db: Session = Depends(get_db)
):
    """Delete media asset and purge from cloud Supabase Storage (Content Manager / Super Admin only)."""
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media item not found")

    # 1. If stored locally, delete disk file
    if media.url.startswith("/uploads/"):
        local_path = os.path.join(settings.UPLOAD_DIR, media.filename)
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
            except Exception:
                pass

    # 2. If stored in Supabase Storage, purge cloud object
    if settings.SUPABASE_URL and settings.SUPABASE_KEY and (settings.SUPABASE_URL in media.url):
        try:
            import urllib.request
            bucket = settings.SUPABASE_STORAGE_BUCKET or "media"
            delete_endpoint = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/{bucket}/{media.filename}"
            req = urllib.request.Request(
                delete_endpoint,
                headers={
                    "apikey": settings.SUPABASE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_KEY}",
                },
                method="DELETE"
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                pass
        except Exception as e:
            print(f"Supabase storage cloud delete note: {e}")

    name = media.original_name
    db.delete(media)

    log = ActivityLog(
        user_id=current_admin.id,
        user_name=current_admin.username,
        action_type="delete",
        entity_type="media",
        entity_id=media_id,
        entity_name=name,
        description=f"Administrator '{current_admin.username}' deleted media asset '{name}'"
    )
    db.add(log)
    db.commit()

    return {"message": f"Asset '{name}' deleted successfully", "id": media_id}
