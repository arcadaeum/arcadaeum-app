from typing import Optional

from app.database import get_database_connection


def add_review(user_id: int, game_id: int, rating: int, review_text: Optional[str]) -> int:
    """Add a review for a game by a user. Returns the review ID."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
				INSERT INTO reviews (user_id, game_id, rating, review_text)
				VALUES (%s, %s, %s, %s)
				RETURNING id
				""",
                (user_id, game_id, rating, review_text),
            )
            result = cur.fetchone()
            conn.commit()
            if result is None:
                raise RuntimeError("Failed to add review")
            return result[0]


def get_review_by_id(review_id: int) -> Optional[dict]:
    """Get a single review by ID."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
				SELECT id, user_id, game_id, rating, review_text, created_at
				FROM reviews
				WHERE id = %s
				""",
                (review_id,),
            )
            row = cur.fetchone()
            if row is None:
                return None
            return {
                "id": row[0],
                "user_id": row[1],
                "game_id": row[2],
                "rating": row[3],
                "review_text": row[4],
                "created_at": row[5],
            }


def get_review_with_user(review_id: int) -> Optional[dict]:
    """Get a single review with user info by ID."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT r.id, r.user_id, r.game_id, r.rating, r.review_text, r.created_at,
                       u.username, u.display_name
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                WHERE r.id = %s
                """,
                (review_id,),
            )
            row = cur.fetchone()
            if row is None:
                return None
            return {
                "id": row[0],
                "user_id": row[1],
                "game_id": row[2],
                "rating": row[3],
                "review_text": row[4],
                "created_at": row[5],
                "username": row[6],
                "display_name": row[7],
            }


def delete_review(user_id: int, game_id: int) -> bool:
    """Delete a review for a game by a user."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM reviews
                WHERE user_id = %s AND game_id = %s
                RETURNING id
                """,
                (user_id, game_id),
            )
            result = cur.fetchone()
            conn.commit()
            return result is not None


def delete_review_by_id(user_id: int, review_id: int) -> bool:
    """Delete a review by ID for a user."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM reviews
                WHERE user_id = %s AND id = %s
                RETURNING id
                """,
                (user_id, review_id),
            )
            result = cur.fetchone()
            conn.commit()
            return result is not None


def delete_any_review_by_id(review_id: int) -> bool:
    """Delete any review by ID."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM reviews
                WHERE id = %s
                RETURNING id
                """,
                (review_id,),
            )
            result = cur.fetchone()
            conn.commit()
            return result is not None


def update_review(user_id: int, review_id: int, rating: int, review_text: Optional[str]) -> bool:
    """Update a review by ID for a user."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE reviews
                SET rating = %s, review_text = %s
                WHERE user_id = %s AND id = %s
                RETURNING id
                """,
                (rating, review_text, user_id, review_id),
            )
            result = cur.fetchone()
            conn.commit()
            return result is not None


def get_reviews_for_user(user_id: int) -> list[dict]:
    """Get all reviews by a user, joining game details for display."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT r.id, r.user_id, r.game_id, r.rating, r.review_text, r.created_at,
                       g.title AS game_title, g.cover_url AS game_cover_url
                FROM reviews r
                JOIN games g ON g.id = r.game_id
                WHERE r.user_id = %s
                ORDER BY r.created_at DESC
                """,
                (user_id,),
            )
            rows = cur.fetchall()
            return [
                {
                    "id": row[0],
                    "user_id": row[1],
                    "game_id": row[2],
                    "rating": row[3],
                    "review_text": row[4],
                    "created_at": row[5],
                    "game_title": row[6],
                    "game_cover_url": row[7],
                }
                for row in rows
            ]


def get_user_review_by_id(user_id: int, review_id: int) -> Optional[dict]:
    """Get a user's review by ID with game details."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT r.id, r.user_id, r.game_id, r.rating, r.review_text, r.created_at,
                       g.title AS game_title, g.cover_url AS game_cover_url
                FROM reviews r
                JOIN games g ON g.id = r.game_id
                WHERE r.user_id = %s AND r.id = %s
                """,
                (user_id, review_id),
            )
            row = cur.fetchone()
            if row is None:
                return None
            return {
                "id": row[0],
                "user_id": row[1],
                "game_id": row[2],
                "rating": row[3],
                "review_text": row[4],
                "created_at": row[5],
                "game_title": row[6],
                "game_cover_url": row[7],
            }


def get_reviews_for_game(game_id: int) -> list[dict]:
    """Get all reviews for a game, joining with users table to get username."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
				SELECT r.id, r.user_id, r.game_id, r.rating, r.review_text, r.created_at,
				       u.username, u.display_name
				FROM reviews r
				JOIN users u ON r.user_id = u.id
				WHERE r.game_id = %s
				ORDER BY r.created_at DESC
				""",
                (game_id,),
            )
            rows = cur.fetchall()
            return [
                {
                    "id": row[0],
                    "user_id": row[1],
                    "game_id": row[2],
                    "rating": row[3],
                    "review_text": row[4],
                    "created_at": row[5],
                    "username": row[6],
                    "display_name": row[7],
                }
                for row in rows
            ]


def get_arcadaeum_review(game_id: int) -> Optional[dict]:
    """Get the aggregated Arcadaeum review for a game (average rating and count)."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT game_id, AVG(rating) as average_rating, COUNT(*) as total_reviews
                FROM reviews
                WHERE game_id = %s
                GROUP BY game_id
                """,
                (game_id,),
            )
            row = cur.fetchone()
            if row is None:
                return None
            return {
                "game_id": row[0],
                "average_rating": float(row[1]),
                "total_reviews": row[2],
            }
