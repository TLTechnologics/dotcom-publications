import json
import re
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
try:
    from backend.app.core.database import get_db
    from backend.app.core.deps import require_content_manager, get_current_user
    from backend.app.models.models import Book, Author, Publisher, Category, ActivityLog, User
    from backend.app.schemas.schemas import BookCreate, BookUpdate, BookResponse, BookAuthorBrief
except ImportError:
    from app.core.database import get_db
    from app.core.deps import require_content_manager, get_current_user
    from app.models.models import Book, Author, Publisher, Category, ActivityLog, User
    from app.schemas.schemas import BookCreate, BookUpdate, BookResponse, BookAuthorBrief

router = APIRouter(prefix="/books", tags=["Books"])

def sanitize_html(text: Optional[str]) -> Optional[str]:
    """Strip dangerous HTML script tags to prevent stored XSS."""
    if not text:
        return text
    # Strip script tags and dangerous javascript: URIs
    cleaned = re.sub(r'<\s*script[^>]*>.*?<\s*/\s*script\s*>', '', text, flags=re.IGNORECASE | re.DOTALL)
    cleaned = re.sub(r'<\s*iframe[^>]*>.*?<\s*/\s*iframe\s*>', '', cleaned, flags=re.IGNORECASE | re.DOTALL)
    cleaned = re.sub(r'on\w+\s*=', '', cleaned, flags=re.IGNORECASE)
    return cleaned.strip()

def serialize_book(book: Book) -> BookResponse:
    additional = []
    if book.additional_images:
        try:
            additional = json.loads(book.additional_images)
        except Exception:
            additional = []

    authors_brief = [
        BookAuthorBrief(id=a.id, name=a.name, profile_picture=a.profile_picture)
        for a in book.authors
    ]

    return BookResponse(
        id=book.id,
        title=book.title,
        subtitle=book.subtitle,
        short_description=book.short_description,
        full_description=book.full_description,
        cover_image=book.cover_image,
        additional_images=additional,
        isbn=book.isbn,
        edition=book.edition,
        publication_year=book.publication_year,
        publisher_id=book.publisher_id,
        publisher_name=book.publisher.name if book.publisher else None,
        pages=book.pages,
        language=book.language,
        book_format=book.book_format,
        subject=book.subject,
        category_id=book.category_id,
        category_name=book.category.name if book.category else None,
        subcategory_id=book.subcategory_id,
        subcategory_name=book.subcategory.name if book.subcategory else None,
        selling_price=float(book.selling_price),
        mrp=float(book.mrp),
        currency=book.currency,
        is_draft=book.is_draft,
        is_featured=book.is_featured,
        availability_status=book.availability_status,
        seo_title=book.seo_title,
        seo_description=book.seo_description,
        authors=authors_brief,
        created_at=book.created_at,
        updated_at=book.updated_at
    )

