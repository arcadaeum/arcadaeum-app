from typing import Optional

from app.database.connection import get_database_connection

DEFAULT_COLLECTION_NAMES = ["Favourites", "Want To Play", "Completed"]


def create_default_collections(user_id: int) -> None:
    """Ensure default collections exist for a user."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            for name in DEFAULT_COLLECTION_NAMES:
                cur.execute(
                    """
                    INSERT INTO collections (user_id, name, is_default)
                    VALUES (%s, %s, true)
                    ON CONFLICT (user_id, name) DO NOTHING
                    """,
                    (user_id, name),
                )
            conn.commit()


def get_collections(user_id: int) -> list[dict]:
    """Get all collections for a user."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, user_id, name, is_default, created_at
                FROM collections
                WHERE user_id = %s
                ORDER BY is_default DESC, name ASC
                """,
                (user_id,),
            )
            rows = cur.fetchall()
            if cur.description is None:
                return []
            columns = [desc[0] for desc in cur.description]
            results: list[dict] = []
            for row in rows:
                entry = dict(zip(columns, row))
                created_at = entry.get("created_at")
                if created_at is not None:
                    entry["created_at"] = created_at.isoformat()
                results.append(entry)
            return results


def create_collection(user_id: int, name: str) -> int:
    """Create a custom collection and return its ID."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO collections (user_id, name, is_default)
                VALUES (%s, %s, false)
                RETURNING id
                """,
                (user_id, name),
            )
            row = cur.fetchone()
            conn.commit()
            if row is None:
                raise RuntimeError("Failed to create collection")
            collection_id = row[0]
            if not isinstance(collection_id, int):
                raise RuntimeError("Failed to create collection: invalid id")
            return collection_id


def rename_collection(user_id: int, collection_id: int, name: str) -> bool:
    """Rename a custom collection. Returns True if updated."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE collections
                SET name = %s
                WHERE id = %s AND user_id = %s AND is_default = false
                RETURNING id
                """,
                (name, collection_id, user_id),
            )
            result = cur.fetchone()
            conn.commit()
            return result is not None


def delete_collection(user_id: int, collection_id: int) -> bool:
    """Delete a custom collection. Returns True if deleted."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM collections
                WHERE id = %s AND user_id = %s AND is_default = false
                """,
                (collection_id, user_id),
            )
            conn.commit()
            return cur.rowcount > 0


def add_game_to_collection(collection_id: int, game_id: int) -> int:
    """Add a game to a collection and return the join row ID."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO collection_games (collection_id, game_id)
                VALUES (%s, %s)
                RETURNING id
                """,
                (collection_id, game_id),
            )
            result = cur.fetchone()
            conn.commit()
            if result is None:
                raise RuntimeError("Failed to add game to collection")
            return result[0]


def remove_game_from_collection(collection_id: int, game_id: int) -> bool:
    """Remove a game from a collection. Returns True if removed."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM collection_games
                WHERE collection_id = %s AND game_id = %s
                """,
                (collection_id, game_id),
            )
            conn.commit()
            return cur.rowcount > 0


def get_collection_games(collection_id: int, user_id: int) -> list[dict]:
    """Get games for a collection, ensuring ownership by user."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    cg.id,
                    cg.collection_id,
                    cg.game_id,
                    cg.added_at,
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
                FROM collection_games cg
                JOIN collections c ON c.id = cg.collection_id
                JOIN games g ON g.id = cg.game_id
                WHERE cg.collection_id = %s AND c.user_id = %s
                ORDER BY cg.added_at DESC
                """,
                (collection_id, user_id),
            )
            rows = cur.fetchall()
            if cur.description is None:
                return []
            columns = [desc[0] for desc in cur.description]
            results: list[dict] = []
            for row in rows:
                entry = dict(zip(columns, row))
                added_at = entry.get("added_at")
                if added_at is not None:
                    entry["added_at"] = added_at.isoformat()
                release_date = entry.get("release_date")
                if release_date is not None:
                    entry["release_date"] = release_date.isoformat()
                created_at = entry.get("created_at")
                if created_at is not None:
                    entry["created_at"] = created_at.isoformat()
                results.append(entry)
            return results


def get_collection_by_id(user_id: int, collection_id: int) -> Optional[dict]:
    """Fetch a collection by id for a user."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, user_id, name, is_default, created_at
                FROM collections
                WHERE id = %s AND user_id = %s
                """,
                (collection_id, user_id),
            )
            row = cur.fetchone()
            if row is None or cur.description is None:
                return None
            columns = [desc[0] for desc in cur.description]
            entry = dict(zip(columns, row))
            created_at = entry.get("created_at")
            if created_at is not None:
                entry["created_at"] = created_at.isoformat()
            return entry
