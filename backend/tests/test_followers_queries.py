"""Tests for followers database queries."""

import pytest

import app.database.queries.followers as followers_queries
from tests.test_helpers import MockConnection, MockCursor


def test_add_user_follower(monkeypatch):
    test_cursor = MockCursor(fetchone_result=(123,))
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(followers_queries, "get_database_connection", lambda: test_connection)

    result = followers_queries.add_user_follower(user_id=1, follower_user_id=2)

    assert result == 123
    assert test_connection.committed is True


def test_add_user_follower_failure(monkeypatch):
    test_cursor = MockCursor(fetchone_result=None)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(followers_queries, "get_database_connection", lambda: test_connection)

    with pytest.raises(RuntimeError, match="Failed to add follower"):
        followers_queries.add_user_follower(user_id=1, follower_user_id=2)


def test_remove_user_follower(monkeypatch):
    test_cursor = MockCursor()
    test_cursor.rowcount = 1
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(followers_queries, "get_database_connection", lambda: test_connection)

    result = followers_queries.remove_user_follower(user_id=1, follower_user_id=2)

    assert result is True


def test_remove_user_follower_not_found(monkeypatch):
    test_cursor = MockCursor()
    test_cursor.rowcount = 0
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(followers_queries, "get_database_connection", lambda: test_connection)

    result = followers_queries.remove_user_follower(user_id=1, follower_user_id=2)

    assert result is False


def test_is_following_true(monkeypatch):
    test_cursor = MockCursor(fetchone_result=(1,))
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(followers_queries, "get_database_connection", lambda: test_connection)

    result = followers_queries.is_following(user_id=1, follower_user_id=2)

    assert result is True


def test_is_following_false(monkeypatch):
    test_cursor = MockCursor(fetchone_result=None)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(followers_queries, "get_database_connection", lambda: test_connection)

    result = followers_queries.is_following(user_id=1, follower_user_id=2)

    assert result is False


def test_get_user_followers(monkeypatch):
    rows = [(2,), (3,), (5,)]
    test_cursor = MockCursor(rows=rows)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(followers_queries, "get_database_connection", lambda: test_connection)

    result = followers_queries.get_user_followers(user_id=1)

    assert result == [2, 3, 5]


def test_get_user_followers_empty(monkeypatch):
    test_cursor = MockCursor(rows=[])
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(followers_queries, "get_database_connection", lambda: test_connection)

    result = followers_queries.get_user_followers(user_id=1)

    assert result == []


def test_get_user_following(monkeypatch):
    rows = [(10,), (20,), (30,)]
    test_cursor = MockCursor(rows=rows)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(followers_queries, "get_database_connection", lambda: test_connection)

    result = followers_queries.get_user_following(user_id=1)

    assert result == [10, 20, 30]


def test_get_user_followers_summaries(monkeypatch):
    description = [("id",), ("username",), ("display_name",), ("profile_picture",)]
    rows = [
        (2, "user2", "User Two", "https://example.com/pic2.jpg"),
        (3, "user3", "User Three", "https://example.com/pic3.jpg"),
    ]

    test_cursor = MockCursor(rows=rows, description=description)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(followers_queries, "get_database_connection", lambda: test_connection)

    result = followers_queries.get_user_followers_summaries(user_id=1)

    assert len(result) == 2
    assert result[0]["username"] == "user2"


def test_get_user_following_summaries(monkeypatch):
    description = [("id",), ("username",), ("display_name",), ("profile_picture",)]
    rows = [(10, "user10", "User Ten", "https://example.com/pic10.jpg")]

    test_cursor = MockCursor(rows=rows, description=description)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(followers_queries, "get_database_connection", lambda: test_connection)

    result = followers_queries.get_user_following_summaries(user_id=1)

    assert len(result) == 1
    assert result[0]["username"] == "user10"
