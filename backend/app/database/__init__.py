# Re-export all database functions for backward compatibility
from app.database.connection import get_database_connection, get_database_url
from app.database.queries.followers import (
    get_user_followers,
    get_user_following,
)
from app.database.queries.games import add_game_to_db
from app.database.queries.password_reset import (
    create_password_reset_token,
    get_password_reset_token,
    mark_reset_token_as_used,
    update_user_password,
)
from app.database.queries.users import (
    create_user,
    get_user_by_email,
    get_user_by_username,
    update_user_display_name,
)
from app.database.tables import (
    create_games_table,
    create_password_reset_table,
    create_tables,
    create_user_followers_table,
    create_user_library_table,
    create_users_table,
)

__all__ = [
    "get_database_url",
    "get_database_connection",
    "create_tables",
    "create_users_table",
    "create_games_table",
    "create_user_library_table",
    "create_user_followers_table",
    "create_password_reset_table",
    "create_user",
    "get_user_by_username",
    "get_user_by_email",
    "update_user_display_name",
    "add_game_to_db",
    "get_user_followers",
    "get_user_following",
    "create_password_reset_token",
    "get_password_reset_token",
    "mark_reset_token_as_used",
    "update_user_password",
]
