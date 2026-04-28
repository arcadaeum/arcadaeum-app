from app.database import get_database_connection


def get_user_followers(user_id: int) -> list[int]:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT follower_user_id FROM user_followers WHERE userid = %s",
                (user_id,),
            )
            rows = cur.fetchall()
            return [row[0] for row in rows]


def get_user_following(user_id: int) -> list[int]:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT userid FROM user_followers WHERE follower_user_id = %s",
                (user_id,),
            )
            rows = cur.fetchall()
            return [row[0] for row in rows]
