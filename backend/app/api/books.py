import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.models.models import Book, Author, Publisher, Category, ActivityLog
from backend.app.schemas.schemas import BookCreate, BookUpdate, BookResponse, BookAuthorBrief

router = APIRouter(prefix="/books", tags=["Books"])

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
        selling_price=book.selling_price,
        mrp=book.mrp,
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
    sort_by: str = "created_at",  # "created_at", "title", "selling_price"
    sort_order: str = "desc",     # "asc", "desc"
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Book)

    if search:
        search_filter = f"%{search}%"
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
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return serialize_book(book)

@router.post("", response_model=BookResponse, status_code=201)
def create_book(book_in: BookCreate, db: Session = Depends(get_db)):
    book_dict = book_in.model_dump(exclude={"author_ids", "additional_images"})
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
        action_type="publish" if not book.is_draft else "create",
        entity_type="book",
        entity_id=book.id,
        entity_name=book.title,
        description=f"{'Published' if not book.is_draft else 'Created draft for'} book '{book.title}'"
    )
    db.add(log)
    db.commit()

    return serialize_book(book)

@router.put("/{book_id}", response_model=BookResponse)
def update_book(book_id: int, book_in: BookUpdate, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    update_data = book_in.model_dump(exclude_unset=True)

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
        setattr(book, field, value)

    log = ActivityLog(
        action_type="update",
        entity_type="book",
        entity_id=book.id,
        entity_name=book.title,
        description=f"Updated details for book '{book.title}'"
    )
    db.add(log)
    db.commit()
    db.refresh(book)

    return serialize_book(book)

@router.post("/{book_id}/toggle-publish")
def toggle_publish(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    book.is_draft = not book.is_draft
    new_status = "draft" if book.is_draft else "published"

    log = ActivityLog(
        action_type="unpublish" if book.is_draft else "publish",
        entity_type="book",
        entity_id=book.id,
        entity_name=book.title,
        description=f"Changed publication status of '{book.title}' to {new_status}"
    )
    db.add(log)
    db.commit()
    db.refresh(book)

    return {"id": book.id, "is_draft": book.is_draft, "status": new_status}

@router.post("/{book_id}/toggle-featured")
def toggle_featured(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    book.is_featured = not book.is_featured
    db.commit()
    db.refresh(book)

    return {"id": book.id, "is_featured": book.is_featured}

@router.delete("/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    title = book.title
    log = ActivityLog(
        action_type="delete",
        entity_type="book",
        entity_id=book_id,
        entity_name=title,
        description=f"Deleted book catalogue entry '{title}'"
    )
    db.add(log)
    db.delete(book)
    db.commit()

    return {"message": f"Book '{title}' deleted successfully", "id": book_id}
