from datetime import datetime
from typing import Optional

from app.database import get_database_connection


def create_password_reset_table() -> None:
    """Create the password reset tokens table if it doesn't exist."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS password_reset_tokens (
                    id serial PRIMARY KEY,
                    user_id integer REFERENCES users(id) ON DELETE CASCADE,
                    token text UNIQUE NOT NULL,
                    expires_at timestamp NOT NULL,
                    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
                    used boolean DEFAULT false
                )
                """
            )
            conn.commit()


def create_password_reset_token(user_id: int, token: str, expires_at: datetime) -> bool:
    """Store a password reset token in the database."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            try:
                cur.execute(
                    """
                    INSERT INTO password_reset_tokens (user_id, token, expires_at)
                    VALUES (%s, %s, %s)
                    """,
                    (user_id, token, expires_at),
                )
                conn.commit()
                return True
            except Exception as e:
                print(f"Error creating reset token: {e}")
                return False


def get_password_reset_token(token: str) -> Optional[dict]:
    """Retrieve a valid and unused password reset token."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, user_id, expires_at, used FROM password_reset_tokens
                WHERE token = %s AND expires_at > CURRENT_TIMESTAMP AND used = false
                """,
                (token,),
            )
            row = cur.fetchone()
            if row:
                return {
                    "id": row[0],
                    "user_id": row[1],
                    "expires_at": row[2],
                    "used": row[3],
                }
    return None


def mark_reset_token_as_used(token_id: int) -> None:
    """Mark a reset token as used after successful password reset."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE password_reset_tokens SET used = true WHERE id = %s",
                (token_id,),
            )
            conn.commit()


def update_user_password(user_id: int, password_hash: str) -> bool:
    """Update a user's password hash."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            try:
                cur.execute(
                    "UPDATE users SET password_hash = %s WHERE id = %s",
                    (password_hash, user_id),
                )
                conn.commit()
                return True
            except Exception as e:
                print(f"Error updating password: {e}")
                return False
