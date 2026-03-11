from fastapi import APIRouter
from app.database import get_database_connection

router = APIRouter()


@router.get("/games")
def get_games():
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
				SELECT id, igdb_id, title, summary, cover_url, platforms, release_date, igdb_rating, created_at
				FROM games
				ORDER BY id DESC
				"""
            )
            rows = cur.fetchall()
            columns = [desc[0] for desc in cur.description]

    return [dict(zip(columns, row)) for row in rows]
