from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_

try:
    from backend.app.core.database import get_db
    from backend.app.core.security import verify_password, hash_password, create_access_token
    from backend.app.core.deps import get_current_user
    from backend.app.models.models import User, ActivityLog
    from backend.app.schemas.schemas import LoginRequest, TokenResponse, UserResponse, UserPasswordChange
except ImportError:
    from app.core.database import get_db
    from app.core.security import verify_password, hash_password, create_access_token
    from app.core.deps import get_current_user
    from app.models.models import User, ActivityLog
    from app.schemas.schemas import LoginRequest, TokenResponse, UserResponse, UserPasswordChange

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Authenticate administrator using username or email and bcrypt password verification."""
    identifier = payload.username_or_email.strip().lower()
    user = db.query(User).filter(
        or_(
            User.username.ilike(identifier),
            User.email.ilike(identifier)
        )
    ).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        # Prevent timing attacks and brute forcing with uniform rejection
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact your Super Administrator."
        )

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    
    # Log audit trail
    client_ip = request.client.host if request.client else "unknown"
    log = ActivityLog(
        user_id=user.id,
        user_name=user.username,
        action_type="login",
        entity_type="user",
        entity_id=user.id,
        entity_name=user.username,
        description=f"Administrator '{user.full_name}' ({user.role}) authenticated successfully from {client_ip}.",
        ip_address=client_ip
    )
    db.add(log)
    db.commit()
    db.refresh(user)

    token_data = {
        "sub": str(user.id),
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "name": user.full_name
    }
    access_token = create_access_token(data=token_data)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

@router.get("/me", response_model=UserResponse)
def get_current_profile(current_user: User = Depends(get_current_user)):
    """Return currently authenticated administrator profile."""
    return current_user

@router.post("/change-password")
def change_password(
    payload: UserPasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Securely update administrator password with current password verification."""
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed."
        )

    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long."
        )

    current_user.hashed_password = hash_password(payload.new_password)
    current_user.updated_at = datetime.now(timezone.utc)
    
    log = ActivityLog(
        user_id=current_user.id,
        user_name=current_user.username,
        action_type="update",
        entity_type="user",
        entity_id=current_user.id,
        entity_name=current_user.username,
        description=f"Administrator '{current_user.username}' changed their security access credentials."
    )
    db.add(log)
    db.commit()

    return {"message": "Password updated successfully."}

@router.post("/logout")
def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record server-side session termination audit log."""
    client_ip = request.client.host if request.client else "unknown"
    log = ActivityLog(
        user_id=current_user.id,
        user_name=current_user.username,
        action_type="logout",
        entity_type="user",
        entity_id=current_user.id,
        entity_name=current_user.username,
        description=f"Administrator '{current_user.username}' signed out.",
        ip_address=client_ip
    )
    db.add(log)
    db.commit()
    return {"message": "Signed out successfully."}
