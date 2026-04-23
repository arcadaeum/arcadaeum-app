# Models are custom data structues we use
# in our API for quereies and reponses.
from typing import Optional
from pydantic import BaseModel


# Pydantic models used in responses / type hints
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class User(BaseModel):
    id: int
    username: str
    email: str
    display_name: Optional[str] = None
    profile_picture: Optional[str] = None


class Game(BaseModel):
    id: int
    igdb_id: int
    title: str
    summary: Optional[str] = None
    cover_url: Optional[str] = None
    platforms: Optional[list[str]] = None
    release_date: Optional[str] = None
    igdb_rating: Optional[float] = None


class GameSearchResult(BaseModel):
    igdb_id: int
    title: str
    cover_url: Optional[str] = None
    release_date: Optional[str] = None


class UserFollowers(BaseModel):
    userid: int
    follower_user_id: int


class UserLibraryEntry(BaseModel):
    id: int
    user_id: int
    game_id: int
    status: Optional[str] = None
    added_at: Optional[str] = None
    completed_at: Optional[str] = None
    rating: Optional[int] = None
    notes: Optional[str] = None


class UserInDB(User):
    password_hash: str


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class PasswordResetRequest(BaseModel):
    email: str


class PasswordReset(BaseModel):
    token: str
    new_password: str


class PasswordResetResponse(BaseModel):
    message: str
