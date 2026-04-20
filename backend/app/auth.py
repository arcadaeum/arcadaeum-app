# backend/app/auth.py
from datetime import datetime, timedelta, timezone
from typing import Optional
import secrets

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from app.models import User, UserInDB, TokenData
import os

from app.services.email import send_password_reset_email
from app import database

# Authentication utilities for handling user authentication, password hashing, and JWT token management.
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")  # see router below


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain, hashed)


def get_password_hash(password: str) -> str:
    """Hash a password for storing in the database."""
    return pwd_context.hash(password)


def authenticate_user(username_or_email: str, password: str):
    user = database.get_user_by_username(username_or_email)
    if not user:
        user = database.get_user_by_email(username_or_email)
    if not user or not user["password_hash"]:
        return None
    if not verify_password(password, user["password_hash"]):
        return None
    return User(**user)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token with an optional expiration time."""
    to_encode = data.copy()  # Create a copy of the data to encode in the token

    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=15)
    )  # Default to 15 minutes if no expiration is provided

    to_encode.update({"exp": expire})  # Add expiration time to the token payload

    return jwt.encode(
        to_encode, SECRET_KEY, algorithm=ALGORITHM
    )  # Encode the token with the secret key and algorithm


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get the current user based on the JWT token provided in the request."""
    credentials_exception = (
        HTTPException(  # Raised if the token is invalid or the user cannot be found
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    )

    try:
        payload = jwt.decode(
            token, SECRET_KEY, algorithms=[ALGORITHM]
        )  # Decode the token to get the payload

        username: str = payload.get("sub")  # Used to store the username or user ID

        if username is None:
            raise credentials_exception

        token_data = TokenData(username=username)

    except JWTError:
        raise credentials_exception

    user_dict = database.get_user_by_username(token_data.username)

    if user_dict is None:
        raise credentials_exception

    return User(**user_dict)


async def get_current_active_user(current_user: User = Depends(get_current_user)):
    """Get the current active user"""
    return current_user


# Password reset functionality


def generate_reset_token() -> str:
    """Generate a secure random reset token."""
    return secrets.token_urlsafe(32)


async def create_password_reset_link(
    email: str, frontend_url: str = "http://localhost:5173"
) -> dict:
    """Create and send a password reset token for a user."""
    # Find user by email
    user = database.get_user_by_email(email)

    if not user:
        # Don't reveal if email exists
        return {
            "success": True,
            "message": "If an account with that email exists, a reset link has been sent.",
        }

    # Generate reset token
    reset_token = generate_reset_token()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    # Store token in database
    stored = database.create_password_reset_token(user["id"], reset_token, expires_at)

    if not stored:
        return {"success": False, "message": "Failed to create reset token"}

    # Send email
    email_sent = await send_password_reset_email(email, reset_token, frontend_url)

    if not email_sent:
        return {"success": False, "message": "Failed to send reset email"}

    return {
        "success": True,
        "message": "If an account with that email exists, a reset link has been sent.",
    }


def reset_password_with_token(token: str, new_password: str) -> dict:
    """Verify token and reset user's password."""
    # Get token from database
    token_data = database.get_password_reset_token(token)

    if not token_data:
        return {"success": False, "message": "Invalid or expired reset token"}

    # Check if token is expired (ensure timezone awareness for comparison)
    expires_at = token_data["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < datetime.now(timezone.utc):
        return {"success": False, "message": "Reset token has expired"}

    # Hash new password
    password_hash = get_password_hash(new_password)

    # Update user's password
    updated = database.update_user_password(token_data["user_id"], password_hash)

    if not updated:
        return {"success": False, "message": "Failed to update password"}

    # Mark token as used
    database.mark_reset_token_as_used(token_data["id"])

    return {"success": True, "message": "Password has been reset successfully"}
