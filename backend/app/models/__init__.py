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
from app.models.collections import (
    AddGameToCollectionRequest,
    Collection,
    CollectionGame,
    CreateCollectionRequest,
    RenameCollectionRequest,
)
from app.models.followers import (
    FollowResponse,
    UserFollowers,
    UserFollowing,
    UserSummary,
)
from app.models.games import (
    AddGameFromIGDBRequest,
    CacheQueryParams,
    Game,
    GameSearchResult,
)
from app.models.library import (
    AddToLibraryRequest,
    LibraryEntry,
    UpdateLibraryStatusRequest,
)

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
    # Followers
    "UserSummary",
    "FollowResponse",
    "UserFollowers",
    "UserFollowing",
    # Library
    "LibraryEntry",
    "AddToLibraryRequest",
    "UpdateLibraryStatusRequest",
    # Collections
    "Collection",
    "CollectionGame",
    "CreateCollectionRequest",
    "RenameCollectionRequest",
    "AddGameToCollectionRequest",
]
