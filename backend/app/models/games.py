from typing import Optional

from pydantic import BaseModel


class Game(BaseModel):
    id: int
    igdb_id: int
    title: str
    summary: Optional[str] = None
    developer: Optional[str] = None
    cover_url: Optional[str] = None
    platforms: Optional[list[str]] = None
    genres: Optional[list[str]] = None
    screenshots: Optional[list[str]] = None
    release_date: Optional[str] = None
    igdb_rating: Optional[float] = None


class GameSearchResult(BaseModel):
    igdb_id: int
    title: str
    cover_url: Optional[str] = None
    release_date: Optional[str] = None


class AddGameFromIGDBRequest(BaseModel):
    igdb_id: int


class CacheQueryParams(BaseModel):
    limit: int = 500
