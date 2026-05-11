from datetime import datetime
from typing import Any

from app.database.connection import get_database_connection


def get_cached_news_articles(
    query: str, language: str = "en", country: str = "us", limit: int = 10
) -> list[dict[str, Any]]:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    id,
                    query,
                    language,
                    country,
                    title,
                    description,
                    content,
                    url,
                    image_url AS image,
                    image_url AS "urlToImage",
                    published_at AS "publishedAt",
                    source,
                    fetched_at
                FROM news_articles
                WHERE query = %s AND language = %s AND country = %s
                ORDER BY RANDOM()
                LIMIT %s
                """,
                (query, language, country, limit),
            )
            rows = cur.fetchall()
            if cur.description is None:
                return []
            columns = [desc[0] for desc in cur.description]
            return [dict(zip(columns, row)) for row in rows]


def get_news_cache_fetched_at(
    query: str, language: str = "en", country: str = "us"
) -> datetime | None:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT MAX(fetched_at)
                FROM news_articles
                WHERE query = %s AND language = %s AND country = %s
                """,
                (query, language, country),
            )
            row = cur.fetchone()
            if row is None:
                return None
            fetched_at = row[0]
            return fetched_at if isinstance(fetched_at, datetime) else None


def replace_cached_news_articles(
    query: str,
    articles: list[dict[str, Any]],
    language: str = "en",
    country: str = "us",
) -> None:
    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM news_articles
                WHERE query = %s AND language = %s AND country = %s
                """,
                (query, language, country),
            )

            for article in articles:
                title = article.get("title")
                url = article.get("url")
                if not title or not url:
                    continue

                cur.execute(
                    """
                    INSERT INTO news_articles (
                        query,
                        language,
                        country,
                        title,
                        description,
                        content,
                        url,
                        image_url,
                        published_at,
                        source
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (query, language, country, url) DO UPDATE SET
                        title = EXCLUDED.title,
                        description = EXCLUDED.description,
                        content = EXCLUDED.content,
                        image_url = EXCLUDED.image_url,
                        published_at = EXCLUDED.published_at,
                        source = EXCLUDED.source,
                        fetched_at = CURRENT_TIMESTAMP
                    """,
                    (
                        query,
                        language,
                        country,
                        title,
                        article.get("description"),
                        article.get("content"),
                        url,
                        article.get("image") or article.get("urlToImage"),
                        article.get("publishedAt"),
                        article.get("source"),
                    ),
                )
            conn.commit()
