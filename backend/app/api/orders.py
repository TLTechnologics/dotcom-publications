import json
import uuid
import csv
import io
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel

try:
    from backend.app.core.database import get_db
    from backend.app.core.deps import require_order_manager, get_current_user
    from backend.app.models.models import Order, OrderItem, ActivityLog, Book, Notification, User
    from backend.app.schemas.schemas import OrderCreate, OrderResponse, PaginatedOrdersResponse, OrderItemBrief
except ImportError:
    from app.core.database import get_db
    from app.core.deps import require_order_manager, get_current_user
    from app.models.models import Order, OrderItem, ActivityLog, Book, Notification, User
    from app.schemas.schemas import OrderCreate, OrderResponse, PaginatedOrdersResponse, OrderItemBrief

router = APIRouter(prefix="/orders", tags=["Orders"])

VALID_STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"]

ALLOWED_TRANSITIONS = {
    "Pending": {"Confirmed", "Cancelled"},
    "Confirmed": {"Processing", "Cancelled"},
    "Processing": {"Shipped", "Cancelled"},
    "Shipped": {"Delivered", "Cancelled"},
    "Delivered": set(),
    "Cancelled": set()
}

class OrderStatusUpdate(BaseModel):
    status: str

def serialize_order(order: Order) -> OrderResponse:
    """Helper to convert Order DB model to OrderResponse including items."""
    items_list = []
    # First try relation
    if order.items:
        items_list = [
            OrderItemBrief(
                id=item.id,
                book_id=item.book_id,
                title=item.title,
                price=float(item.price),
                quantity=item.quantity,
                cover_image=item.cover_image
            )
            for item in order.items
        ]
    elif order.items_json:
        try:
            raw = json.loads(order.items_json)
            items_list = [OrderItemBrief(**it) for it in raw]
        except Exception:
            items_list = []

    return OrderResponse(
        id=order.id,
        order_number=order.order_number,
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        customer_phone=order.customer_phone,
        shipping_address=order.shipping_address,
        city=order.city,
        state=order.state,
        pincode=order.pincode,
        items_json=order.items_json,
        items=items_list,
        total_amount=float(order.total_amount),
        payment_method=order.payment_method,
        status=order.status,
        created_at=order.created_at
    )

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    """Public customer checkout endpoint: creates order with normalized line items."""
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cannot place an order with an empty cart.")
    
    order_num = f"DCP-2026-{uuid.uuid4().hex[:6].upper()}"
    items_serialized = json.dumps([item.dict() for item in payload.items])
    calculated_total = payload.total_amount if payload.total_amount is not None else sum(it.price * it.quantity for it in payload.items)
    
    order = Order(
        order_number=order_num,
        customer_name=payload.customer_name.strip(),
        customer_email=payload.customer_email.strip().lower(),
        customer_phone=payload.customer_phone.strip(),
        shipping_address=payload.shipping_address.strip(),
        city=payload.city or "",
        state=payload.state or "",
        pincode=payload.pincode or "",
        items_json=items_serialized,
        total_amount=calculated_total,
        payment_method=payload.payment_method,
        status="Confirmed",
        created_at=datetime.now(timezone.utc)
    )
    db.add(order)
    db.flush()

    # Create normalized order line items
    for item in payload.items:
        order_item = OrderItem(
            order_id=order.id,
            book_id=item.book_id if item.book_id and item.book_id > 0 else None,
            title=item.title,
            price=item.price,
            quantity=item.quantity,
            cover_image=item.cover_image
        )
        db.add(order_item)

    # Activity log
    log = ActivityLog(
        action_type="create",
        entity_type="order",
        entity_id=order.id,
        entity_name=order_num,
        description=f"New book order placed by {payload.customer_name} ({len(payload.items)} items, ₹{payload.total_amount:.2f})"
    )
    db.add(log)

    # Trigger admin notification
    notif = Notification(
        title=f"New Order #{order_num}",
        message=f"Received order from {payload.customer_name} for ₹{payload.total_amount:.2f}.",
        type="order",
        link="/admin/orders"
    )
    db.add(notif)

    db.commit()
    db.refresh(order)
    return serialize_order(order)

@router.get("", response_model=PaginatedOrdersResponse)
def get_orders(
    search: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_admin: User = Depends(require_order_manager),
    db: Session = Depends(get_db)
):
    """Retrieve paginated customer book orders (Authorized administrators only)."""
    query = db.query(Order)
    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Order.order_number.ilike(search_filter),
                Order.customer_name.ilike(search_filter),
                Order.customer_email.ilike(search_filter),
                Order.customer_phone.ilike(search_filter),
                Order.city.ilike(search_filter)
            )
        )
    if status_filter and status_filter != "all":
        query = query.filter(Order.status == status_filter)

    total = query.count()
    offset = (page - 1) * limit
    orders = query.order_by(Order.created_at.desc()).offset(offset).limit(limit).all()

    return PaginatedOrdersResponse(
        items=[serialize_order(o) for o in orders],
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit if total > 0 else 1
    )

@router.get("/export/csv")
def export_orders_csv(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_admin: User = Depends(require_order_manager),
    db: Session = Depends(get_db)
):
    """Export orders to a downloadable CSV spreadsheet."""
    query = db.query(Order)
    if status_filter and status_filter != "all":
        query = query.filter(Order.status == status_filter)
    orders = query.order_by(Order.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Order Number", "Date", "Customer Name", "Email", "Phone",
        "Shipping Address", "City", "State", "Pincode", "Total Amount (INR)",
        "Payment Method", "Status"
    ])

    for o in orders:
        writer.writerow([
            o.order_number,
            o.created_at.strftime("%Y-%m-%d %H:%M:%S") if o.created_at else "",
            o.customer_name,
            o.customer_email,
            o.customer_phone,
            o.shipping_address,
            o.city,
            o.state,
            o.pincode,
            f"{float(o.total_amount):.2f}",
            o.payment_method,
            o.status
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=dotcom_orders_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
    )

@router.get("/{order_id}", response_model=OrderResponse)
def get_order_details(
    order_id: int,
    current_admin: User = Depends(require_order_manager),
    db: Session = Depends(get_db)
):
    """Get single customer order details with line items."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return serialize_order(order)

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    current_admin: User = Depends(require_order_manager),
    db: Session = Depends(get_db)
):
    """Update order fulfillment status with state machine transition validation."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    new_status = payload.status
    if new_status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{new_status}'. Allowed: {', '.join(VALID_STATUSES)}"
        )

    # Validate transition
    allowed = ALLOWED_TRANSITIONS.get(order.status, set())
    if new_status != order.status and new_status not in allowed and current_admin.role != "super-admin":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition order from '{order.status}' to '{new_status}'. Allowed transitions: {', '.join(allowed) or 'None'}"
        )

    prev_status = order.status
    order.status = new_status
    
    log = ActivityLog(
        user_id=current_admin.id,
        user_name=current_admin.username,
        action_type="update",
        entity_type="order",
        entity_id=order.id,
        entity_name=order.order_number,
        description=f"Order {order.order_number} status updated from '{prev_status}' to '{new_status}' by {current_admin.username}"
    )
    db.add(log)
    db.commit()
    db.refresh(order)
    return serialize_order(order)
