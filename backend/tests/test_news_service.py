import importlib

import pytest
from fastapi import HTTPException


class MockResponse:
    def __init__(self, status_code: int, json_data=None, text: str = ""):
        self.status_code = status_code
        self._json_data = json_data
        self.text = text

    def json(self):
        return self._json_data


def import_news_module(monkeypatch):
    monkeypatch.setenv("GAME_NEWS_API_KEY", "test_gnews_key")
    monkeypatch.delenv("GNEWS_BASE_URL", raising=False)
    import app.services.news as news_module

    return importlib.reload(news_module)


def test_search_news_uses_gnews_search_endpoint(monkeypatch):
    news_module = import_news_module(monkeypatch)
    captured = {}

    def fake_get(url, headers, params, timeout):
        captured["url"] = url
        captured["headers"] = headers
        captured["params"] = params
        captured["timeout"] = timeout
        return MockResponse(
            200,
            {
                "totalArticles": 1,
                "articles": [
                    {
                        "title": "Gaming news",
                        "url": "https://example.com",
                        "source": {"name": "Example Source", "url": "https://example.com"},
                    }
                ],
            },
        )

    monkeypatch.setattr(news_module.requests, "get", fake_get)

    service = news_module.NewsApiService()
    articles = service.search_news(query="gaming", language="en", limit=5)

    assert captured["url"] == "https://gnews.io/api/v4/search"
    assert captured["headers"] == {"Accept": "application/json"}
    assert captured["params"] == {
        "q": "gaming",
        "lang": "en",
        "country": "us",
        "max": 5,
        "apikey": "test_gnews_key",
    }
    assert captured["timeout"] == 15
    assert articles == [
        {
            "title": "Gaming news",
            "url": "https://example.com",
            "source": "Example Source",
        }
    ]


def test_search_news_can_use_configured_gnews_base_url(monkeypatch):
    monkeypatch.setenv("GAME_NEWS_API_KEY", "test_gnews_key")
    monkeypatch.setenv("GNEWS_BASE_URL", "https://example.test/gnews/")
    import app.services.news as news_module

    news_module = importlib.reload(news_module)
    captured = {}

    def fake_get(url, headers, params, timeout):
        captured["url"] = url
        captured["headers"] = headers
        return MockResponse(
            200,
            {
                "articles": [
                    {"title": "Gaming roundup", "url": "https://example.com/gaming"},
                    {"title": "Console update", "url": "https://example.com/console"},
                ],
            },
        )

    monkeypatch.setattr(news_module.requests, "get", fake_get)

    service = news_module.NewsApiService()
    articles = service.search_news(query="gaming", limit=1)

    assert captured["url"] == "https://example.test/gnews/search"
    assert articles == [{"title": "Gaming roundup", "url": "https://example.com/gaming"}]


def test_search_news_returns_empty_list_for_unexpected_success_payload(monkeypatch):
    news_module = import_news_module(monkeypatch)
    monkeypatch.setattr(
        news_module.requests,
        "get",
        lambda url, headers, params, timeout: MockResponse(200, {"unexpected": []}),
    )

    service = news_module.NewsApiService()

    assert service.search_news("gaming") == []


def test_search_news_raises_http_exception_for_provider_error(monkeypatch):
    news_module = import_news_module(monkeypatch)
    monkeypatch.setattr(
        news_module.requests,
        "get",
        lambda url, headers, params, timeout: MockResponse(429, text="quota exceeded"),
    )

    service = news_module.NewsApiService()

    with pytest.raises(HTTPException) as exc_info:
        service.search_news("gaming")

    assert exc_info.value.status_code == 429
    assert "quota exceeded" in exc_info.value.detail


def test_news_service_requires_game_news_api_key(monkeypatch):
    monkeypatch.delenv("GAME_NEWS_API_KEY", raising=False)
    import app.services.news as news_module

    news_module = importlib.reload(news_module)

    with pytest.raises(HTTPException) as exc_info:
        news_module.NewsApiService()

    assert exc_info.value.status_code == 503
    assert "GAME_NEWS_API_KEY" in exc_info.value.detail
