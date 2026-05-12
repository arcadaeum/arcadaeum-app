from app.database.connection import get_database_connection


def create_bug_report(user_id: int, title: str, description: str) -> bool:
    """
    Persist a bug report to the database.

    Args:
        user_id:     The Arcadaeum user ID who filed the report
        title:       Short summary of the bug
        description: Full reproduction steps / description

    Returns:
        True if the row was inserted successfully, False otherwise
    """
    try:
        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO bug_reports (user_id, title, description)
                    VALUES (%s, %s, %s)
                    """,
                    (user_id, title, description),
                )
                conn.commit()
                return True
    except Exception as e:
        print(f"Error creating bug report for user {user_id}: {e}")
        return False
