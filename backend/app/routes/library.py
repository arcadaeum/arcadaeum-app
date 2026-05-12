import psycopg
from fastapi import APIRouter, Depends, HTTPException, status

from app.database.queries.library import (
    add_to_library,
    get_library_entry,
    get_user_library,
    remove_from_library,
    update_library_status,
)
from app.database.queries.users import get_user_by_id
from app.models import (
    AddToLibraryRequest,
    LibraryEntry,
    UpdateLibraryStatusRequest,
    User,
)
from app.services.auth import get_current_user

router = APIRouter()


@router.get("/users/me/library", response_model=list[LibraryEntry])
def get_my_library(
    offset: int = 0, limit: int = 5000, current_user: User = Depends(get_current_user)
) -> list[LibraryEntry]:
    """Get current user's library."""
    entries = get_user_library(current_user.id, offset=offset, limit=limit)
    return [LibraryEntry(**entry) for entry in entries]


@router.get("/users/{user_id}/library", response_model=list[LibraryEntry])
def get_public_user_library(user_id: int, offset: int = 0, limit: int = 5000) -> list[LibraryEntry]:
    """Get a user's public library."""
    if get_user_by_id(user_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    entries = get_user_library(user_id, offset=offset, limit=limit)
    return [LibraryEntry(**entry) for entry in entries]


@router.post(
    "/users/me/library",
    response_model=LibraryEntry,
    status_code=status.HTTP_201_CREATED,
)
def add_to_user_library(
    request: AddToLibraryRequest, current_user: User = Depends(get_current_user)
) -> LibraryEntry:
    """Add a game to current user's library."""
    try:
        add_to_library(current_user.id, request.game_id)
    except (psycopg.errors.UniqueViolation, RuntimeError) as e:
        # Game already in library is not an error - just return it
        entry = get_library_entry(current_user.id, request.game_id)
        if entry is not None:
            return LibraryEntry(**entry)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add game to library",
        )

    entry = get_library_entry(current_user.id, request.game_id)
    if entry is None:
        raise HTTPException(status_code=500, detail="Failed to retrieve added entry")
    return LibraryEntry(**entry)


@router.patch("/users/me/library/{game_id}/status", response_model=LibraryEntry)
def update_user_library_status(
    game_id: int,
    request: UpdateLibraryStatusRequest,
    current_user: User = Depends(get_current_user),
) -> LibraryEntry:
    """Update status for a game in current user's library."""
    status_value = request.status
    if status_value not in (None, "currently_playing"):
        raise HTTPException(status_code=400, detail="Invalid status value")

    updated = update_library_status(current_user.id, game_id, status_value)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found in library"
        )

    entry = get_library_entry(current_user.id, game_id)
    if entry is None:
        raise HTTPException(status_code=500, detail="Failed to retrieve updated entry")
    return LibraryEntry(**entry)


@router.delete("/users/me/library/{game_id}")
def remove_from_user_library(game_id: int, current_user: User = Depends(get_current_user)) -> dict:
    """Remove a game from current user's library."""
    removed = remove_from_library(current_user.id, game_id)
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found in library"
        )
    return {"message": "Game removed from library"}
