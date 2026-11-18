from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
try:
    from backend.app.core.database import get_db
    from backend.app.models.models import Author, ActivityLog
    from backend.app.schemas.schemas import AuthorCreate, AuthorUpdate, AuthorResponse
except ImportError:
    from app.core.database import get_db
    from app.models.models import Author, ActivityLog
    from app.schemas.schemas import AuthorCreate, AuthorUpdate, AuthorResponse

router = APIRouter(prefix="/authors", tags=["Authors"])

@router.get("", response_model=List[AuthorResponse])
def get_authors(
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Author)
    if search:
        query = query.filter(Author.name.ilike(f"%{search}%"))
    authors = query.order_by(Author.name.asc()).all()

    results = []
    for author in authors:
        results.append(AuthorResponse(
            id=author.id,
            name=author.name,
            profile_picture=author.profile_picture,
            bio=author.bio,
            email=author.email,
            website=author.website,
            books_count=len(author.books),
            created_at=author.created_at,
            updated_at=author.updated_at
        ))
    return results

@router.get("/{author_id}", response_model=AuthorResponse)
def get_author(author_id: int, db: Session = Depends(get_db)):
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    return AuthorResponse(
        id=author.id,
        name=author.name,
        profile_picture=author.profile_picture,
        bio=author.bio,
        email=author.email,
        website=author.website,
        books_count=len(author.books),
        created_at=author.created_at,
        updated_at=author.updated_at
    )

@router.post("", response_model=AuthorResponse, status_code=201)
def create_author(author_in: AuthorCreate, db: Session = Depends(get_db)):
    author = Author(
        name=author_in.name,
        profile_picture=author_in.profile_picture,
        bio=author_in.bio,
        email=author_in.email,
        website=author_in.website
    )
    db.add(author)
    db.commit()
    db.refresh(author)

    # Activity log
    log = ActivityLog(
        action_type="create",
        entity_type="author",
        entity_id=author.id,
        entity_name=author.name,
        description=f"Created author profile for '{author.name}'"
    )
    db.add(log)
    db.commit()

    return AuthorResponse(
        id=author.id,
        name=author.name,
        profile_picture=author.profile_picture,
        bio=author.bio,
        email=author.email,
        website=author.website,
        books_count=0,
        created_at=author.created_at,
        updated_at=author.updated_at
    )

@router.put("/{author_id}", response_model=AuthorResponse)
def update_author(author_id: int, author_in: AuthorUpdate, db: Session = Depends(get_db)):
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    update_data = author_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(author, field, value)

    # Activity log
    log = ActivityLog(
        action_type="update",
        entity_type="author",
        entity_id=author.id,
        entity_name=author.name,
        description=f"Updated details for author '{author.name}'"
    )
    db.add(log)
    db.commit()
    db.refresh(author)

    return AuthorResponse(
        id=author.id,
        name=author.name,
        profile_picture=author.profile_picture,
        bio=author.bio,
        email=author.email,
        website=author.website,
        books_count=len(author.books),
        created_at=author.created_at,
        updated_at=author.updated_at
    )

@router.delete("/{author_id}")
def delete_author(author_id: int, db: Session = Depends(get_db)):
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    author_name = author.name
    # Log deletion
    log = ActivityLog(
        action_type="delete",
        entity_type="author",
        entity_id=author_id,
        entity_name=author_name,
        description=f"Deleted author profile '{author_name}'"
    )
    db.add(log)
    db.delete(author)
    db.commit()
    return {"message": f"Author '{author_name}' successfully deleted", "id": author_id}
