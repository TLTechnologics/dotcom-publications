from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.models import Book, Author, Category, Publisher, ActivityLog
from backend.app.schemas.schemas import DashboardStats, ActivityLogResponse
from backend.app.api.books import serialize_book

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_books = db.query(Book).count()
    published_books = db.query(Book).filter(Book.is_draft == False).count()
    draft_books = db.query(Book).filter(Book.is_draft == True).count()
    total_authors = db.query(Author).count()
    total_categories = db.query(Category).count()
    total_publishers = db.query(Publisher).count()

    recent_books = db.query(Book).order_by(Book.created_at.desc()).limit(6).all()
    featured_books = db.query(Book).filter(Book.is_featured == True).order_by(Book.updated_at.desc()).limit(6).all()
    activities = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(10).all()

    return DashboardStats(
        total_books=total_books,
        published_books=published_books,
        draft_books=draft_books,
        total_authors=total_authors,
        total_categories=total_categories,
        total_publishers=total_publishers,
        recently_added_books=[serialize_book(b) for b in recent_books],
        featured_books=[serialize_book(b) for b in featured_books],
        recent_activity=[
            ActivityLogResponse(
                id=a.id,
                action_type=a.action_type,
                entity_type=a.entity_type,
                entity_id=a.entity_id,
                entity_name=a.entity_name,
                description=a.description,
                timestamp=a.timestamp
            )
            for a in activities
        ]
    )

@router.get("/activity", response_model=list[ActivityLogResponse])
def get_all_activity(db: Session = Depends(get_db)):
    activities = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(50).all()
    return [
        ActivityLogResponse(
            id=a.id,
            action_type=a.action_type,
            entity_type=a.entity_type,
            entity_id=a.entity_id,
            entity_name=a.entity_name,
            description=a.description,
            timestamp=a.timestamp
        )
        for a in activities
    ]
