import app.database.queries.games as games_queries
import app.routes.games as games_routes
from tests.test_helpers import MockConnection, MockCursor, build_test_client


class StubIGDBService:
    def __init__(self, game_data=None):
        self._game_data = game_data

    def fetch_game_by_id(self, _igdb_id: int):
        return self._game_data


def test_add_from_igdb_returns_existing_game_when_already_in_db(monkeypatch):
    # First query returns existing game ID, second query returns the title
    fake_conn = MockConnection(MockCursor(fetchone_result=[(55,), ("Existing Game",)]))
    monkeypatch.setattr(games_routes, "get_database_connection", lambda: fake_conn)
    monkeypatch.setattr(games_queries, "get_database_connection", lambda: fake_conn)
    monkeypatch.setattr(games_routes, "get_igdb_service", lambda: StubIGDBService())

    client = build_test_client(games_routes.router)
    response = client.post("/games/add-from-igdb", json={"igdb_id": 999})

    assert response.status_code == 200
    assert response.json() == {"id": 55, "title": "Existing Game"}


def test_add_from_igdb_fetches_and_saves_with_screenshots(monkeypatch):
    # First query returns no existing game (None), second query returns the new game with its title
    fake_conn = MockConnection(MockCursor(fetchone_result=[None, ("Test Game",)]))
    captured_add_game_kwargs = {}

    game_data = {
        "name": "Test Game",
        "summary": "A test summary",
        "cover": {"image_id": "cover123"},
        "screenshots": [{"image_id": "shot1"}, {"image_id": "shot2"}],
        "platforms": [{"name": "PC"}],
        "genres": [{"name": "RPG"}],
        "first_release_date": 1700000000,
        "total_rating": 82.4,
    }

    def fake_add_game_to_db(**kwargs):
        captured_add_game_kwargs.update(kwargs)
        return 101

    monkeypatch.setattr(games_routes, "get_database_connection", lambda: fake_conn)
    monkeypatch.setattr(games_queries, "get_database_connection", lambda: fake_conn)
    monkeypatch.setattr(
        games_routes, "get_igdb_service", lambda: StubIGDBService(game_data)
    )
    monkeypatch.setattr(games_routes, "add_game_to_db", fake_add_game_to_db)
    monkeypatch.setattr(games_queries, "add_game_to_db", fake_add_game_to_db)

    client = build_test_client(games_routes.router)
    response = client.post("/games/add-from-igdb", json={"igdb_id": 1234})

    assert response.status_code == 200
    assert response.json() == {"id": 101, "title": "Test Game"}
    assert captured_add_game_kwargs["igdb_id"] == 1234
    assert captured_add_game_kwargs["title"] == "Test Game"
    assert captured_add_game_kwargs["cover_url"].endswith("/t_cover_big/cover123.jpg")
    assert captured_add_game_kwargs["screenshots"] == [
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/shot1.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/shot2.jpg",
    ]


def test_add_from_igdb_returns_404_when_igdb_game_missing(monkeypatch):
    fake_conn = MockConnection(MockCursor(row=None))
    monkeypatch.setattr(games_routes, "get_database_connection", lambda: fake_conn)
    monkeypatch.setattr(games_queries, "get_database_connection", lambda: fake_conn)
    monkeypatch.setattr(games_routes, "get_igdb_service", lambda: StubIGDBService())

    client = build_test_client(games_routes.router)
    response = client.post("/games/add-from-igdb", json={"igdb_id": 9999})

    assert response.status_code == 404
    assert response.json()["detail"] == "Game not found on IGDB or failed to add"
