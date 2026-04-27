from typing import Optional

from app.database import get_database_connection


def create_user(
    username: str,
    email: str,
    password_hash: str | None,
    oauth_provider: str | None = None,
    oauth_id: str | None = None,
    display_name: str | None = None,
    profile_picture: str | None = None,
) -> int:
    """Create a new user in the database and return the user's ID."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO users (username, email, password_hash, oauth_provider, oauth_id, display_name, profile_picture)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    username,
                    email,
                    password_hash,
                    oauth_provider,
                    oauth_id,
                    display_name,
                    profile_picture,
                ),
            )
            row = cur.fetchone()
            if row is None:
                raise RuntimeError("Failed to create user: no id returned")

            user_id = row[0]
            if not isinstance(user_id, int):
                raise RuntimeError("Failed to create user: returned id is not an int")
            return user_id


def get_user_by_username(username: str) -> Optional[dict]:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, username, email, password_hash, display_name, profile_picture FROM users WHERE username = %s",
                (username,),
            )
            row = cur.fetchone()
            if row:
                return dict(
                    id=row[0],
                    username=row[1],
                    email=row[2],
                    password_hash=row[3],
                    display_name=row[4],
                    profile_picture=row[5],
                )
    return None


def get_user_by_email(email: str) -> Optional[dict]:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, username, email, password_hash, display_name, profile_picture FROM users WHERE email = %s",
                (email,),
            )
            row = cur.fetchone()
            if row:
                return dict(
                    id=row[0],
                    username=row[1],
                    email=row[2],
                    password_hash=row[3],
                    display_name=row[4],
                    profile_picture=row[5],
                )
    return None


def update_user_display_name(username: str, display_name: str) -> None:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE users SET display_name = %s WHERE username = %s",
                (display_name, username),
            )
            conn.commit()
