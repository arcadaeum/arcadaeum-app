from app.services import cache


class StubIGDBService:
    def __init__(self, games_data):
        self._games_data = games_data

    def fetch_top_games(self, limit=500):
        return self._games_data


def test_cache_popular_games_builds_cover_and_screenshot_urls(monkeypatch):
    games_data = [
        {
            "id": 42,
            "name": "Test Game",
            "summary": "A test summary",
            "cover": {"image_id": "abc123"},
            "screenshots": [{"image_id": "shot1"}, {"image_id": "shot2"}],
            "platforms": [{"name": "PC"}],
            "genres": [{"name": "RPG"}],
            "involved_companies": [{"developer": True, "company": {"name": "DevCo"}}],
            "first_release_date": 1704067200,
            "total_rating": 88.5,
        }
    ]
    captured_calls = []

    def fake_add_game_to_db(**kwargs):
        captured_calls.append(kwargs)
        return 1

    monkeypatch.setattr(cache, "IGDBService", lambda: StubIGDBService(games_data))
    monkeypatch.setattr(cache, "add_game_to_db", fake_add_game_to_db)

    result = cache.cache_popular_games(limit=500)

    assert result == {"message": "Successfully cached 1 games"}
    assert len(captured_calls) == 1
    saved = captured_calls[0]
    assert (
        saved["cover_url"]
        == "https://images.igdb.com/igdb/image/upload/t_cover_big/abc123.jpg"
    )
    assert saved["screenshots"] == [
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/shot1.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/shot2.jpg",
    ]
    assert saved["platforms"] == ["PC"]
    assert saved["genres"] == ["RPG"]
    assert saved["developer"] == "DevCo"
    assert saved["igdb_id"] == 42
    assert saved["title"] == "Test Game"


def test_cache_popular_games_skips_invalid_game_records(monkeypatch):
    games_data = [
        {"id": 1, "name": "Valid Game"},
        {"id": "bad", "name": "Invalid ID"},
        {"id": 2, "name": ""},
        {"name": "Missing ID"},
        {"id": 3},
    ]
    captured_calls = []

    def fake_add_game_to_db(**kwargs):
        captured_calls.append(kwargs)
        return 123

    monkeypatch.setattr(cache, "IGDBService", lambda: StubIGDBService(games_data))
    monkeypatch.setattr(cache, "add_game_to_db", fake_add_game_to_db)

    result = cache.cache_popular_games(limit=500)

    assert result == {"message": "Successfully cached 1 games"}
    assert len(captured_calls) == 1
    assert captured_calls[0]["igdb_id"] == 1
    assert captured_calls[0]["title"] == "Valid Game"


def test_cache_popular_games_returns_no_games_message_when_empty(monkeypatch):
    monkeypatch.setattr(cache, "IGDBService", lambda: StubIGDBService([]))

    result = cache.cache_popular_games(limit=500)

    assert result == {"message": "No games fetched from IGDB"}
