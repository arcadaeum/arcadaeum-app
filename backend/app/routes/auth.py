from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.auth import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    Token,
    User,
)

from app.database import create_user

router = APIRouter()


@router.post("/token", response_model=Token)  # Endpoint for user login and token generation
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
):  # Authenticate user and return JWT access token
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )  # Create a JWT access token with the username as the subject and an expiration time
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }  # Return the access token and token type in the response


@router.post("/users/", response_model=User)
def register_user(username: str, email: str, password: str):
    """Endpoint for user registration. Creates a new user and returns the user details."""
    hashed = get_password_hash(password)  # Hash the user's password for secure storage
    user_id = create_user(
        username, email, hashed
    )  # Create a new user in the database and get the user's ID
    return User(id=user_id, username=username, email=email)
