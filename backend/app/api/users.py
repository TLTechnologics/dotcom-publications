from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

try:
    from backend.app.core.database import get_db
    from backend.app.core.security import hash_password
    from backend.app.core.deps import require_super_admin, get_current_user
    from backend.app.models.models import User, ActivityLog
    from backend.app.schemas.schemas import UserCreate, UserUpdate, UserResponse
except ImportError:
    from app.core.database import get_db
    from app.core.security import hash_password
    from app.core.deps import require_super_admin, get_current_user
    from app.models.models import User, ActivityLog
    from app.schemas.schemas import UserCreate, UserUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["User Management"])

VALID_ROLES = {"admin", "super-admin"}

@router.get("", response_model=List[UserResponse])
def get_users(
    search: Optional[str] = None,
    role: Optional[str] = None,
    current_admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """List all registered administrators (Super Admin only)."""
    query = db.query(User)
    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.username.ilike(search_filter),
                User.full_name.ilike(search_filter),
                User.email.ilike(search_filter)
            )
        )
    if role and role != "all":
        query = query.filter(User.role == role)
    
    return query.order_by(User.created_at.desc()).all()

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    current_admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Create a new administrator account (Super Admin only)."""
    # Single Administrator role
    user_role = "admin"

    # Check email / username uniqueness
    existing_user = db.query(User).filter(
        or_(
            User.username == payload.username.strip(),
            User.email == payload.email.strip().lower()
        )
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username or email already exists."
        )

    user = User(
        username=payload.username.strip(),
        email=payload.email.strip().lower(),
        full_name=payload.full_name.strip(),
        role=user_role,
        is_active=payload.is_active,
        hashed_password=hash_password(payload.password),
        created_at=datetime.now(timezone.utc)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Audit log
    log = ActivityLog(
        user_id=current_admin.id,
        user_name=current_admin.username,
        action_type="create",
        entity_type="user",
        entity_id=user.id,
        entity_name=user.username,
        description=f"Created administrator account '{user.username}' with role '{user.role}'"
    )
    db.add(log)
    db.commit()

    return user

@router.get("/{user_id}", response_model=UserResponse)
def get_user_details(
    user_id: int,
    current_admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Retrieve administrator details (Super Admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: UserUpdate,
    current_admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Update administrator details, role, or active status (Super Admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Prevent deactivating the last active administrator
    if payload.is_active is False and user.role in ["admin", "super-admin"]:
        active_admins = db.query(User).filter(User.role.in_(["admin", "super-admin"]), User.is_active == True).count()
        if active_admins <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate the only remaining active Administrator."
            )

    if payload.email:
        user.email = payload.email.strip().lower()
    if payload.username:
        user.username = payload.username.strip()
    if payload.full_name:
        user.full_name = payload.full_name.strip()
    if payload.role:
        if payload.role not in VALID_ROLES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be 'admin'"
            )
        user.role = "admin"
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.password:
        user.hashed_password = hash_password(payload.password)

    user.updated_at = datetime.now(timezone.utc)
    
    log = ActivityLog(
        user_id=current_admin.id,
        user_name=current_admin.username,
        action_type="update",
        entity_type="user",
        entity_id=user.id,
        entity_name=user.username,
        description=f"Updated details/role for administrator '{user.username}'"
    )
    db.add(log)
    db.commit()
    db.refresh(user)

    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Delete an administrator account (Super Admin only)."""
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account while logged in."
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    username = user.username
    db.delete(user)
    
    log = ActivityLog(
        user_id=current_admin.id,
        user_name=current_admin.username,
        action_type="delete",
        entity_type="user",
        entity_id=user_id,
        entity_name=username,
        description=f"Permanently deleted administrator account '{username}'"
    )
    db.add(log)
    db.commit()

    return {"message": f"Administrator '{username}' deleted successfully."}
