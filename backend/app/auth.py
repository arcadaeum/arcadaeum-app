import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app import database
from app.models import TokenData, User
from app.services.email import send_password_reset_email

secret_key = os.getenv("SECRET_KEY")
if not secret_key:
    raise RuntimeError("SECRET_KEY environment variable is not set")


# Authentication utilities for handling user authentication, password hashing, and JWT token management.
SECRET_KEY: str = secret_key
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")  # see router below


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain, hashed)


def get_password_hash(password: str) -> str:
    """Hash a password for storing in the database."""
    return pwd_context.hash(password)


def authenticate_user(username_or_email: str, password: str) -> User | None:
    user = database.get_user_by_username(username_or_email)
    if user is None:
        user = database.get_user_by_email(username_or_email)
    if user is None:
        return None

    password_hash = user.get("password_hash")
    if not isinstance(password_hash, str):
        return None

    if not verify_password(password, password_hash):
        return None

    return User(**user)


def create_access_token(
    data: dict[str, object], expires_delta: timedelta | None = None
) -> str:
    """Create a JWT access token with an optional expiration time."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """Get the current user based on the JWT token provided in the request."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if not isinstance(sub, str):
            raise credentials_exception
        token_data = TokenData(username=sub)
    except JWTError:
        raise credentials_exception

    username = token_data.username
    if username is None:
        raise credentials_exception

    user_dict = database.get_user_by_username(username)
    if user_dict is None:
        raise credentials_exception

    return User(**user_dict)


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get the current active user."""
    return current_user


def generate_reset_token() -> str:
    """Generate a secure random reset token."""
    return secrets.token_urlsafe(32)


async def create_password_reset_link(
    email: str, frontend_url: str = "http://localhost:5173"
) -> dict[str, object]:
    """Create and send a password reset token for a user."""
    user = database.get_user_by_email(email)

    if not user:
        return {
            "success": True,
            "message": "If an account with that email exists, a reset link has been sent.",
        }

    reset_token = generate_reset_token()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    stored = database.create_password_reset_token(user["id"], reset_token, expires_at)
    if not stored:
        return {"success": False, "message": "Failed to create reset token"}

    email_sent = await send_password_reset_email(email, reset_token, frontend_url)
    if not email_sent:
        return {"success": False, "message": "Failed to send reset email"}

    return {
        "success": True,
        "message": "If an account with that email exists, a reset link has been sent.",
    }


def reset_password_with_token(token: str, new_password: str) -> dict[str, object]:
    """Verify token and reset user's password."""
    token_data = database.get_password_reset_token(token)

    if not token_data:
        return {"success": False, "message": "Invalid or expired reset token"}

    expires_at = token_data["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < datetime.now(timezone.utc):
        return {"success": False, "message": "Reset token has expired"}

    password_hash = get_password_hash(new_password)
    updated = database.update_user_password(token_data["user_id"], password_hash)
    if not updated:
        return {"success": False, "message": "Failed to update password"}

    database.mark_reset_token_as_used(token_data["id"])
    return {"success": True, "message": "Password has been reset successfully"}
