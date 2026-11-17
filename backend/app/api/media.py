import os
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.models.models import Media, ActivityLog
from backend.app.schemas.schemas import MediaResponse

router = APIRouter(prefix="/media", tags=["Media"])

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=List[MediaResponse])
def get_media_items(
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Media)
    if search:
        query = query.filter(
            (Media.original_name.ilike(f"%{search}%")) |
            (Media.filename.ilike(f"%{search}%"))
        )
    if category and category != "all":
        query = query.filter(Media.category == category)

    return query.order_by(Media.created_at.desc()).all()

@router.post("/upload", response_model=MediaResponse, status_code=201)
async def upload_media(
    file: UploadFile = File(...),
    category: str = Form("general"),
    db: Session = Depends(get_db)
):
    # Validate mime
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex[:12]}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)
    # The URL will be served via FastAPI static mount at /uploads/...
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
        action_type="create",
        entity_type="media",
        entity_id=media.id,
        entity_name=media.original_name,
        description=f"Uploaded asset '{media.original_name}' to category '{category}'"
    )
    db.add(log)
    db.commit()

    return media

@router.delete("/{media_id}")
def delete_media(media_id: int, db: Session = Depends(get_db)):
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media item not found")

    # If it's a locally stored file, delete it
    if media.url.startswith("/uploads/"):
        local_path = os.path.join(settings.UPLOAD_DIR, media.filename)
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
            except Exception:
                pass

    name = media.original_name
    db.delete(media)
    db.commit()

    return {"message": f"Asset '{name}' deleted successfully", "id": media_id}
