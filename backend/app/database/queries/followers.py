from app.database import get_database_connection


def add_user_follower(user_id: int, follower_user_id: int) -> int:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO user_followers (userid, follower_user_id)
                VALUES (%s, %s)
                RETURNING id
                """,
                (user_id, follower_user_id),
            )
            result = cur.fetchone()
            conn.commit()
            if result is None:
                raise RuntimeError("Failed to add follower")
            return result[0]


def remove_user_follower(user_id: int, follower_user_id: int) -> bool:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM user_followers
                WHERE userid = %s AND follower_user_id = %s
                """,
                (user_id, follower_user_id),
            )
            conn.commit()
            return cur.rowcount > 0


def is_following(user_id: int, follower_user_id: int) -> bool:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT 1
                FROM user_followers
                WHERE userid = %s AND follower_user_id = %s
                """,
                (user_id, follower_user_id),
            )
            return cur.fetchone() is not None


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


def get_user_followers_summaries(user_id: int) -> list[dict[str, int | str | None]]:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT u.id, u.username, u.display_name, u.profile_picture
                FROM user_followers uf
                JOIN users u ON u.id = uf.follower_user_id
                WHERE uf.userid = %s
                ORDER BY COALESCE(u.display_name, u.username), u.username
                """,
                (user_id,),
            )
            rows = cur.fetchall()
            if cur.description is None:
                return []
            columns = [desc[0] for desc in cur.description]
            return [dict(zip(columns, row)) for row in rows]


def get_user_following_summaries(user_id: int) -> list[dict[str, int | str | None]]:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT u.id, u.username, u.display_name, u.profile_picture
                FROM user_followers uf
                JOIN users u ON u.id = uf.userid
                WHERE uf.follower_user_id = %s
                ORDER BY COALESCE(u.display_name, u.username), u.username
                """,
                (user_id,),
            )
            rows = cur.fetchall()
            if cur.description is None:
                return []
            columns = [desc[0] for desc in cur.description]
            return [dict(zip(columns, row)) for row in rows]


def get_social_users_with_game(
    user_id: int, game_id: int
) -> list[dict[str, int | str | bool | None]]:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                WITH social_users AS (
                    SELECT
                        uf.follower_user_id AS user_id,
                        TRUE AS follows_you,
                        FALSE AS followed_by_you
                    FROM user_followers uf
                    WHERE uf.userid = %s

                    UNION ALL

                    SELECT
                        uf.userid AS user_id,
                        FALSE AS follows_you,
                        TRUE AS followed_by_you
                    FROM user_followers uf
                    WHERE uf.follower_user_id = %s
                )
                SELECT
                    u.id,
                    u.username,
                    u.display_name,
                    u.profile_picture,
                    BOOL_OR(su.follows_you) AS follows_you,
                    BOOL_OR(su.followed_by_you) AS followed_by_you
                FROM social_users su
                JOIN user_library ul ON ul.user_id = su.user_id
                JOIN users u ON u.id = su.user_id
                WHERE ul.game_id = %s
                GROUP BY u.id, u.username, u.display_name, u.profile_picture
                ORDER BY COALESCE(u.display_name, u.username), u.username
                """,
                (user_id, user_id, game_id),
            )
            rows = cur.fetchall()
            if cur.description is None:
                return []
            columns = [desc[0] for desc in cur.description]
            return [dict(zip(columns, row)) for row in rows]
