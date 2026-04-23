import os
from datetime import datetime
from typing import Optional
import psycopg


def get_database_url():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL environment variable is not set")
    return database_url


def get_database_connection():
    """Establish a connection to the PostgreSQL database."""
    database_url = get_database_url()
    return psycopg.connect(database_url)


def create_tables():
    """Create the necessary tables in the database if they don't exist."""
    create_users_table()  # Creates the users table if it doesn't exist
    create_games_table()  # Creates the games table if it doesn't exist
    create_user_library_table()  # Creates the user_library table if it doesn't exist
    create_password_reset_table()  # Creates the password reset tokens table if it doesn't exist
    create_user_followers_table()  # Creates the user_followers table if it doesn't exist


def create_users_table():
    """Creates the users table if it doesn't exist"""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id serial PRIMARY KEY,
                    username text UNIQUE NOT NULL,
                    email text UNIQUE NOT NULL,
                    password_hash text,
                    oauth_provider text,
                    oauth_id text,
                    display_name text,
                    profile_picture text)
                """
            )
            conn.commit()


def create_games_table():
    """Creates the games table if it doesn't exists"""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS games (
                    id serial PRIMARY KEY,
                    igdb_id integer UNIQUE NOT NULL,
                    title text NOT NULL,
                    summary text,
                    cover_url text,
                    platforms text[],
                    genres text[],
                    release_date date,
                    igdb_rating real,
                    created_at timestamp DEFAULT CURRENT_TIMESTAMP)
                """
            )
            conn.commit()


def create_user_library_table():
    """Creates the user_library table if it doesn't exist"""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS user_library (
                    id serial PRIMARY KEY,
                    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    game_id integer NOT NULL REFERENCES games(id) ON DELETE CASCADE,
                    added_at timestamp DEFAULT CURRENT_TIMESTAMP,
                    completed_at timestamp,
                    rating real,
                    notes text,
                    UNIQUE(user_id, game_id))
                """
            )
            conn.commit()


def create_user_followers_table():
    """Creates the user_followers table if it doesn't exist"""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS user_followers (
                    id serial PRIMARY KEY,
                    userid integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    follower_user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    UNIQUE(userid, follower_user_id))
                """
            )
            conn.commit()


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
            return cur.fetchone()[0]


def get_user_by_username(username: str):
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


def get_user_by_email(email: str):
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


def update_user_display_name(username: str, display_name: str):
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE users SET display_name = %s WHERE username = %s",
                (display_name, username),
            )
            conn.commit()


def add_game_to_db(
    igdb_id: int,
    title: str,
    summary: Optional[str] = None,
    cover_url: Optional[str] = None,
    platforms: Optional[list[str]] = None,
    genres: Optional[list[str]] = None,
    release_date: Optional[int] = None,
    igdb_rating: Optional[float] = None,
):
    """Add a game to the database and return the game's ID."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            # Convert Unix timestamp to date
            formatted_date = None
            if release_date:
                formatted_date = datetime.fromtimestamp(release_date).date()

            cur.execute(
                """
                INSERT INTO games (igdb_id, title, summary, cover_url, platforms, genres, release_date, igdb_rating)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (igdb_id) DO UPDATE SET
                    title = EXCLUDED.title,
                    summary = EXCLUDED.summary,
                    cover_url = EXCLUDED.cover_url,
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
                    cover_url,
                    platforms,
                    genres,
                    formatted_date,
                    igdb_rating,
                ),
            )
            result = cur.fetchone()
            conn.commit()
            return result[0] if result else None


def create_password_reset_table():
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
    """Store a password reset tokn in the database."""
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


def get_password_reset_token(token: str):
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


def mark_reset_token_as_used(token_id: int):
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
