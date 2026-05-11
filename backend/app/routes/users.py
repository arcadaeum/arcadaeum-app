from fastapi import APIRouter, HTTPException

from app.database.connection import get_database_connection
from app.database.queries.collections import (
    create_default_collections,
    get_collection_by_id,
    get_collection_games,
    get_collections,
)
from app.models import Collection

router = APIRouter(prefix="/users", tags=["users"])


def user_exists(user_id: int) -> bool:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            return cur.fetchone() is not None


@router.get("/search")
def search_users(q: str) -> list[dict[str, object]]:
    """Search users by display name."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, username, display_name, profile_picture
                FROM users
                WHERE COALESCE(display_name, username) ILIKE %s
                ORDER BY COALESCE(display_name, username), username
                LIMIT 10
                """,
                (f"%{q}%",),
            )
            rows = cur.fetchall()
            if cur.description is None:
                return []
            columns = [desc[0] for desc in cur.description]

    return [dict(zip(columns, row)) for row in rows]


@router.get("/{user_id}")
def get_user(user_id: int) -> dict[str, object]:
    """Get user profile by ID."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, username, email, display_name, profile_picture
                FROM users
                WHERE id = %s
                """,
                (user_id,),
            )
            row = cur.fetchone()
            if row is not None:
                if cur.description is None:
                    raise HTTPException(status_code=500, detail="Invalid database cursor state")
                columns = [desc[0] for desc in cur.description]
                return dict(zip(columns, row))

    raise HTTPException(status_code=404, detail="User not found")


@router.get("/{user_id}/favorites")
def get_user_favorites(user_id: int) -> list[dict[str, object]]:
    """Get user's favorite games."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT g.id, g.title, g.cover_url
                FROM games g
                JOIN user_favorites uf ON g.id = uf.game_id
                WHERE uf.user_id = %s
                ORDER BY uf.created_at DESC
                """,
                (user_id,),
            )
            rows = cur.fetchall()
            if cur.description is None:
                return []
            columns = [desc[0] for desc in cur.description]

    return [dict(zip(columns, row)) for row in rows]


@router.get("/{user_id}/collections", response_model=list[Collection])
def get_user_collections(user_id: int) -> list[Collection]:
    """Get public collections for a user."""
    if not user_exists(user_id):
        raise HTTPException(status_code=404, detail="User not found")

    create_default_collections(user_id)
    rows = get_collections(user_id)
    return [Collection(**row) for row in rows]


@router.get("/{user_id}/collections/{collection_id}/games")
def get_user_collection_games(user_id: int, collection_id: int) -> list[dict]:
    """Get games in a user's collection."""
    collection = get_collection_by_id(user_id, collection_id)
    if collection is None:
        raise HTTPException(status_code=404, detail="Collection not found")

    return get_collection_games(collection_id, user_id)
