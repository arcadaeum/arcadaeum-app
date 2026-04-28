from .connection import get_database_connection


def create_tables() -> None:
    """Create the necessary tables in the database if they don't exist."""
    create_users_table()  # Creates the users table if it doesn't exist
    create_games_table()  # Creates the games table if it doesn't exist
    create_user_library_table()  # Creates the user_library table if it doesn't exist
    create_password_reset_table()  # Creates the password reset tokens table if it doesn't exist
    create_user_followers_table()  # Creates the user followers table if it doesn't exist


def create_users_table() -> None:
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


def create_games_table() -> None:
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
                    developer text,
                    cover_url text,
                    screenshots text[],
                    platforms text[],
                    genres text[],
                    release_date date,
                    igdb_rating real,
                    created_at timestamp DEFAULT CURRENT_TIMESTAMP)
                """
            )
            conn.commit()


def create_user_library_table() -> None:
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
                    status text,
                    UNIQUE(user_id, game_id))
                """
            )
            conn.commit()


def create_user_followers_table() -> None:
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
