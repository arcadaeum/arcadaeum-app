#### backend/app/database/queries/bugs.py ####
from app.database.connection import get_database_connection

def create_bug_report(user_id: int, title: str, description: str) -> int:
    """Store a bug report in the database."""
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO bug_reports (user_id, title, description)
                VALUES (%s, %s, %s)
                RETURNING id
                """,
                (user_id, title, description),
            )
            result = cur.fetchone()
            conn.commit()
            if result is None:
                raise RuntimeError("Failed to submit bug report")
            return result[0]
