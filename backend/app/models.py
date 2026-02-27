# Models are custom data structues we use
# in our API for quereies and reponses.
from typing import Optional
from pydantic import BaseModel


# Landing Page Submission
class Submission(BaseModel):
    title: str


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


class UserInDB(User):
    password_hash: str
