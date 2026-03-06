import os
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
                    oauth_id text)
                """
            )

            conn.commit()  # Makes permanent changes to the database


def create_user(
    username: str,
    email: str,
    password_hash: str | None,
    oauth_provider: str | None = None,
    oauth_id: str | None = None,
) -> int:
    """Create a new user in the database and return the user's ID."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO users (username, email, password_hash, oauth_provider, oauth_id)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
                """,
                (username, email, password_hash, oauth_provider, oauth_id),
            )
            return cur.fetchone()[0]


def get_user_by_username(username: str):
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, username, email, password_hash " "FROM users WHERE username = %s",
                (username,),
            )
            row = cur.fetchone()
            if row:
                return dict(
                    id=row[0],
                    username=row[1],
                    email=row[2],
                    password_hash=row[3],
                )
    return None


def get_user_by_email(email: str):
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, username, email, password_hash FROM users WHERE email = %s",
                (email,),
            )
            row = cur.fetchone()
            if row:
                return dict(id=row[0], username=row[1], email=row[2], password_hash=row[3])
    return None
