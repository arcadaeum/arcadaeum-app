from typing import Optional

from pydantic import BaseModel


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
