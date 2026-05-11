from .connection import get_database_connection


def create_tables() -> None:
    """Create the necessary tables in the database if they don't exist."""
    create_users_table()  # Creates the users table if it doesn't exist
    create_games_table()  # Creates the games table if it doesn't exist
    create_reviews_table()  # Creates the reviews table if it doesn't exist
    create_posts_table()  # Creates the posts table if it doesn't exist
    create_user_library_table()  # Creates the user_library table if it doesn't exist
    create_password_reset_table()  # Creates the password reset tokens table if it doesn't exist
    create_user_followers_table()  # Creates the user followers table if it doesn't exist
    create_user_steam_accounts_table()  # Creates the user_steam_accounts table
    create_user_steam_games_table()  # Creates the user_steam_games table
    create_steam_verification_tokens_table()  # Creates the steam_verification_tokens table
    create_collections_table()  # Creates the collections table if it doesn't exist
    create_collection_games_table()  # Creates the collection_games table if it doesn't exist


def create_users_table() -> None:
    """Creates the users table if it doesn't exist"""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id serial PRIMARY KEY,
                    username text UNIQUE NOT NULL,
                    email text UNIQUE NOT NULL,
                    password_hash text,
                    oauth_provider text,
                    oauth_id text,
                    display_name text,
                    profile_picture text)
                """)
            conn.commit()


def create_games_table() -> None:
    """Creates the games table if it doesn't exists"""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS games (
                    id serial PRIMARY KEY,
                    igdb_id integer UNIQUE NOT NULL,
                    title text NOT NULL,
                    summary text,
                    developer text,
                    cover_url text,
                    artworks text[],
                    screenshots text[],
                    platforms text[],
                    genres text[],
                    release_date date,
                    igdb_rating real,
                    created_at timestamp DEFAULT CURRENT_TIMESTAMP)
                """)
            conn.commit()


def create_reviews_table() -> None:
    """Creates the reviews table if it doesn't exist"""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS reviews (
                    id serial PRIMARY KEY,
                    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    game_id integer NOT NULL REFERENCES games(id) ON DELETE CASCADE,
                    rating integer CHECK (rating >= 1 AND rating <= 10) NOT NULL,
                    review_text text,
                    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, game_id))
                """)
            conn.commit()


def create_posts_table() -> None:
    """Creates the posts table if it doesn't exist"""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS posts (
                    id serial PRIMARY KEY,
                    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    content text NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 1000),
                    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
                    updated_at timestamp DEFAULT CURRENT_TIMESTAMP)
                """)
            cur.execute("""
                CREATE INDEX IF NOT EXISTS posts_user_id_created_at_idx
                ON posts (user_id, created_at DESC)
                """)
            conn.commit()


def create_user_library_table() -> None:
    """Creates the user_library table if it doesn't exist"""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS user_library (
                    id serial PRIMARY KEY,
                    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    game_id integer NOT NULL REFERENCES games(id) ON DELETE CASCADE,
                    status text,
                    added_at timestamp DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, game_id))
                """)
            cur.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS user_library_currently_playing_unique
                ON user_library (user_id)
                WHERE status = 'currently_playing'
                """)
            conn.commit()


def create_user_followers_table() -> None:
    """Creates the user_followers table if it doesn't exist"""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS user_followers (
                    id serial PRIMARY KEY,
                    userid integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    follower_user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    UNIQUE(userid, follower_user_id))
                """)
            conn.commit()


def create_password_reset_table() -> None:
    """Create the password reset tokens table if it doesn't exist."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS password_reset_tokens (
                    id serial PRIMARY KEY,
                    user_id integer REFERENCES users(id) ON DELETE CASCADE,
                    token text UNIQUE NOT NULL,
                    expires_at timestamp NOT NULL,
                    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
                    used boolean DEFAULT false
                )
                """)
            conn.commit()


def create_user_steam_accounts_table() -> None:
    """Create the user_steam_accounts table if it doesn't exist."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS user_steam_accounts (
                    id serial PRIMARY KEY,
                    user_id integer NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                    steam_id text NOT NULL UNIQUE,
                    steam_username text,
                    linked_at timestamp DEFAULT CURRENT_TIMESTAMP,
                    last_sync timestamp,
                    next_sync timestamp,
                    sync_status text DEFAULT 'idle')
                """)
            conn.commit()


def create_user_steam_games_table() -> None:
    """Create the user_steam_games table if it doesn't exist."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS user_steam_games (
                    id serial PRIMARY KEY,
                    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    steam_app_id integer NOT NULL,
                    game_id integer REFERENCES games(id) ON DELETE SET NULL,
                    playtime_forever integer,
                    playtime_2weeks integer,
                    last_played timestamp,
                    steam_name text,
                    synced_at timestamp DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, steam_app_id))
                """)
            conn.commit()


def create_collections_table() -> None:
    """Creates the collections table if it doesn't exist"""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS collections (
                    id serial PRIMARY KEY,
                    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    name text NOT NULL,
                    is_default boolean NOT NULL DEFAULT false,
                    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, name))
                """)
            conn.commit()


def create_collection_games_table() -> None:
    """Creates the collection_games table if it doesn't exist"""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS collection_games (
                    id serial PRIMARY KEY,
                    collection_id integer NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
                    game_id integer NOT NULL REFERENCES games(id) ON DELETE CASCADE,
                    added_at timestamp DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(collection_id, game_id))
                """)
            conn.commit()


def create_steam_verification_tokens_table() -> None:
    """Create the steam_verification_tokens table for OpenID verification."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS steam_verification_tokens (
                    id serial PRIMARY KEY,
                    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    token text NOT NULL UNIQUE,
                    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
                    expires_at timestamp NOT NULL,
                    verified boolean DEFAULT false,
                    verified_steam_id text)
                """)
            conn.commit()
