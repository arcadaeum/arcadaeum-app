# Re-export all models for backward compatibility
from app.models.auth import (
    PasswordReset,
    PasswordResetRequest,
    PasswordResetResponse,
    RegisterRequest,
    Token,
    TokenData,
    User,
    UserInDB,
)
from app.models.games import (
    AddGameFromIGDBRequest,
    CacheQueryParams,
    Game,
    GameSearchResult,
)
from app.models.users import UserFollowers, UserFollowing

__all__ = [
    # Auth
    "Token",
    "TokenData",
    "User",
    "UserInDB",
    "RegisterRequest",
    "PasswordResetRequest",
    "PasswordReset",
    "PasswordResetResponse",
    # Games
    "Game",
    "GameSearchResult",
    "AddGameFromIGDBRequest",
    "CacheQueryParams",
    # Users
    "UserFollowers",
    "UserFollowing",
]
