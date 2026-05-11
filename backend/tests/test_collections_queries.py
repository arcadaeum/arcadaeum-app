from datetime import datetime

import app.database.queries.collections as collections_queries
from tests.test_helpers import MockConnection, MockCursor


def test_create_default_collections(monkeypatch):
    test_cursor = MockCursor()
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(collections_queries, "get_database_connection", lambda: test_connection)

    collections_queries.create_default_collections(user_id=1)

    assert test_connection.committed is True
    assert len(test_cursor.executed) == 3


def test_get_collections(monkeypatch):
    description = [("id",), ("user_id",), ("name",), ("is_default",), ("created_at",)]
    rows = [
        (1, 1, "Favourites", True, datetime(2024, 1, 1, 10, 0, 0)),
        (2, 1, "My Games", False, datetime(2024, 1, 15, 14, 30, 0)),
    ]

    test_cursor = MockCursor(rows=rows, description=description)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(collections_queries, "get_database_connection", lambda: test_connection)

    result = collections_queries.get_collections(user_id=1)

    assert len(result) == 2
    assert result[0]["name"] == "Favourites"
    assert result[1]["name"] == "My Games"


def test_create_collection(monkeypatch):
    test_cursor = MockCursor(fetchone_result=(42,))
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(collections_queries, "get_database_connection", lambda: test_connection)

    result = collections_queries.create_collection(user_id=1, name="My Collection")

    assert result == 42
    assert test_connection.committed is True


def test_delete_collection(monkeypatch):
    test_cursor = MockCursor()
    test_cursor.rowcount = 1
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(collections_queries, "get_database_connection", lambda: test_connection)

    result = collections_queries.delete_collection(collection_id=1, user_id=1)

    assert result is True


def test_rename_collection(monkeypatch):
    test_cursor = MockCursor(fetchone_result=(1,))
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(collections_queries, "get_database_connection", lambda: test_connection)

    result = collections_queries.rename_collection(user_id=1, collection_id=1, name="Updated")

    assert result is True
