from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt

try:
    from backend.app.core.database import get_db
    from backend.app.core.security import decode_access_token
    from backend.app.models.models import User
except ImportError:
    from app.core.database import get_db
    from app.core.security import decode_access_token
    from app.models.models import User

# OAuth2 scheme extracts Authorization: Bearer <token>
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_token_from_request(request: Request, bearer_token: Optional[str] = Depends(oauth2_scheme)) -> Optional[str]:
    """Extract token from Authorization header or fallback to cookie."""
    if bearer_token:
        return bearer_token
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:].strip()
    return request.cookies.get("access_token")

def get_current_user(
    token: Optional[str] = Depends(get_token_from_request),
    db: Session = Depends(get_db)
) -> User:
    """Validate JWT token and return authenticated User record."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = decode_access_token(token)
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload credentials.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_id = int(user_id_str)
    except (jwt.PyJWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or token is invalid. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator account has been deactivated. Contact Super Admin.",
        )

    return user

def get_optional_user(
    token: Optional[str] = Depends(get_token_from_request),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Optional authentication for endpoints that support both anonymous and logged-in users."""
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        user_id_str = payload.get("sub")
        if user_id_str is None:
            return None
        user = db.query(User).filter(User.id == int(user_id_str), User.is_active == True).first()
        return user
    except Exception:
        return None

def require_super_admin(current_user: User = Depends(get_current_user)) -> User:
    """Enforce Super Administrator role."""
    if current_user.role != "super-admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Super Administrator privileges required."
        )
    return current_user

def require_content_manager(current_user: User = Depends(get_current_user)) -> User:
    """Enforce Content Manager or Super Admin role."""
    if current_user.role not in ["super-admin", "content_manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Content Manager or Super Administrator privileges required."
        )
    return current_user

def require_order_manager(current_user: User = Depends(get_current_user)) -> User:
    """Enforce Order Manager or Super Admin role."""
    if current_user.role not in ["super-admin", "order_manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Order Manager or Super Administrator privileges required."
        )
    return current_user

def require_non_viewer(current_user: User = Depends(get_current_user)) -> User:
    """Prevent read-only viewer accounts from performing mutating operations."""
    if current_user.role == "viewer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Viewer accounts have read-only access and cannot modify data."
        )
    return current_user
