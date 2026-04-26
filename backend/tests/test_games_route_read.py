from datetime import date

import app.routes.games as games_routes
from tests.test_helpers import MockConnection, MockCursor, build_test_client


def test_get_games_returns_list_with_screenshots_field(monkeypatch):
    description = [
        ("id",),
        ("igdb_id",),
        ("title",),
        ("summary",),
        ("developer",),
        ("cover_url",),
        ("screenshots",),
        ("platforms",),
        ("release_date",),
        ("igdb_rating",),
        ("created_at",),
    ]

    rows = [
        (
            1,
            999,
            "Test Game",
            "Summary",
            "Dev Studio",
            "https://images.igdb.com/cover.jpg",
            [
                "https://images.igdb.com/igdb/image/upload/t_screenshot_big/a1.jpg",
                "https://images.igdb.com/igdb/image/upload/t_screenshot_big/a2.jpg",
            ],
            ["PC", "PS5"],
            date(2024, 1, 1),
            87.5,
            "2024-01-02T10:00:00",
        )
    ]

    test_cursor = MockCursor(rows=rows, description=description)
    test_connection = MockConnection(test_cursor)

    monkeypatch.setattr(
        games_routes, "get_database_connection", lambda: test_connection
    )

    client = build_test_client(games_routes.router)
    response = client.get("/games")

    assert response.status_code == 200
    body = response.json()
    assert isinstance(body, list)
    assert len(body) == 1
    assert "screenshots" in body[0]
    assert body[0]["screenshots"] == [
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/a1.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/a2.jpg",
    ]


def test_get_game_returns_404_when_missing(monkeypatch):
    test_cursor = MockCursor(row=None, description=[("id",)])
    test_connection = MockConnection(test_cursor)

    monkeypatch.setattr(
        games_routes, "get_database_connection", lambda: test_connection
    )

    client = build_test_client(games_routes.router)
    response = client.get("/games/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Game not found"


def test_get_game_returns_game_with_screenshots(monkeypatch):
    description = [
        ("id",),
        ("igdb_id",),
        ("title",),
        ("summary",),
        ("developer",),
        ("cover_url",),
        ("screenshots",),
        ("platforms",),
        ("release_date",),
        ("igdb_rating",),
        ("created_at",),
    ]

    row = (
        2,
        1001,
        "Another Game",
        "Another Summary",
        "Another Dev",
        "https://images.igdb.com/cover2.jpg",
        ["https://images.igdb.com/igdb/image/upload/t_screenshot_big/b1.jpg"],
        ["Switch"],
        date(2023, 6, 15),
        91.0,
        "2024-02-02T10:00:00",
    )

    test_cursor = MockCursor(row=row, description=description)
    test_connection = MockConnection(test_cursor)

    monkeypatch.setattr(
        games_routes, "get_database_connection", lambda: test_connection
    )

    client = build_test_client(games_routes.router)
    response = client.get("/games/2")

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == 2
    assert body["title"] == "Another Game"
    assert body["screenshots"] == [
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/b1.jpg"
    ]
