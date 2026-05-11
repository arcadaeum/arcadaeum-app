from datetime import datetime

import pytest

import app.database.queries.reviews as reviews_queries
from tests.test_helpers import MockConnection, MockCursor


def test_add_review(monkeypatch):
    test_cursor = MockCursor(fetchone_result=(99,))
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(reviews_queries, "get_database_connection", lambda: test_connection)

    result = reviews_queries.add_review(user_id=1, game_id=5, rating=5, review_text="Great!")

    assert result == 99
    assert test_connection.committed is True


def test_add_review_failure(monkeypatch):
    test_cursor = MockCursor(fetchone_result=None)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(reviews_queries, "get_database_connection", lambda: test_connection)

    with pytest.raises(RuntimeError, match="Failed to add review"):
        reviews_queries.add_review(user_id=1, game_id=5, rating=5, review_text="Test")


def test_get_review_by_id(monkeypatch):
    row = (1, 10, 5, 4, "Great!", datetime(2024, 1, 15, 10, 30, 0))
    test_cursor = MockCursor(row=row)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(reviews_queries, "get_database_connection", lambda: test_connection)

    result = reviews_queries.get_review_by_id(review_id=1)

    assert result is not None
    assert result["id"] == 1
    assert result["rating"] == 4


def test_get_review_by_id_not_found(monkeypatch):
    test_cursor = MockCursor(row=None)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(reviews_queries, "get_database_connection", lambda: test_connection)

    result = reviews_queries.get_review_by_id(review_id=999)

    assert result is None


def test_get_review_with_user(monkeypatch):
    row = (1, 10, 5, 4, "Great!", datetime(2024, 1, 15, 10, 30, 0), "johndoe", "John Doe")
    test_cursor = MockCursor(row=row)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(reviews_queries, "get_database_connection", lambda: test_connection)

    result = reviews_queries.get_review_with_user(review_id=1)

    assert result is not None
    assert result["username"] == "johndoe"


def test_get_reviews_for_game(monkeypatch):
    rows = [
        (1, 10, 5, 5, "Excellent!", datetime(2024, 1, 10, 10, 0, 0), "user1", "User One"),
        (2, 11, 5, 4, "Good", datetime(2024, 1, 12, 14, 30, 0), "user2", "User Two"),
    ]

    test_cursor = MockCursor(rows=rows)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(reviews_queries, "get_database_connection", lambda: test_connection)

    result = reviews_queries.get_reviews_for_game(game_id=5)

    assert len(result) == 2
    assert result[0]["rating"] == 5


def test_get_reviews_for_game_empty(monkeypatch):
    test_cursor = MockCursor(rows=[])
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(reviews_queries, "get_database_connection", lambda: test_connection)

    result = reviews_queries.get_reviews_for_game(game_id=999)

    assert result == []


def test_delete_review(monkeypatch):
    test_cursor = MockCursor(fetchone_result=(1,))
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(reviews_queries, "get_database_connection", lambda: test_connection)

    result = reviews_queries.delete_review(user_id=1, game_id=5)

    assert result is True


def test_delete_review_not_found(monkeypatch):
    test_cursor = MockCursor()
    test_cursor.rowcount = 0
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(reviews_queries, "get_database_connection", lambda: test_connection)

    result = reviews_queries.delete_review(user_id=1, game_id=999)

    assert result is False


def test_get_arcadaeum_review(monkeypatch):
    row = (5, 4.5, 3)  # game_id, average_rating, total_reviews
    test_cursor = MockCursor(row=row)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(reviews_queries, "get_database_connection", lambda: test_connection)

    result = reviews_queries.get_arcadaeum_review(game_id=5)

    assert result is not None
    assert result["game_id"] == 5
    assert result["average_rating"] == 4.5
    assert result["total_reviews"] == 3


def test_get_arcadaeum_review_no_reviews(monkeypatch):
    test_cursor = MockCursor(row=None)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(reviews_queries, "get_database_connection", lambda: test_connection)

    result = reviews_queries.get_arcadaeum_review(game_id=999)

    assert result is None


def test_get_arcadaeum_review_single_review(monkeypatch):
    row = (10, 8.0, 1)  # game_id, average_rating (single rating), total_reviews
    test_cursor = MockCursor(row=row)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(reviews_queries, "get_database_connection", lambda: test_connection)

    result = reviews_queries.get_arcadaeum_review(game_id=10)

    assert result is not None
    assert result["average_rating"] == 8.0
    assert result["total_reviews"] == 1
