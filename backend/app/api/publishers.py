from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
try:
    from backend.app.core.database import get_db
    from backend.app.core.deps import require_content_manager, get_current_user
    from backend.app.models.models import Publisher, ActivityLog, User
    from backend.app.schemas.schemas import PublisherCreate, PublisherUpdate, PublisherResponse
except ImportError:
    from app.core.database import get_db
    from app.core.deps import require_content_manager, get_current_user
    from app.models.models import Publisher, ActivityLog, User
    from app.schemas.schemas import PublisherCreate, PublisherUpdate, PublisherResponse

router = APIRouter(prefix="/publishers", tags=["Publishers"])

@router.get("", response_model=List[PublisherResponse])
def get_publishers(
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Public publisher press and imprint listing."""
    query = db.query(Publisher)
    if search:
        query = query.filter(Publisher.name.ilike(f"%{search.strip()}%"))
    publishers = query.order_by(Publisher.name.asc()).all()

    results = []
    for pub in publishers:
        results.append(PublisherResponse(
            id=pub.id,
            name=pub.name,
            logo_url=pub.logo_url,
            description=pub.description,
            email=pub.email,
            phone=pub.phone,
            address=pub.address,
            website=pub.website,
            books_count=len(pub.books),
            created_at=pub.created_at
        ))
    return results

@router.get("/{publisher_id}", response_model=PublisherResponse)
def get_publisher(publisher_id: int, db: Session = Depends(get_db)):
    """Public publisher details lookup."""
    pub = db.query(Publisher).filter(Publisher.id == publisher_id).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publisher not found")
    return PublisherResponse(
        id=pub.id,
        name=pub.name,
        logo_url=pub.logo_url,
        description=pub.description,
        email=pub.email,
        phone=pub.phone,
        address=pub.address,
        website=pub.website,
        books_count=len(pub.books),
        created_at=pub.created_at
    )

@router.post("", response_model=PublisherResponse, status_code=status.HTTP_201_CREATED)
def create_publisher(
    pub_in: PublisherCreate,
    current_admin: User = Depends(require_content_manager),
    db: Session = Depends(get_db)
):
    """Register publisher imprint (Content Manager / Super Admin only)."""
    pub = Publisher(
        name=pub_in.name.strip(),
        logo_url=pub_in.logo_url,
        description=pub_in.description,
        email=pub_in.email,
        phone=pub_in.phone,
        address=pub_in.address,
        website=pub_in.website
    )
    db.add(pub)
    db.commit()
    db.refresh(pub)

    log = ActivityLog(
        user_id=current_admin.id,
        user_name=current_admin.username,
        action_type="create",
        entity_type="publisher",
        entity_id=pub.id,
        entity_name=pub.name,
        description=f"Administrator '{current_admin.username}' registered publisher imprint '{pub.name}'"
    )
    db.add(log)
    db.commit()

    return PublisherResponse(
        id=pub.id,
        name=pub.name,
        logo_url=pub.logo_url,
        description=pub.description,
        email=pub.email,
        phone=pub.phone,
        address=pub.address,
        website=pub.website,
        books_count=0,
        created_at=pub.created_at
    )

@router.put("/{publisher_id}", response_model=PublisherResponse)
def update_publisher(
    publisher_id: int,
    pub_in: PublisherUpdate,
    current_admin: User = Depends(require_content_manager),
    db: Session = Depends(get_db)
):
    """Update publisher imprint details (Content Manager / Super Admin only)."""
    pub = db.query(Publisher).filter(Publisher.id == publisher_id).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publisher not found")

    update_data = pub_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pub, field, value)

    log = ActivityLog(
        user_id=current_admin.id,
        user_name=current_admin.username,
        action_type="update",
        entity_type="publisher",
        entity_id=pub.id,
        entity_name=pub.name,
        description=f"Administrator '{current_admin.username}' updated publisher imprint '{pub.name}'"
    )
    db.add(log)
    db.commit()
    db.refresh(pub)

    return PublisherResponse(
        id=pub.id,
        name=pub.name,
        logo_url=pub.logo_url,
        description=pub.description,
        email=pub.email,
        phone=pub.phone,
        address=pub.address,
        website=pub.website,
        books_count=len(pub.books),
        created_at=pub.created_at
    )

@router.delete("/{publisher_id}")
def delete_publisher(
    publisher_id: int,
    current_admin: User = Depends(require_content_manager),
    db: Session = Depends(get_db)
):
    """Delete publisher imprint (Content Manager / Super Admin only)."""
    pub = db.query(Publisher).filter(Publisher.id == publisher_id).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publisher not found")

    name = pub.name
    log = ActivityLog(
        user_id=current_admin.id,
        user_name=current_admin.username,
        action_type="delete",
        entity_type="publisher",
        entity_id=publisher_id,
        entity_name=name,
        description=f"Administrator '{current_admin.username}' deleted publisher imprint '{name}'"
    )
    db.add(log)
    db.delete(pub)
    db.commit()
    return {"message": f"Publisher '{name}' deleted successfully", "id": publisher_id}
