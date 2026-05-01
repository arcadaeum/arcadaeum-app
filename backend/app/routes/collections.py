import psycopg
from fastapi import APIRouter, Depends, HTTPException, status

from app.database.queries.collections import (
    add_game_to_collection,
    create_collection,
    create_default_collections,
    delete_collection,
    get_collection_by_id,
    get_collection_games,
    get_collections,
    remove_game_from_collection,
    rename_collection,
)
from app.models import (
    AddGameToCollectionRequest,
    Collection,
    CollectionGame,
    CreateCollectionRequest,
    RenameCollectionRequest,
    User,
)
from app.services.auth import get_current_user

router = APIRouter(prefix="/users/me/collections", tags=["collections"])


@router.get("", response_model=list[Collection])
def list_collections(
    current_user: User = Depends(get_current_user),
) -> list[Collection]:
    """Get all collections for the current user, including defaults."""
    # Ensure defaults exist (idempotent)
    create_default_collections(current_user.id)
    rows = get_collections(current_user.id)
    return [Collection(**row) for row in rows]


@router.post("", response_model=Collection, status_code=status.HTTP_201_CREATED)
def make_collection(
    request: CreateCollectionRequest, current_user: User = Depends(get_current_user)
) -> Collection:
    """Create a new custom collection."""
    try:
        collection_id = create_collection(current_user.id, request.name)
    except psycopg.errors.UniqueViolation:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A collection with that name already exists.",
        )

    row = get_collection_by_id(current_user.id, collection_id)
    if row is None:
        raise HTTPException(status_code=500, detail="Failed to retrieve new collection")
    return Collection(**row)


@router.patch("/{collection_id}", response_model=Collection)
def rename_custom_collection(
    collection_id: int,
    request: RenameCollectionRequest,
    current_user: User = Depends(get_current_user),
) -> Collection:
    """Rename a custom collection. Default collections cannot be renamed."""
    collection = get_collection_by_id(current_user.id, collection_id)
    if collection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found"
        )

    if collection.get("is_default"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Default collections cannot be renamed.",
        )

    renamed = rename_collection(current_user.id, collection_id, request.name)
    if not renamed:
        raise HTTPException(status_code=500, detail="Failed to rename collection")

    updated = get_collection_by_id(current_user.id, collection_id)
    if updated is None:
        raise HTTPException(
            status_code=500, detail="Failed to retrieve renamed collection"
        )
    return Collection(**updated)


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_custom_collection(
    collection_id: int, current_user: User = Depends(get_current_user)
) -> None:
    """Delete a custom collection. Default collections cannot be deleted."""
    collection = get_collection_by_id(current_user.id, collection_id)
    if collection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found"
        )

    if collection.get("is_default"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Default collections cannot be deleted.",
        )

    deleted = delete_collection(current_user.id, collection_id)
    if not deleted:
        raise HTTPException(status_code=500, detail="Failed to delete collection")


# ── Collection games ──────────────────────────────────────────────────


@router.get("/{collection_id}/games")
def list_collection_games(
    collection_id: int, current_user: User = Depends(get_current_user)
) -> list[dict]:
    """Get all games in a collection."""
    collection = get_collection_by_id(current_user.id, collection_id)
    if collection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found"
        )

    return get_collection_games(collection_id, current_user.id)


@router.post(
    "/{collection_id}/games",
    response_model=CollectionGame,
    status_code=status.HTTP_201_CREATED,
)
def add_game(
    collection_id: int,
    request: AddGameToCollectionRequest,
    current_user: User = Depends(get_current_user),
) -> CollectionGame:
    """Add a game to a collection."""
    collection = get_collection_by_id(current_user.id, collection_id)
    if collection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found"
        )

    try:
        join_id = add_game_to_collection(collection_id, request.game_id)
    except psycopg.errors.UniqueViolation:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Game is already in this collection.",
        )

    return CollectionGame(
        id=join_id, collection_id=collection_id, game_id=request.game_id
    )


@router.delete(
    "/{collection_id}/games/{game_id}", status_code=status.HTTP_204_NO_CONTENT
)
def remove_game(
    collection_id: int,
    game_id: int,
    current_user: User = Depends(get_current_user),
) -> None:
    """Remove a game from a collection."""
    collection = get_collection_by_id(current_user.id, collection_id)
    if collection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found"
        )

    removed = remove_game_from_collection(collection_id, game_id)
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found in this collection.",
        )
