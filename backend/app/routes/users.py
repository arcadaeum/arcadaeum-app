from fastapi import APIRouter, HTTPException
from app.database import get_database_connection

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/search")
def search_users(q: str):
    """Search users by display name"""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, username, email, display_name, profile_picture
                FROM users
                WHERE display_name ILIKE %s
                ORDER BY display_name, username
                LIMIT 10
                """,
                (f"%{q}%",),
            )
            rows = cur.fetchall()
            columns = [desc[0] for desc in cur.description]

    return [dict(zip(columns, row)) for row in rows]


@router.get("/{user_id}")
def get_user(user_id: int):
    """Get user profile by ID"""
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
            if row:
                columns = [desc[0] for desc in cur.description]
                return dict(zip(columns, row))

    raise HTTPException(status_code=404, detail="User not found")


@router.get("/{user_id}/favorites")
def get_user_favorites(user_id: int):
    """Get user's favorite games"""
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
            columns = [desc[0] for desc in cur.description]

    return [dict(zip(columns, row)) for row in rows]
