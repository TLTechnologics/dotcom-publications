from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
try:
    from backend.app.core.database import get_db
    from backend.app.core.deps import require_content_manager, get_current_user
    from backend.app.models.models import Author, ActivityLog, User
    from backend.app.schemas.schemas import AuthorCreate, AuthorUpdate, AuthorResponse
except ImportError:
    from app.core.database import get_db
    from app.core.deps import require_content_manager, get_current_user
    from app.models.models import Author, ActivityLog, User
    from app.schemas.schemas import AuthorCreate, AuthorUpdate, AuthorResponse

router = APIRouter(prefix="/authors", tags=["Authors"])

@router.get("", response_model=List[AuthorResponse])
def get_authors(
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Public listing of faculty authors and profiles."""
    query = db.query(Author)
    if search:
        query = query.filter(Author.name.ilike(f"%{search.strip()}%"))
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
    """Public author profile view."""
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

@router.post("", response_model=AuthorResponse, status_code=status.HTTP_201_CREATED)
def create_author(
    author_in: AuthorCreate,
    current_admin: User = Depends(require_content_manager),
    db: Session = Depends(get_db)
):
    """Register faculty author (Content Manager / Super Admin only)."""
    author = Author(**author_in.dict())
    db.add(author)
    db.commit()
    db.refresh(author)

    log = ActivityLog(
        user_id=current_admin.id,
        user_name=current_admin.username,
        action_type="create",
        entity_type="author",
        entity_id=author.id,
        entity_name=author.name,
        description=f"Administrator '{current_admin.username}' created author profile '{author.name}'"
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
def update_author(
    author_id: int,
    author_in: AuthorUpdate,
    current_admin: User = Depends(require_content_manager),
    db: Session = Depends(get_db)
):
    """Update author biography and institutional links (Content Manager / Super Admin only)."""
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    for field, value in author_in.dict(exclude_unset=True).items():
        setattr(author, field, value)

    log = ActivityLog(
        user_id=current_admin.id,
        user_name=current_admin.username,
        action_type="update",
        entity_type="author",
        entity_id=author.id,
        entity_name=author.name,
        description=f"Administrator '{current_admin.username}' updated author profile '{author.name}'"
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
def delete_author(
    author_id: int,
    current_admin: User = Depends(require_content_manager),
    db: Session = Depends(get_db)
):
    """Delete author profile (Content Manager / Super Admin only)."""
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    if author.books:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete author '{author.name}' because they are assigned to {len(author.books)} book(s). Unlink or reassign those books first."
        )

    name = author.name
    log = ActivityLog(
        user_id=current_admin.id,
        user_name=current_admin.username,
        action_type="delete",
        entity_type="author",
        entity_id=author_id,
        entity_name=name,
        description=f"Administrator '{current_admin.username}' deleted author '{name}'"
    )
    db.add(log)
    db.delete(author)
    db.commit()

    return {"message": f"Author '{name}' deleted successfully", "id": author_id}
