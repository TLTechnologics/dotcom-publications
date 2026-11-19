import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

try:
    from backend.app.core.database import get_db
    from backend.app.models.models import Order, ActivityLog, Book
    from backend.app.schemas.schemas import OrderCreate, OrderResponse
except ImportError:
    from app.core.database import get_db
    from app.models.models import Order, ActivityLog, Book
    from app.schemas.schemas import OrderCreate, OrderResponse

router = APIRouter(prefix="/orders", tags=["Orders"])

class OrderStatusUpdate(BaseModel):
    status: str

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cannot place an order with an empty cart.")
    
    # Generate unique academic order number e.g. DCP-2026-XXXXX
    order_num = f"DCP-2026-{uuid.uuid4().hex[:6].upper()}"
    
    items_serialized = json.dumps([item.dict() for item in payload.items])
    
    order = Order(
        order_number=order_num,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        customer_phone=payload.customer_phone,
        shipping_address=payload.shipping_address,
        city=payload.city or "",
        state=payload.state or "",
        pincode=payload.pincode or "",
        items_json=items_serialized,
        total_amount=payload.total_amount,
        payment_method=payload.payment_method,
        status="Confirmed"
    )
    db.add(order)
    
    # Log activity
    log = ActivityLog(
        action_type="create",
        entity_type="order",
        entity_name=f"Order #{order_num}",
        description=f"New book order placed by {payload.customer_name} ({len(payload.items)} items, ₹{payload.total_amount})"
    )
    db.add(log)
    db.commit()
    db.refresh(order)
    return order

@router.get("", response_model=List[OrderResponse])
def get_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(Order)
    if status_filter:
        query = query.filter(Order.status == status_filter)
    return query.order_by(Order.created_at.desc()).all()

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = payload.status
    log = ActivityLog(
        action_type="update",
        entity_type="order",
        entity_id=order.id,
        entity_name=order.order_number,
        description=f"Order {order.order_number} status updated to {payload.status}"
    )
    db.add(log)
    db.commit()
    db.refresh(order)
    return order
