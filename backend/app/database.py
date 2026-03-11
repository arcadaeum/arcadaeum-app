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
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(  # Creates the favourite_submissions table if it doesn't exist
                """
                CREATE TABLE IF NOT EXISTS favourite_submissions (
                    id serial PRIMARY KEY,
                    title text,
                    timestamp timestamp)
                """
            )
            cur.execute(  # Creates the users table if it doesn't exist
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

            cur.execute(  # Creates the games table if it doesn't exists
                """
                CREATE TABLE IF NOT EXISTS games (
                    id serial PRIMARY KEY,
                    igdb_id integer UNIQUE NOT NULL,
                    title text NOT NULL,
                    summary text,
                    cover_url text,
                    platforms text[],
                    release_date date,
                    igdb_rating real,
                    created_at timestamp DEFAULT CURRENT_TIMESTAMP)
                """
            )

            cur.execute(  # Creates the user_library table if it doesn't exist
                """
                CREATE TABLE IF NOT EXISTS user_library (
                    id serial PRIMARY KEY,
                    user_id integer REFERENCES users(id) ON DELETE CASCADE,
                    game_id integer REFERENCES games(id) ON DELETE CASCADE,
                    status text,
                    added_at timestamp DEFAULT CURRENT_TIMESTAMP,
                    completed_at timestamp,
                    rating integer,
                    notes text,
                    UNIQUE(user_id, game_id))
                """
            )

            conn.commit()  # Makes permanent changes to the database


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
                INSERT INTO games (igdb_id, title, summary, cover_url, platforms, release_date, igdb_rating)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (igdb_id) DO NOTHING
                RETURNING id
                """,
                (
                    igdb_id,
                    title,
                    summary,
                    cover_url,
                    platforms,
                    formatted_date,
                    igdb_rating,
                ),
            )
            result = cur.fetchone()
            conn.commit()
            return result[0] if result else None
