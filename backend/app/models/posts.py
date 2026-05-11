from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Post(BaseModel):
    id: int
    user_id: int
    content: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PostWithUser(Post):
    username: str
    display_name: Optional[str] = None
    profile_picture: Optional[str] = None


class CreatePostRequest(BaseModel):
    content: str = Field(min_length=1, max_length=1000)


class UpdatePostRequest(BaseModel):
    content: str = Field(min_length=1, max_length=1000)
