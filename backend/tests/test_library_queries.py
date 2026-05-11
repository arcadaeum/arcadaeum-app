import pytest

import app.database.queries.library as library_queries
from tests.test_helpers import MockConnection, MockCursor


def test_add_to_library(monkeypatch):
    test_cursor = MockCursor(fetchone_result=(42,))
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(library_queries, "get_database_connection", lambda: test_connection)

    result = library_queries.add_to_library(user_id=1, game_id=5)

    assert result == 42
    assert test_connection.committed is True


def test_add_to_library_failure(monkeypatch):
    test_cursor = MockCursor(fetchone_result=None)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(library_queries, "get_database_connection", lambda: test_connection)

    with pytest.raises(RuntimeError, match="Failed to add game to library"):
        library_queries.add_to_library(user_id=1, game_id=5)


def test_game_in_library_true(monkeypatch):
    test_cursor = MockCursor(fetchone_result=(42,))
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(library_queries, "get_database_connection", lambda: test_connection)

    result = library_queries.game_in_library(user_id=1, game_id=5)

    assert result is True


def test_game_in_library_false(monkeypatch):
    test_cursor = MockCursor(fetchone_result=None)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(library_queries, "get_database_connection", lambda: test_connection)

    result = library_queries.game_in_library(user_id=1, game_id=999)

    assert result is False


def test_remove_from_library(monkeypatch):
    test_cursor = MockCursor()
    test_cursor.rowcount = 1
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(library_queries, "get_database_connection", lambda: test_connection)

    result = library_queries.remove_from_library(user_id=1, game_id=5)

    assert result is True


def test_remove_from_library_not_found(monkeypatch):
    test_cursor = MockCursor()
    test_cursor.rowcount = 0
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(library_queries, "get_database_connection", lambda: test_connection)

    result = library_queries.remove_from_library(user_id=1, game_id=999)

    assert result is False


def test_update_library_status(monkeypatch):
    test_cursor = MockCursor()
    test_cursor.rowcount = 1
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(library_queries, "get_database_connection", lambda: test_connection)

    result = library_queries.update_library_status(user_id=1, game_id=5, status="completed")

    assert result is True


def test_update_library_status_currently_playing(monkeypatch):
    test_cursor = MockCursor()
    test_cursor.rowcount = 1
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(library_queries, "get_database_connection", lambda: test_connection)

    result = library_queries.update_library_status(user_id=1, game_id=5, status="currently_playing")

    assert result is True
    assert len(test_cursor.executed) == 2
