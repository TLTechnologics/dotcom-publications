from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
try:
    from backend.app.core.database import get_db
    from backend.app.models.models import Publisher, ActivityLog
    from backend.app.schemas.schemas import PublisherCreate, PublisherUpdate, PublisherResponse
except ImportError:
    from app.core.database import get_db
    from app.models.models import Publisher, ActivityLog
    from app.schemas.schemas import PublisherCreate, PublisherUpdate, PublisherResponse

router = APIRouter(prefix="/publishers", tags=["Publishers"])

@router.get("", response_model=List[PublisherResponse])
def get_publishers(
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Publisher)
    if search:
        query = query.filter(Publisher.name.ilike(f"%{search}%"))
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

@router.post("", response_model=PublisherResponse, status_code=201)
def create_publisher(pub_in: PublisherCreate, db: Session = Depends(get_db)):
    pub = Publisher(
        name=pub_in.name,
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
        action_type="create",
        entity_type="publisher",
        entity_id=pub.id,
        entity_name=pub.name,
        description=f"Added publisher imprint '{pub.name}'"
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
def update_publisher(publisher_id: int, pub_in: PublisherUpdate, db: Session = Depends(get_db)):
    pub = db.query(Publisher).filter(Publisher.id == publisher_id).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publisher not found")

    update_data = pub_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pub, field, value)

    log = ActivityLog(
        action_type="update",
        entity_type="publisher",
        entity_id=pub.id,
        entity_name=pub.name,
        description=f"Updated publisher '{pub.name}'"
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
def delete_publisher(publisher_id: int, db: Session = Depends(get_db)):
    pub = db.query(Publisher).filter(Publisher.id == publisher_id).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publisher not found")

    name = pub.name
    log = ActivityLog(
        action_type="delete",
        entity_type="publisher",
        entity_id=publisher_id,
        entity_name=name,
        description=f"Deleted publisher imprint '{name}'"
    )
    db.add(log)
    db.delete(pub)
    db.commit()
    return {"message": f"Publisher '{name}' deleted successfully", "id": publisher_id}
