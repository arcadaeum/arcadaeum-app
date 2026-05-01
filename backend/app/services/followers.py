from app.database.queries.followers import (
    add_user_follower,
    get_user_followers_summaries,
    get_user_following_summaries,
    is_following,
    remove_user_follower,
)
from app.database.queries.users import get_user_by_id


def _ensure_user_exists(user_id: int) -> None:
    if get_user_by_id(user_id) is None:
        raise LookupError("User not found")


def follow_user(follower_user_id: int, user_id: int) -> None:
    if follower_user_id == user_id:
        raise ValueError("Users cannot follow themselves")
    _ensure_user_exists(user_id)
    add_user_follower(user_id, follower_user_id)


def unfollow_user(follower_user_id: int, user_id: int) -> bool:
    if follower_user_id == user_id:
        raise ValueError("Users cannot unfollow themselves")
    _ensure_user_exists(user_id)
    return remove_user_follower(user_id, follower_user_id)


def get_followers(user_id: int) -> list[dict[str, int | str | None]]:
    _ensure_user_exists(user_id)
    return get_user_followers_summaries(user_id)


def get_following(user_id: int) -> list[dict[str, int | str | None]]:
    _ensure_user_exists(user_id)
    return get_user_following_summaries(user_id)


def check_is_following(follower_user_id: int, user_id: int) -> bool:
    return is_following(user_id, follower_user_id)
