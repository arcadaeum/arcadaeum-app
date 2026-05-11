from datetime import datetime

import app.database.queries.news as news_queries


class NewsQueryCursor:
    description = [
        ("id",),
        ("query",),
        ("language",),
        ("country",),
        ("title",),
        ("description",),
        ("content",),
        ("url",),
        ("image",),
        ("urlToImage",),
        ("publishedAt",),
        ("source",),
        ("fetched_at",),
    ]

    def __init__(self):
        self.executed_query = ""
        self.executed_params = None

    def execute(self, query, params=None):
        self.executed_query = query
        self.executed_params = params

    def fetchall(self):
        return [
            (
                1,
                '"video game"',
                "en",
                "us",
                "Cached news",
                "Description",
                "Content",
                "https://example.com/news",
                "https://example.com/image.jpg",
                "https://example.com/image.jpg",
                datetime(2026, 1, 1),
                "Example Source",
                datetime(2026, 1, 2),
            )
        ]

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


class NewsQueryConnection:
    def __init__(self, cursor):
        self._cursor = cursor

    def cursor(self):
        return self._cursor

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


def test_get_cached_news_articles_returns_random_limited_rows(monkeypatch):
    cursor = NewsQueryCursor()
    connection = NewsQueryConnection(cursor)
    monkeypatch.setattr(news_queries, "get_database_connection", lambda: connection)

    articles = news_queries.get_cached_news_articles(
        query='"video game"',
        language="en",
        country="us",
        limit=5,
    )

    assert "ORDER BY RANDOM()" in cursor.executed_query
    assert cursor.executed_params == ('"video game"', "en", "us", 5)
    assert articles[0]["title"] == "Cached news"
