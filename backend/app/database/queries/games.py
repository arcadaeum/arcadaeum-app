from datetime import datetime
from typing import Optional

from app.database import get_database_connection


def add_game_to_db(
    igdb_id: int,
    title: str,
    summary: Optional[str] = None,
    developer: Optional[str] = None,
    cover_url: Optional[str] = None,
    platforms: Optional[list[str]] = None,
    genres: Optional[list[str]] = None,
    screenshots: Optional[list[str]] = None,
    release_date: Optional[int] = None,
    igdb_rating: Optional[float] = None,
) -> Optional[int]:
    """Add a game to the database and return the game's ID."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            # Convert Unix timestamp to date
            formatted_date = None
            if release_date:
                formatted_date = datetime.fromtimestamp(release_date).date()

            cur.execute(
                """
                INSERT INTO games (
                    igdb_id,
                    title,
                    summary,
                    developer,
                    cover_url,
                    screenshots,
                    platforms,
                    genres,
                    release_date,
                    igdb_rating
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (igdb_id) DO UPDATE SET
                    title = EXCLUDED.title,
                    summary = EXCLUDED.summary,
                    developer = EXCLUDED.developer,
                    cover_url = EXCLUDED.cover_url,
                    screenshots = EXCLUDED.screenshots,
                    platforms = EXCLUDED.platforms,
                    genres = EXCLUDED.genres,
                    release_date = EXCLUDED.release_date,
                    igdb_rating = EXCLUDED.igdb_rating
                RETURNING id
                """,
                (
                    igdb_id,
                    title,
                    summary,
                    developer,
                    cover_url,
                    screenshots,
                    platforms,
                    genres,
                    formatted_date,
                    igdb_rating,
                ),
            )

            result = cur.fetchone()
            conn.commit()
            return result[0] if result else None
