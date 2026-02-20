import os
import psycopg


def get_database_url():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL environment variable is not set")
    return database_url


def create_tables():
    """Create the necessary tables in the database if they don't exist."""
    database_url = get_database_url()
    with psycopg.connect(database_url) as conn:
        with conn.cursor() as cur:

            # Favourite submissions table
            cur.execute(
                """
				CREATE TABLE IF NOT EXISTS favourite_submissions (
					id serial PRIMARY KEY,
					title text,
					timestamp timestamp)
				"""
            )
