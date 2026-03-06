import os
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from starlette.requests import Request
from authlib.integrations.starlette_client import OAuth
from starlette.responses import RedirectResponse

from app.auth import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from app.database import create_user, get_user_by_email, update_user_display_name
from app.models import User, Token, RegisterRequest

router = APIRouter()


@router.get("/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return current_user


@router.patch("/me", response_model=User)
async def update_me_display_name(
    display_name: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
):
    """Update the current user's display name."""
    update_user_display_name(current_user.username, display_name)
    # Fetch updated user info
    updated_user = get_user_by_email(current_user.email)
    return updated_user


# ── Email / password auth ────────────────────────────────────────────


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    """Authenticate user and return a JWT access token."""
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/users/", response_model=User)
def register_user(req: RegisterRequest):
    """Create a new user and return the user details."""
    hashed = get_password_hash(req.password)
    user_id = create_user(req.username, req.email, hashed)
    return User(id=user_id, username=req.username, email=req.email)


# ── Google OAuth ─────────────────────────────────────────────────────

oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


@router.get("/auth/oauth/google")
async def google_login(request: Request):
    """Redirect the user to Google's OAuth consent screen."""
    redirect_uri = str(request.url_for("google_callback"))
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/auth/oauth/google/callback", name="google_callback")
async def google_callback(request: Request):
    """Handle the redirect back from Google and issue a JWT."""
    token = await oauth.google.authorize_access_token(request)
    userinfo = token.get("userinfo")
    if not userinfo:
        raise HTTPException(status_code=400, detail="Failed to fetch user info")

    email = userinfo.get("email")
    sub = userinfo.get("sub")
    name = userinfo.get("name")

    if not email or not sub:
        raise HTTPException(status_code=400, detail="Invalid Google user info")

    user = get_user_by_email(email)
    if not user:
        create_user(
            username=email,
            email=email,
            password_hash=None,
            oauth_provider="google",
            oauth_id=sub,
            display_name=name,
        )
        username = email
    else:
        username = user["username"]

    access_token = create_access_token(
        data={"sub": username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    # Redirect back to frontend with the token
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    return RedirectResponse(url=f"{frontend_url}/auth/callback?token={access_token}")
