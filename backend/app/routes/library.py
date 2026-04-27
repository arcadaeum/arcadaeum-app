from fastapi import APIRouter, Depends, HTTPException, status

from app.database.queries.library import (
    add_to_library,
    get_library_entry,
    get_user_library,
    remove_from_library,
    update_library_status,
)
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
    offset: int = 0, limit: int = 50, current_user: User = Depends(get_current_user)
) -> list[LibraryEntry]:
    """Get current user's library."""
    entries = get_user_library(current_user.id, offset=offset, limit=limit)
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
    except Exception:
        # Could be IntegrityError for duplicate
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Game already in library"
        )
    entry = get_library_entry(current_user.id, request.game_id)
    if entry is None:
        raise HTTPException(status_code=500, detail="Failed to retrieve added entry")
    return LibraryEntry(**entry)


@router.delete("/users/me/library/{game_id}")
def remove_from_user_library(
    game_id: int, current_user: User = Depends(get_current_user)
) -> dict:
    """Remove a game from current user's library."""
    removed = remove_from_library(current_user.id, game_id)
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found in library"
        )
    return {"message": "Game removed from library"}


@router.patch("/users/me/library/{game_id}/status", response_model=LibraryEntry)
def update_status(
    game_id: int,
    request: UpdateLibraryStatusRequest,
    current_user: User = Depends(get_current_user),
) -> LibraryEntry:
    """Update the status of a game in the library."""
    entry = get_library_entry(current_user.id, game_id)
    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found in library"
        )
    updated = update_library_status(current_user.id, game_id, request.status)
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update status")
    entry = get_library_entry(current_user.id, game_id)
    return LibraryEntry.model_validate(entry)
