from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

try:
    from backend.app.core.database import get_db
    from backend.app.core.deps import get_current_user
    from backend.app.models.models import Book, Author, Publisher, Order, User
    from backend.app.schemas.schemas import BookResponse, AuthorResponse, PublisherResponse, OrderResponse
    from backend.app.api.books import serialize_book
    from backend.app.api.orders import serialize_order
except ImportError:
    from app.core.database import get_db
    from app.core.deps import get_current_user
    from app.models.models import Book, Author, Publisher, Order, User
    from app.schemas.schemas import BookResponse, AuthorResponse, PublisherResponse, OrderResponse
    from app.api.books import serialize_book
    from app.api.orders import serialize_order

router = APIRouter(prefix="/search", tags=["Global Search"])

@router.get("")
def global_search(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Execute unified server-side search across books, authors, publishers, and orders."""
    term = f"%{q.strip()}%"

    # 1. Books
    books = db.query(Book).filter(
        or_(
            Book.title.ilike(term),
            Book.isbn.ilike(term),
            Book.subject.ilike(term)
        )
    ).limit(6).all()

    # 2. Authors
    authors = db.query(Author).filter(
        or_(
            Author.name.ilike(term),
            Author.email.ilike(term)
        )
    ).limit(6).all()

    # 3. Publishers
    publishers = db.query(Publisher).filter(
        or_(
            Publisher.name.ilike(term),
            Publisher.email.ilike(term)
        )
    ).limit(6).all()

    # 4. Orders (Only for Super Admin or Order Manager)
    orders = []
    if current_user.role in ["super-admin", "order_manager"]:
        orders_db = db.query(Order).filter(
            or_(
                Order.order_number.ilike(term),
                Order.customer_name.ilike(term),
                Order.customer_email.ilike(term),
                Order.customer_phone.ilike(term)
            )
        ).limit(6).all()
        orders = [serialize_order(o) for o in orders_db]

    return {
        "query": q,
        "books": [serialize_book(b) for b in books],
        "authors": [
            {
                "id": a.id,
                "name": a.name,
                "profile_picture": a.profile_picture,
                "books_count": len(a.books)
            }
            for a in authors
        ],
        "publishers": [
            {
                "id": p.id,
                "name": p.name,
                "logo_url": p.logo_url,
                "books_count": len(p.books)
            }
            for p in publishers
        ],
        "orders": orders
    }
