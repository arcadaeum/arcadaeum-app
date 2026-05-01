from datetime import datetime, timezone

from app.database.connection import get_database_connection


def link_steam_account(user_id: int, steam_id: str, steam_username: str | None = None) -> bool:
    """
    Link a Steam account to a user.

    Args:
        user_id: The Arcadaeum user ID
        steam_id: The Steam ID (SteamID64)
        steam_username: Optional Steam username

    Returns - True if successful, False otherwise
    """
    try:
        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO user_steam_accounts (user_id, steam_id, steam_username, next_sync)
                    VALUES (%s, %s, %s, NOW())
                    ON CONFLICT (user_id) DO UPDATE
                    SET steam_id = EXCLUDED.steam_id,
                        steam_username = EXCLUDED.steam_username
                    """,
                    (user_id, steam_id, steam_username),
                )
                conn.commit()
                return True
    except Exception as e:
        print(f"Error linking Steam account: {e}")
        return False


def unlink_steam_account(user_id: int) -> bool:
    """Unlink a Steam account from a user.
    Removes steam games to prevent orphaned records and then unlinks the account.
    """
    try:
        with get_database_connection() as conn:
            with conn.cursor() as cur:
                # Delete Steam games first
                cur.execute("DELETE FROM user_steam_games WHERE user_id = %s", (user_id,))
                # Delete the Steam account link
                cur.execute("DELETE FROM user_steam_accounts WHERE user_id = %s", (user_id,))
                conn.commit()
                return True
    except Exception as e:
        print(f"Error unlinking Steam account: {e}")
        return False


def get_steam_account(user_id: int) -> dict | None:
    """
    Get the linked Steam account for a user.

    Args:
        user_id: The Arcadaeum user ID

    Returns - Dictionary with Steam account info or None if not linked
    """
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, user_id, steam_id, steam_username, linked_at, 
                       last_sync, next_sync, sync_status
                FROM user_steam_accounts
                WHERE user_id = %s
                """,
                (user_id,),
            )
            row = cur.fetchone()
            if row is None:
                return None

            if cur.description is None:
                return None

            columns = [desc[0] for desc in cur.description]
            return dict(zip(columns, row))


def get_steam_account_by_steam_id(steam_id: str) -> dict | None:
    """
    Get a user's account by their Steam ID.

    Args:
        steam_id: The Steam ID (SteamID64)

    Returns - Dictionary with Steam account info or None if not found
    """
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, user_id, steam_id, steam_username, linked_at,
                       last_sync, next_sync, sync_status
                FROM user_steam_accounts
                WHERE steam_id = %s
                """,
                (steam_id,),
            )
            row = cur.fetchone()
            if row is None:
                return None

            if cur.description is None:
                return None

            columns = [desc[0] for desc in cur.description]
            return dict(zip(columns, row))


def add_steam_game(
    user_id: int,
    steam_app_id: int,
    game_id: int | None,
    playtime_forever: int,
    playtime_2weeks: int,
    steam_name: str,
) -> bool:
    """
    Add or update a Steam game for a user.

    Args:
        user_id: The Arcadaeum user ID
        steam_app_id: The Steam app ID
        game_id: The Arcadaeum game ID (can be None if not matched with IGDB)
        playtime_forever: Total playtime in minutes
        playtime_2weeks: Playtime in last 2 weeks in minutes
        steam_name: The game name from Steam

    Returns:
        True if successful, False otherwise
    """
    try:
        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO user_steam_games 
                    (user_id, steam_app_id, game_id, playtime_forever, playtime_2weeks, steam_name, synced_at)
                    VALUES (%s, %s, %s, %s, %s, %s, NOW())
                    ON CONFLICT (user_id, steam_app_id) DO UPDATE
                    SET game_id = EXCLUDED.game_id,
                        playtime_forever = EXCLUDED.playtime_forever,
                        playtime_2weeks = EXCLUDED.playtime_2weeks,
                        steam_name = EXCLUDED.steam_name,
                        synced_at = NOW()
                    """,
                    (user_id, steam_app_id, game_id, playtime_forever, playtime_2weeks, steam_name),
                )
                conn.commit()
                return True
    except Exception as e:
        print(f"Error adding Steam game: {e}")
        return False


def get_user_steam_games(user_id: int) -> list[dict]:
    """
    Get all Steam games for a user.

    Args:
        user_id: The Arcadaeum user ID

    Returns - List of dictionaries with Steam game info
    """
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, user_id, steam_app_id, game_id, playtime_forever, 
                       playtime_2weeks, last_played, steam_name, synced_at
                FROM user_steam_games
                WHERE user_id = %s
                ORDER BY playtime_forever DESC
                """,
                (user_id,),
            )
            rows = cur.fetchall()
            if cur.description is None:
                return []

            columns = [desc[0] for desc in cur.description]
            return [dict(zip(columns, row)) for row in rows]


def update_sync_status(user_id: int, status: str, next_sync_time: datetime | None = None) -> bool:
    """
    Update the sync status for a user's Steam account.

    Args:
        user_id: The Arcadaeum user ID
        status: The sync status ('idle', 'syncing', 'error')
        next_sync_time: Optional datetime for next sync

    Returns:
        True if successful, False otherwise
    """
    try:
        with get_database_connection() as conn:
            with conn.cursor() as cur:
                if next_sync_time:
                    cur.execute(
                        """
                        UPDATE user_steam_accounts
                        SET sync_status = %s, last_sync = NOW(), next_sync = %s
                        WHERE user_id = %s
                        """,
                        (status, next_sync_time, user_id),
                    )
                else:
                    cur.execute(
                        """
                        UPDATE user_steam_accounts
                        SET sync_status = %s, last_sync = NOW()
                        WHERE user_id = %s
                        """,
                        (status, user_id),
                    )
                conn.commit()
                return True
    except Exception as e:
        print(f"Error updating sync status: {e}")
        return False


def get_steam_accounts_due_for_sync() -> list[dict]:
    """
    Get all Steam accounts that are due for syncing.

    Returns:
        List of Steam account dictionaries
    """
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, user_id, steam_id, steam_username, linked_at,
                       last_sync, next_sync, sync_status
                FROM user_steam_accounts
                WHERE next_sync <= NOW() AND sync_status != 'syncing'
                ORDER BY next_sync ASC
                """)
            rows = cur.fetchall()
            if cur.description is None:
                return []

            columns = [desc[0] for desc in cur.description]
            return [dict(zip(columns, row)) for row in rows]
