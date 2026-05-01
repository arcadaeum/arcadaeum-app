from typing import Optional

from pydantic import BaseModel


class UserSummary(BaseModel):
    id: int
    username: str
    display_name: Optional[str] = None
    profile_picture: Optional[str] = None


class FollowResponse(BaseModel):
    user_id: int
    follower_user_id: int
    is_following: bool


class UserFollowers(BaseModel):
    userid: int
    follower_user_id: int


class UserFollowing(BaseModel):
    userid: int
    following_user_id: int
