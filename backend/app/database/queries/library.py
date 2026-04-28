from typing import Optional

from app.database.connection import get_database_connection


def add_to_library(user_id: int, game_id: int, status: str = "active") -> int:
    """Add a game to user's library. Returns library entry ID."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO user_library (user_id, game_id, status)
                VALUES (%s, %s, %s)
                RETURNING id
                """,
                (user_id, game_id, status),
            )
            result = cur.fetchone()
            conn.commit()
            if result is None:
                raise RuntimeError("Failed to add game to library")
            return result[0]


def remove_from_library(user_id: int, game_id: int) -> bool:
    """Remove a game from user's library. Returns True if removed, False if not found."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM user_library
                WHERE user_id = %s AND game_id = %s
                """,
                (user_id, game_id),
            )
            conn.commit()
            return cur.rowcount > 0


def get_user_library(user_id: int, offset: int = 0, limit: int = 50) -> list[dict]:
    """Get user's library with pagination, joining with games table."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    ul.id,
                    ul.user_id,
                    ul.game_id,
                    ul.added_at,
                    ul.status,
                    g.igdb_id,
                    g.title,
                    g.summary,
                    g.developer,
                    g.cover_url,
                    g.screenshots,
                    g.platforms,
                    g.genres,
                    g.release_date,
                    g.igdb_rating,
                    g.created_at
                FROM user_library ul
                JOIN games g ON ul.game_id = g.id
                WHERE ul.user_id = %s
                ORDER BY ul.added_at DESC
                LIMIT %s OFFSET %s
                """,
                (user_id, limit, offset),
            )
            rows = cur.fetchall()
            if cur.description is None:
                return []
            columns = [desc[0] for desc in cur.description]
            results = []
            for row in rows:
                entry = dict(zip(columns, row))
                # Convert datetime/date fields to ISO strings for JSON serialization
                if entry.get("added_at") is not None:
                    entry["added_at"] = entry["added_at"].isoformat()
                if entry.get("release_date") is not None:
                    entry["release_date"] = entry["release_date"].isoformat()
                if entry.get("created_at") is not None:
                    entry["created_at"] = entry["created_at"].isoformat()
                results.append(entry)
            return results


def get_library_entry(user_id: int, game_id: int) -> Optional[dict]:
    """Get specific library entry with game details. Returns None if not in library."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    ul.id,
                    ul.user_id,
                    ul.game_id,
                    ul.added_at,
                    ul.status,
                    g.igdb_id,
                    g.title,
                    g.summary,
                    g.developer,
                    g.cover_url,
                    g.screenshots,
                    g.platforms,
                    g.genres,
                    g.release_date,
                    g.igdb_rating,
                    g.created_at
                FROM user_library ul
                JOIN games g ON ul.game_id = g.id
                WHERE ul.user_id = %s AND ul.game_id = %s
                """,
                (user_id, game_id),
            )
            row = cur.fetchone()
            if row is None:
                return None
            if cur.description is None:
                return None
            columns = [desc[0] for desc in cur.description]
            entry = dict(zip(columns, row))
            # Convert datetime/date fields to ISO strings for JSON serialization
            if entry.get("added_at") is not None:
                entry["added_at"] = entry["added_at"].isoformat()
            if entry.get("release_date") is not None:
                entry["release_date"] = entry["release_date"].isoformat()
            if entry.get("created_at") is not None:
                entry["created_at"] = entry["created_at"].isoformat()
            return entry


def update_library_status(user_id: int, game_id: int, status: str) -> bool:
    """Update the status of a library entry. Returns True if updated."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE user_library
                SET status = %s
                WHERE user_id = %s AND game_id = %s
                RETURNING id
                """,
                (status, user_id, game_id),
            )
            result = cur.fetchone()
            conn.commit()
            return result is not None
