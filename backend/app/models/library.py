from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class LibraryEntry(BaseModel):
    """Represents a game in a user's library, including game details."""

    id: int
    user_id: int
    game_id: int
    added_at: Optional[datetime] = None
    status: Optional[str] = None
    # -----------------------------
    title: str
    igdb_id: int
    summary: Optional[str] = None
    developer: Optional[str] = None
    cover_url: Optional[str] = None
    platforms: Optional[list[str]] = None
    genres: Optional[list[str]] = None
    screenshots: Optional[list[str]] = None
    release_date: Optional[date] = None
    igdb_rating: Optional[float] = None
    created_at: Optional[datetime] = None


class AddToLibraryRequest(BaseModel):
    """Request to add a game to the user's library."""

    game_id: int


class UpdateLibraryStatusRequest(BaseModel):
    """Request to update the status of a game in the library."""

    status: str
