import asyncio
import os
from datetime import timedelta

import httpx
from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from starlette.requests import Request
from starlette.responses import RedirectResponse, Response

from app.database import (
    create_user,
    get_user_by_email,
    update_user_display_name,
)
from app.models.auth import (
    PasswordReset,
    PasswordResetRequest,
    PasswordResetResponse,
    RegisterRequest,
    Token,
    User,
)
from app.services.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    authenticate_user,
    create_access_token,
    create_password_reset_link,
    get_current_user,
    get_password_hash,
    reset_password_with_token,
)

router = APIRouter()


@router.get("/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)) -> User:
    """Return the currently authenticated user."""
    return current_user


@router.patch("/me", response_model=User)
async def update_me_display_name(
    display_name: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
) -> User:
    """Update the current user's display name."""
    update_user_display_name(current_user.username, display_name)

    updated_user = get_user_by_email(current_user.email)
    if updated_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found after update",
        )

    return User(**updated_user)


# ── Email / password auth ────────────────────────────────────────────


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Token:
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
    return Token(access_token=access_token, token_type="bearer")


@router.post("/users/", response_model=User)
def register_user(req: RegisterRequest) -> User:
    """Create a new user and return the user details."""
    hashed = get_password_hash(req.password)
    user_id = create_user(
        username=req.username,
        email=req.email,
        password_hash=hashed,
        oauth_provider=None,
        oauth_id=None,
        display_name=None,
        profile_picture=None,
    )
    return User(id=user_id, username=req.username, email=req.email)


# ── Google OAuth ─────────────────────────────────────────────────────

google_client_id = os.getenv("GOOGLE_CLIENT_ID")
google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
if not google_client_id or not google_client_secret:
    raise RuntimeError(
        "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required"
    )

oauth = OAuth()
oauth.register(
    name="google",
    client_id=google_client_id,
    client_secret=google_client_secret,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


@router.get("/auth/oauth/google")
async def google_login(request: Request) -> Response:
    """Redirect the user to Google's OAuth consent screen."""
    redirect_uri = str(request.url_for("google_callback"))
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/auth/oauth/google/callback", name="google_callback")
async def google_callback(request: Request) -> RedirectResponse:
    """Handle the redirect back from Google and issue a JWT."""
    token = await oauth.google.authorize_access_token(request)
    userinfo = token.get("userinfo")
    if not isinstance(userinfo, dict):
        raise HTTPException(status_code=400, detail="Failed to fetch user info")

    email = userinfo.get("email")
    sub = userinfo.get("sub")
    name = userinfo.get("name")
    profile_picture = userinfo.get("picture")

    if not isinstance(email, str) or not isinstance(sub, str):
        raise HTTPException(status_code=400, detail="Invalid Google user info")

    safe_name = name if isinstance(name, str) else None
    safe_profile_picture = profile_picture if isinstance(profile_picture, str) else None

    user = get_user_by_email(email)
    if not user:
        create_user(
            username=email,
            email=email,
            password_hash=None,
            oauth_provider="google",
            oauth_id=sub,
            display_name=safe_name,
            profile_picture=safe_profile_picture,
        )
        username = email
    else:
        username_obj = user.get("username")
        if not isinstance(username_obj, str):
            raise HTTPException(status_code=500, detail="Invalid user record")
        username = username_obj

    access_token = create_access_token(
        data={"sub": username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    return RedirectResponse(url=f"{frontend_url}/auth/callback?token={access_token}")


# Temporary endpoint to avoid google rate limits
@router.get("/proxy/profile-image")
async def proxy_profile_image(url: str) -> Response:
    async with httpx.AsyncClient() as client:
        r = await client.get(url)
        return Response(
            content=r.content,
            status_code=r.status_code,
            media_type=r.headers.get("content-type", "image/jpeg"),
        )


# ── Password reset ─────────────────────────────────────────────────


@router.post("/password-reset/request", response_model=PasswordResetResponse)
async def request_password_reset(req: PasswordResetRequest) -> PasswordResetResponse:
    """Request a password reset by providing an email address."""
    try:
        print(f"DEBUG: Password reset request endpoint called for: {req.email}")
        result = await asyncio.wait_for(create_password_reset_link(req.email), timeout=15.0)
        success = result.get("success")
        message = result.get("message")
        if not isinstance(message, str):
            raise HTTPException(status_code=500, detail="Invalid password reset response")

        if not success:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

        return PasswordResetResponse(message=message)
    except asyncio.TimeoutError:
        print("ERROR: Password reset request timed out (SMTP connection issue)")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset request timed out. Email service may be unavailable.",
        )
    except Exception as e:
        print(f"ERROR in password reset endpoint: {type(e).__name__}: {e}")
        import traceback

        traceback.print_exc()
        raise


async def reset_password(req: PasswordReset) -> PasswordResetResponse:
    """Reset password using a valid reset token."""
    result = reset_password_with_token(req.token, req.new_password)

    success = result.get("success")
    message = result.get("message")
    if not isinstance(success, bool) or not isinstance(message, str):
        raise HTTPException(status_code=500, detail="Invalid password reset response")

    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

    return PasswordResetResponse(message=message)
