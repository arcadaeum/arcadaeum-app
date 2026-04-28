from pydantic import BaseModel


class UserFollowers(BaseModel):
    userid: int
    follower_user_id: int


class UserFollowing(BaseModel):
    userid: int
    following_user_id: int
