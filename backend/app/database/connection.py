import os

import psycopg


def get_database_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL environment variable is not set")
    return database_url


def get_database_connection() -> psycopg.Connection:
    """Establish a connection to the PostgreSQL database."""
    database_url = get_database_url()
    return psycopg.connect(database_url)
