# backend/app/auth.py
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from models import *
import os

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


def authenticate_user(username: str, password: str):
    """Authenticate a user by username and password."""
    user_dict = database.get_user_by_username(username)
    if not user_dict:
        return False

    user = UserInDB(**user_dict)  # Convert dict to UserInDB model for type safety

    if not verify_password(password, user.password_hash):
        return False

    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token with an optional expiration time."""
    to_encode = data.copy()  # Create a copy of the data to encode in the token

    expire = datetime.now(datetime.timezone.utc) + (
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
