from typing import Optional

from app.database.connection import get_database_connection


def create_post(user_id: int, content: str) -> int:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO posts (user_id, content)
                VALUES (%s, %s)
                RETURNING id
                """,
                (user_id, content),
            )
            row = cur.fetchone()
            conn.commit()
            if row is None:
                raise RuntimeError("Failed to create post")
            post_id = row[0]
            if not isinstance(post_id, int):
                raise RuntimeError("Failed to create post: returned id is not an int")
            return post_id


def get_post_with_user(post_id: int) -> Optional[dict]:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    p.id,
                    p.user_id,
                    p.content,
                    p.created_at,
                    p.updated_at,
                    u.username,
                    u.display_name,
                    u.profile_picture
                FROM posts p
                JOIN users u ON u.id = p.user_id
                WHERE p.id = %s
                """,
                (post_id,),
            )
            row = cur.fetchone()
            if row is None:
                return None
            if cur.description is None:
                raise RuntimeError("Invalid database cursor state")
            columns = [desc[0] for desc in cur.description]
            return dict(zip(columns, row))


def update_post(user_id: int, post_id: int, content: str) -> bool:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE posts
                SET content = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s AND user_id = %s
                """,
                (content, post_id, user_id),
            )
            conn.commit()
            return cur.rowcount > 0


def delete_post(user_id: int, post_id: int) -> bool:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM posts
                WHERE id = %s AND user_id = %s
                """,
                (post_id, user_id),
            )
            conn.commit()
            return cur.rowcount > 0


def delete_post_by_id(post_id: int) -> bool:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM posts
                WHERE id = %s
                """,
                (post_id,),
            )
            conn.commit()
            return cur.rowcount > 0


def get_user_posts(user_id: int, offset: int = 0, limit: int = 50) -> list[dict]:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    p.id,
                    p.user_id,
                    p.content,
                    p.created_at,
                    p.updated_at,
                    u.username,
                    u.display_name,
                    u.profile_picture
                FROM posts p
                JOIN users u ON u.id = p.user_id
                WHERE p.user_id = %s
                ORDER BY p.created_at DESC, p.id DESC
                OFFSET %s
                LIMIT %s
                """,
                (user_id, offset, limit),
            )
            rows = cur.fetchall()
            if cur.description is None:
                return []
            columns = [desc[0] for desc in cur.description]
            return [dict(zip(columns, row)) for row in rows]


def get_following_posts(user_id: int, offset: int = 0, limit: int = 50) -> list[dict]:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    p.id,
                    p.user_id,
                    p.content,
                    p.created_at,
                    p.updated_at,
                    u.username,
                    u.display_name,
                    u.profile_picture
                FROM posts p
                JOIN user_followers uf ON uf.userid = p.user_id
                JOIN users u ON u.id = p.user_id
                WHERE uf.follower_user_id = %s
                ORDER BY p.created_at DESC, p.id DESC
                OFFSET %s
                LIMIT %s
                """,
                (user_id, offset, limit),
            )
            rows = cur.fetchall()
            if cur.description is None:
                return []
            columns = [desc[0] for desc in cur.description]
            return [dict(zip(columns, row)) for row in rows]
