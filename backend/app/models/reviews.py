from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Review(BaseModel):
    id: int
    user_id: int
    game_id: int
    rating: int
    review_text: Optional[str] = None
    created_at: Optional[datetime] = None


class ReviewWithUser(Review):
    username: str
    display_name: Optional[str] = None


class ReviewWithGame(Review):
    game_title: str
    game_cover_url: Optional[str] = None


class ReviewCreateRequest(BaseModel):
    rating: int = Field(ge=1, le=10)
    review_text: Optional[str] = None


class ReviewUpdateRequest(BaseModel):
    rating: int = Field(ge=1, le=10)
    review_text: Optional[str] = None


class ArcadaeumReview(BaseModel):
    game_id: int
    average_rating: float
    total_reviews: int