@router.get("")
def get_books(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    author_id: Optional[int] = None,
    status: Optional[str] = None,  # "published", "draft", "all"
    is_featured: Optional[bool] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Public catalogue search and pagination endpoint."""
    query = db.query(Book)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            (Book.title.ilike(search_filter)) |
            (Book.isbn.ilike(search_filter)) |
            (Book.subject.ilike(search_filter)) |
            (Book.authors.any(Author.name.ilike(search_filter)))
        )

    if category_id:
        query = query.filter(
            (Book.category_id == category_id) | (Book.subcategory_id == category_id)
        )

    if author_id:
        query = query.filter(Book.authors.any(Author.id == author_id))

    if status == "published":
        query = query.filter(Book.is_draft == False)
    elif status == "draft":
        query = query.filter(Book.is_draft == True)

    if is_featured is not None:
        query = query.filter(Book.is_featured == is_featured)

    # Sorting
    sort_column = getattr(Book, sort_by, Book.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    total = query.count()
    offset = (page - 1) * limit
    books = query.offset(offset).limit(limit).all()

    return {
        "items": [serialize_book(b) for b in books],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if total > 0 else 1
    }

@router.get("/{book_id}", response_model=BookResponse)
def get_book(book_id: int, db: Session = Depends(get_db)):
    """Public single monograph lookup."""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return serialize_book(book)

@router.post("", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(
    book_in: BookCreate,
    current_admin: User = Depends(require_content_manager),
    db: Session = Depends(get_db)
):
    """Register a new academic title (Content Manager / Super Admin only)."""
    # Validate pricing
    if book_in.mrp > 0 and book_in.selling_price > book_in.mrp:
        raise HTTPException(
            status_code=400,
            detail=f"Selling price (₹{book_in.selling_price}) cannot exceed MRP (₹{book_in.mrp})"
        )

    # Validate ISBN uniqueness if provided
    if book_in.isbn and book_in.isbn.strip():
        clean_isbn = book_in.isbn.strip()
        existing_isbn = db.query(Book).filter(Book.isbn == clean_isbn).first()
        if existing_isbn:
            raise HTTPException(
                status_code=400,
                detail=f"A book with ISBN '{clean_isbn}' already exists: '{existing_isbn.title}'"
            )

    book_dict = book_in.model_dump(exclude={"author_ids", "additional_images"})
    if book_dict.get("isbn"):
        book_dict["isbn"] = book_dict["isbn"].strip()
    
    # Sanitize text
    book_dict["title"] = sanitize_html(book_dict.get("title"))
    book_dict["short_description"] = sanitize_html(book_dict.get("short_description"))
    book_dict["full_description"] = sanitize_html(book_dict.get("full_description"))

    book = Book(**book_dict)

    if book_in.additional_images:
        book.additional_images = json.dumps(book_in.additional_images)
    else:
        book.additional_images = json.dumps([])

    if book_in.author_ids:
        authors = db.query(Author).filter(Author.id.in_(book_in.author_ids)).all()
        book.authors = authors

    db.add(book)
    db.commit()
    db.refresh(book)

    # Activity log
    log = ActivityLog(
        user_id=current_admin.id,
        user_name=current_admin.username,
        action_type="publish" if not book.is_draft else "create",
        entity_type="book",
        entity_id=book.id,
        entity_name=book.title,
        description=f"Administrator '{current_admin.username}' {'published' if not book.is_draft else 'created draft'} monograph '{book.title}'"
    )
    db.add(log)
    db.commit()

    return serialize_book(book)

@router.put("/{book_id}", response_model=BookResponse)
def update_book(
    book_id: int,
    book_in: BookUpdate,
    current_admin: User = Depends(require_content_manager),
    db: Session = Depends(get_db)
):
    """Update title details (Content Manager / Super Admin only)."""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    update_data = book_in.model_dump(exclude_unset=True)

    # Validate pricing if either price or mrp is updated
    effective_sp = update_data.get("selling_price", book.selling_price)
    effective_mrp = update_data.get("mrp", book.mrp)
    if effective_mrp > 0 and effective_sp > effective_mrp:
        raise HTTPException(
            status_code=400,
            detail=f"Selling price (₹{effective_sp}) cannot exceed MRP (₹{effective_mrp})"
        )

    # Validate ISBN uniqueness if updated
    if "isbn" in update_data and update_data["isbn"]:
        clean_isbn = update_data["isbn"].strip()
        update_data["isbn"] = clean_isbn
        existing_isbn = db.query(Book).filter(Book.isbn == clean_isbn, Book.id != book_id).first()
        if existing_isbn:
            raise HTTPException(
                status_code=400,
                detail=f"A book with ISBN '{clean_isbn}' already exists: '{existing_isbn.title}'"
            )

    if "author_ids" in update_data:
        author_ids = update_data.pop("author_ids")
        if author_ids is not None:
            authors = db.query(Author).filter(Author.id.in_(author_ids)).all()
            book.authors = authors

    if "additional_images" in update_data:
        add_imgs = update_data.pop("additional_images")
        if add_imgs is not None:
            book.additional_images = json.dumps(add_imgs)

    for field, value in update_data.items():
        if field in ["title", "short_description", "full_description"]:
            value = sanitize_html(value)
        setattr(book, field, value)

    log = ActivityLog(
        user_id=current_admin.id,
        user_name=current_admin.username,
        action_type="update",
        entity_type="book",
        entity_id=book.id,
        entity_name=book.title,
        description=f"Administrator '{current_admin.username}' updated monograph '{book.title}'"
    )
    db.add(log)
    db.commit()
    db.refresh(book)

    return serialize_book(book)

@router.post("/{book_id}/toggle-publish")
def toggle_publish(
    book_id: int,
    current_admin: User = Depends(require_content_manager),
    db: Session = Depends(get_db)
):
    """Toggle draft / published visibility status (Content Manager / Super Admin only)."""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    book.is_draft = not book.is_draft
    new_status = "draft" if book.is_draft else "published"

    log = ActivityLog(
        user_id=current_admin.id,
        user_name=current_admin.username,
        action_type="unpublish" if book.is_draft else "publish",
        entity_type="book",
        entity_id=book.id,
        entity_name=book.title,
        description=f"Administrator '{current_admin.username}' changed status of '{book.title}' to {new_status}"
    )
    db.add(log)
    db.commit()
    db.refresh(book)

    return {"id": book.id, "is_draft": book.is_draft, "status": new_status}

@router.post("/{book_id}/toggle-featured")
def toggle_featured(
    book_id: int,
    current_admin: User = Depends(require_content_manager),
    db: Session = Depends(get_db)
):
    """Toggle homepage featured badge status (Content Manager / Super Admin only)."""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    book.is_featured = not book.is_featured
    db.commit()
    db.refresh(book)

    return {"id": book.id, "is_featured": book.is_featured}

@router.delete("/{book_id}")
def delete_book(
    book_id: int,
    current_admin: User = Depends(require_content_manager),
    db: Session = Depends(get_db)
):
    """Delete a book record (Content Manager / Super Admin only)."""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    title = book.title
    log = ActivityLog(
        user_id=current_admin.id,
        user_name=current_admin.username,
        action_type="delete",
        entity_type="book",
        entity_id=book_id,
        entity_name=title,
        description=f"Administrator '{current_admin.username}' deleted book catalogue entry '{title}'"
    )
    db.add(log)
    db.delete(book)
    db.commit()

    return {"message": f"Book '{title}' deleted successfully", "id": book_id}
