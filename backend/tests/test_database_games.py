from datetime import date, datetime

from app import database
from tests.test_helpers import MockConnection, MockCursor


def test_add_game_to_db_inserts_and_returns_id(monkeypatch):
    cursor = MockCursor(fetchone_result=(123,))
    conn = MockConnection(cursor)

    monkeypatch.setattr(database, "get_database_connection", lambda: conn)

    result = database.add_game_to_db(
        igdb_id=10,
        title="Test Game",
        summary="A summary",
        developer="Dev Studio",
        cover_url="https://example.com/cover.jpg",
        screenshots=["https://example.com/shot1.jpg", "https://example.com/shot2.jpg"],
        platforms=["PC"],
        genres=["RPG"],
        release_date=1704067200,  # 2024-01-01 UTC
        igdb_rating=88.5,
    )

    assert result == 123
    assert conn.committed is True
    assert len(cursor.executed) == 1

    sql, params = cursor.executed[0]
    assert "INSERT INTO games" in sql
    assert "screenshots" in sql
    assert params is not None
    assert params[5] == [
        "https://example.com/shot1.jpg",
        "https://example.com/shot2.jpg",
    ]


def test_add_game_to_db_upsert_sql_updates_screenshots(monkeypatch):
    cursor = MockCursor(fetchone_result=(1,))
    conn = MockConnection(cursor)

    monkeypatch.setattr(database, "get_database_connection", lambda: conn)

    database.add_game_to_db(
        igdb_id=20,
        title="Upserted Game",
        screenshots=["https://example.com/new-shot.jpg"],
    )

    sql, _ = cursor.executed[0]
    assert "ON CONFLICT (igdb_id) DO UPDATE SET" in sql
    assert "screenshots = EXCLUDED.screenshots" in sql


def test_add_game_to_db_converts_release_timestamp_to_date(monkeypatch):
    cursor = MockCursor(fetchone_result=(77,))
    conn = MockConnection(cursor)

    monkeypatch.setattr(database, "get_database_connection", lambda: conn)

    ts = 1704067200  # 2024-01-01 UTC
    expected_date = datetime.fromtimestamp(ts).date()

    database.add_game_to_db(
        igdb_id=30,
        title="Date Game",
        release_date=ts,
    )

    _, params = cursor.executed[0]
    assert params is not None
    assert isinstance(params[8], date)
    assert params[8] == expected_date
