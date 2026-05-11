# Re-export all models for backward compatibility
from app.models.auth import (
    ChangeUsernameRequest,
    DeleteAccountRequest,
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
from app.models.posts import CreatePostRequest, Post, PostWithUser, UpdatePostRequest
from app.models.reviews import Review, ReviewCreateRequest, ReviewWithUser
from app.models.steam import (
    SteamGameData,
    SteamGameMatch,
    SteamGameUnmatched,
    SteamLinkRequest,
    SteamSyncResult,
    SteamSyncStatus,
    SteamVerificationResponse,
)

__all__ = [
    # Auth
    "Token",
    "TokenData",
    "User",
    "UserInDB",
    "RegisterRequest",
    "ChangeUsernameRequest",
    "DeleteAccountRequest",
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
    # Posts
    "Post",
    "PostWithUser",
    "CreatePostRequest",
    "UpdatePostRequest",
    # Steam
    "SteamLinkRequest",
    "SteamGameData",
    "SteamSyncStatus",
    "SteamSyncResult",
    "SteamGameMatch",
    "SteamGameUnmatched",
    "SteamVerificationResponse",
    # Reviews
    "Review",
    "ReviewWithUser",
    "ReviewCreateRequest",
    # Collections
    "Collection",
    "CollectionGame",
    "CreateCollectionRequest",
    "RenameCollectionRequest",
    "AddGameToCollectionRequest",
]
