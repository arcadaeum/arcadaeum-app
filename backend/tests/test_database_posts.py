from datetime import datetime

import app.database.queries.posts as post_queries
from tests.test_helpers import MockConnection, MockCursor


def _description():
    return [
        ("id",),
        ("user_id",),
        ("content",),
        ("created_at",),
        ("updated_at",),
        ("username",),
        ("display_name",),
        ("profile_picture",),
    ]


def test_create_post_inserts_and_returns_id(monkeypatch):
    test_cursor = MockCursor(row=(77,))
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(post_queries, "get_database_connection", lambda: test_connection)

    post_id = post_queries.create_post(10, "New post")

    assert post_id == 77
    assert test_connection.committed is True
    query, params = test_cursor.executed[0]
    assert "INSERT INTO posts" in query
    assert params == (10, "New post")


def test_get_user_posts_orders_newest_first(monkeypatch):
    rows = [
        (
            1,
            10,
            "Hello",
            datetime(2026, 1, 1, 12, 0, 0),
            datetime(2026, 1, 1, 12, 0, 0),
            "elliott",
            "Elliott",
            None,
        )
    ]
    test_cursor = MockCursor(rows=rows, description=_description())
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(post_queries, "get_database_connection", lambda: test_connection)

    posts = post_queries.get_user_posts(10, offset=5, limit=25)

    assert posts[0]["content"] == "Hello"
    query, params = test_cursor.executed[0]
    assert "WHERE p.user_id = %s" in query
    assert "ORDER BY p.created_at DESC, p.id DESC" in query
    assert params == (10, 5, 25)


def test_get_following_posts_uses_follower_relationship(monkeypatch):
    test_cursor = MockCursor(rows=[], description=_description())
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(post_queries, "get_database_connection", lambda: test_connection)

    posts = post_queries.get_following_posts(10)

    assert posts == []
    query, params = test_cursor.executed[0]
    assert "JOIN user_followers uf ON uf.userid = p.user_id" in query
    assert "WHERE uf.follower_user_id = %s" in query
    assert params == (10, 0, 50)
