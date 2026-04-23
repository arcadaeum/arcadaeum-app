from fastapi import APIRouter
from app.database import get_database_connection

router = APIRouter()


@router.get("/games")
def get_games():
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, igdb_id, title, summary, developer, cover_url, platforms, release_date, igdb_rating, created_at
				FROM games
				ORDER BY id DESC
				"""
            )
            rows = cur.fetchall()
            columns = [desc[0] for desc in cur.description]

    return [dict(zip(columns, row)) for row in rows]


@router.get("/games/{game_id}")
def get_game(game_id: int):
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, igdb_id, title, summary, developer, cover_url, platforms, release_date, igdb_rating, created_at
                FROM games
                WHERE id = %s
                """,
                (game_id,),
            )
            row = cur.fetchone()
            if row is None:
                return {"error": "Game not found"}

            columns = [desc[0] for desc in cur.description]
            return dict(zip(columns, row))
