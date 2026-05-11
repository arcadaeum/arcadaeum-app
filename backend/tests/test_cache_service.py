from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException

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
    assert saved["cover_url"] == "https://images.igdb.com/igdb/image/upload/t_cover_big/abc123.jpg"
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


def test_get_game_news_returns_fresh_cached_articles(monkeypatch):
    cached_articles = [{"title": "Cached news", "url": "https://example.com/cached"}]

    monkeypatch.setattr(
        cache,
        "get_cached_news_articles",
        lambda query, language, country, limit: cached_articles,
    )
    monkeypatch.setattr(
        cache,
        "get_news_cache_fetched_at",
        lambda query, language, country: datetime.now(timezone.utc),
    )
    monkeypatch.setattr(
        cache,
        "cache_game_news",
        lambda query, language, country, limit: pytest.fail("GNews should not be called"),
    )

    assert cache.get_game_news(query='"video game"', limit=3) == cached_articles


def test_get_game_news_refreshes_stale_cache(monkeypatch):
    refreshed_articles = [{"title": "Fresh news", "url": "https://example.com/fresh"}]
    captured_refresh = {}
    get_cached_calls = []

    def fake_get_cached_news_articles(query, language, country, limit):
        get_cached_calls.append((query, language, country, limit))
        if len(get_cached_calls) == 1:
            return [{"title": "Old news", "url": "https://example.com/old"}]
        return refreshed_articles

    def fake_cache_game_news(query, language, country, limit):
        captured_refresh["query"] = query
        captured_refresh["language"] = language
        captured_refresh["country"] = country
        captured_refresh["limit"] = limit
        return {"message": "Successfully cached 1 news articles"}

    monkeypatch.setattr(cache, "get_cached_news_articles", fake_get_cached_news_articles)
    monkeypatch.setattr(
        cache,
        "get_news_cache_fetched_at",
        lambda query, language, country: datetime.now(timezone.utc) - timedelta(days=2),
    )
    monkeypatch.setattr(cache, "cache_game_news", fake_cache_game_news)

    assert cache.get_game_news(query='"video game"', limit=3) == refreshed_articles
    assert captured_refresh == {
        "query": '"video game"',
        "language": "en",
        "country": "us",
        "limit": cache.get_news_cache_refresh_limit(),
    }


def test_get_game_news_returns_stale_cache_when_refresh_fails(monkeypatch):
    cached_articles = [{"title": "Old news", "url": "https://example.com/old"}]

    monkeypatch.setattr(
        cache,
        "get_cached_news_articles",
        lambda query, language, country, limit: cached_articles,
    )
    monkeypatch.setattr(
        cache,
        "get_news_cache_fetched_at",
        lambda query, language, country: datetime.now(timezone.utc) - timedelta(days=2),
    )
    monkeypatch.setattr(
        cache,
        "cache_game_news",
        lambda query, language, country, limit: (_ for _ in ()).throw(
            HTTPException(status_code=429, detail="quota exceeded")
        ),
    )

    assert cache.get_game_news(query='"video game"', limit=3) == cached_articles


def test_get_news_cache_refresh_limit_handles_invalid_env(monkeypatch):
    monkeypatch.setenv("NEWS_CACHE_REFRESH_LIMIT", "not-a-number")

    assert cache.get_news_cache_refresh_limit() == 10


def test_cache_game_news_fetches_and_stores_articles(monkeypatch):
    articles = [{"title": "Fresh news", "url": "https://example.com/fresh"}]
    captured_replacement = {}

    class StubNewsService:
        def search_news(self, query, language, country, limit):
            return articles

    def fake_replace_cached_news_articles(query, articles, language, country):
        captured_replacement["query"] = query
        captured_replacement["articles"] = articles
        captured_replacement["language"] = language
        captured_replacement["country"] = country

    monkeypatch.setattr(cache, "NewsApiService", StubNewsService)
    monkeypatch.setattr(
        cache,
        "replace_cached_news_articles",
        fake_replace_cached_news_articles,
    )

    assert cache.cache_game_news(query='"video game"', limit=10) == {
        "message": "Successfully cached 1 news articles"
    }
    assert captured_replacement == {
        "query": '"video game"',
        "articles": articles,
        "language": "en",
        "country": "us",
    }
