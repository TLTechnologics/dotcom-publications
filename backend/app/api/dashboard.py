import json
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

try:
    from backend.app.core.database import get_db
    from backend.app.core.deps import get_current_user
    from backend.app.models.models import Book, Author, Category, Publisher, ActivityLog, Order, OrderItem, User
    from backend.app.schemas.schemas import (
        DashboardStats, ActivityLogResponse, DashboardAnalytics,
        MonthlyRevenueItem, OrderStatusCount, TopSellingBook, OrderResponse, OrderItemBrief
    )
    from backend.app.api.books import serialize_book
except ImportError:
    from app.core.database import get_db
    from app.core.deps import get_current_user
    from app.models.models import Book, Author, Category, Publisher, ActivityLog, Order, OrderItem, User
    from app.schemas.schemas import (
        DashboardStats, ActivityLogResponse, DashboardAnalytics,
        MonthlyRevenueItem, OrderStatusCount, TopSellingBook, OrderResponse, OrderItemBrief
    )
    from app.api.books import serialize_book

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve comprehensive publishing house metrics calculated from live database records."""
    total_books = db.query(Book).count()
    published_books = db.query(Book).filter(Book.is_draft == False).count()
    draft_books = db.query(Book).filter(Book.is_draft == True).count()
    total_authors = db.query(Author).count()
    total_categories = db.query(Category).count()
    total_publishers = db.query(Publisher).count()

    # Order and Revenue Metrics
    total_orders = db.query(Order).count()
    revenue_sum = db.query(func.sum(Order.total_amount)).filter(Order.status != "Cancelled").scalar()
    total_revenue = float(revenue_sum or 0.0)

    pending_orders = db.query(Order).filter(Order.status == "Confirmed").count()
    processing_orders = db.query(Order).filter(Order.status == "Processing").count()
    completed_orders = db.query(Order).filter(Order.status.in_(["Shipped", "Delivered"])).count()
    cancelled_orders = db.query(Order).filter(Order.status == "Cancelled").count()

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
        total_orders=total_orders,
        total_revenue=total_revenue,
        pending_orders=pending_orders,
        processing_orders=processing_orders,
        completed_orders=completed_orders,
        cancelled_orders=cancelled_orders,
        recently_added_books=[serialize_book(b) for b in recent_books],
        featured_books=[serialize_book(b) for b in featured_books],
        recent_activity=[
            ActivityLogResponse(
                id=a.id,
                user_id=a.user_id,
                user_name=a.user_name,
                action_type=a.action_type,
                entity_type=a.entity_type,
                entity_id=a.entity_id,
                entity_name=a.entity_name,
                description=a.description,
                ip_address=a.ip_address,
                timestamp=a.timestamp
            )
            for a in activities
        ]
    )

@router.get("/analytics", response_model=DashboardAnalytics)
def get_dashboard_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve detailed charts and sales analytics aggregated from orders."""
    # 1. Order Status Breakdown
    statuses = ["Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"]
    status_distribution = []
    for s in statuses:
        count = db.query(Order).filter(Order.status == s).count()
        status_distribution.append(OrderStatusCount(status=s, count=count))

    # 2. Monthly Revenue from Orders
    orders = db.query(Order).order_by(Order.created_at.asc()).all()
    monthly_data = defaultdict(lambda: {"revenue": 0.0, "orders_count": 0})
    for o in orders:
        month_key = o.created_at.strftime("%b %Y")
        monthly_data[month_key]["orders_count"] += 1
        if o.status != "Cancelled":
            monthly_data[month_key]["revenue"] += float(o.total_amount)

    monthly_revenue = [
        MonthlyRevenueItem(
            month=k,
            revenue=round(v["revenue"], 2),
            orders_count=v["orders_count"]
        )
        for k, v in monthly_data.items()
    ]
    if not monthly_revenue:
        # Default empty month if no orders yet
        import datetime
        monthly_revenue = [MonthlyRevenueItem(month=datetime.date.today().strftime("%b %Y"), revenue=0.0, orders_count=0)]

    # 3. Top Selling Books Aggregation
    book_sales = defaultdict(lambda: {"title": "", "cover_image": None, "units": 0, "revenue": 0.0})
    for o in orders:
        if o.status == "Cancelled":
            continue
        try:
            items = json.loads(o.items_json) if o.items_json else []
            for item in items:
                b_id = item.get("book_id") or 0
                qty = item.get("quantity", 1)
                price = float(item.get("price", 0.0))
                book_sales[b_id]["title"] = item.get("title", f"Book #{b_id}")
                book_sales[b_id]["cover_image"] = item.get("cover_image")
                book_sales[b_id]["units"] += qty
                book_sales[b_id]["revenue"] += price * qty
        except Exception:
            pass

    top_books = sorted(
        [
            TopSellingBook(
                book_id=k,
                title=v["title"],
                cover_image=v["cover_image"],
                units_sold=v["units"],
                total_revenue=round(v["revenue"], 2)
            )
            for k, v in book_sales.items() if k > 0
        ],
        key=lambda x: x.total_revenue,
        reverse=True
    )[:5]

    # 4. Recent Orders
    recent_orders_db = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()
    recent_orders = []
    for ro in recent_orders_db:
        items_list = []
        try:
            raw_items = json.loads(ro.items_json) if ro.items_json else []
            items_list = [OrderItemBrief(**it) for it in raw_items]
        except Exception:
            pass

        recent_orders.append(
            OrderResponse(
                id=ro.id,
                order_number=ro.order_number,
                customer_name=ro.customer_name,
                customer_email=ro.customer_email,
                customer_phone=ro.customer_phone,
                shipping_address=ro.shipping_address,
                city=ro.city,
                state=ro.state,
                pincode=ro.pincode,
                items_json=ro.items_json,
                items=items_list,
                total_amount=float(ro.total_amount),
                payment_method=ro.payment_method,
                status=ro.status,
                created_at=ro.created_at
            )
        )

    return DashboardAnalytics(
        monthly_revenue=monthly_revenue,
        order_status_distribution=status_distribution,
        top_selling_books=top_books,
        recent_orders=recent_orders
    )

@router.get("/activity", response_model=list[ActivityLogResponse])
def get_all_activity(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve historical administrator activity log."""
    activities = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(limit).all()
    return [
        ActivityLogResponse(
            id=a.id,
            user_id=a.user_id,
            user_name=a.user_name,
            action_type=a.action_type,
            entity_type=a.entity_type,
            entity_id=a.entity_id,
            entity_name=a.entity_name,
            description=a.description,
            ip_address=a.ip_address,
            timestamp=a.timestamp
        )
        for a in activities
    ]
