import os
from typing import Any

from fastapi import HTTPException

import requests

DEFAULT_GAME_NEWS_QUERY = '"video game"'


class NewsApiService:
    def __init__(self) -> None:
        self.api_key = os.getenv("GAME_NEWS_API_KEY")
        self.base_url = os.getenv("GNEWS_BASE_URL", "https://gnews.io/api/v4").rstrip("/")
        self.search_url = f"{self.base_url}/search"
        self.top_headlines_url = f"{self.base_url}/top-headlines"

        if not self.api_key:
            raise HTTPException(
                status_code=503,
                detail="GAME_NEWS_API_KEY environment variable is required",
            )

        self.headers = {"Accept": "application/json"}

    def _get_request(self, url: str, params: dict[str, Any]) -> requests.Response:
        """Internal helper for GET requests with standard error handling."""
        try:
            response = requests.get(
                url,
                headers=self.headers,
                params=params,
                timeout=15,
            )
            return response
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")

    def _extract_articles(self, data: Any) -> list[dict[str, Any]]:
        if not isinstance(data, dict):
            return []

        articles = data.get("articles")
        if not isinstance(articles, list):
            return []

        return [
            self._normalize_article(article) for article in articles if isinstance(article, dict)
        ]

    def _normalize_article(self, article: dict[str, Any]) -> dict[str, Any]:
        source = article.get("source")
        normalized = dict(article)

        if isinstance(source, dict):
            normalized["source"] = source.get("name") or source.get("url")

        if "urlToImage" not in normalized and "image" in normalized:
            normalized["urlToImage"] = normalized["image"]

        return normalized

    def _filter_articles(self, articles: list[dict[str, Any]], query: str) -> list[dict[str, Any]]:
        normalized_query = query.strip().lower()
        if not normalized_query:
            return articles

        filtered_articles = []
        for article in articles:
            searchable_text = " ".join(
                str(article.get(field) or "")
                for field in ("title", "description", "excerpt", "summary", "source")
            ).lower()
            if normalized_query in searchable_text:
                filtered_articles.append(article)

        return filtered_articles or articles

    def search_news(
        self, query: str, language: str = "en", limit: int = 10, country: str = "us"
    ) -> list[dict[str, Any]]:
        """Search for news articles based on keywords."""
        params = {
            "q": query,
            "lang": language,
            "country": country,
            "max": limit,
            "apikey": self.api_key,
        }

        response = self._get_request(self.search_url, params)

        if response.status_code == 200:
            data = response.json()
            articles = self._extract_articles(data)
            return self._filter_articles(articles, query)[:limit]

        raise HTTPException(
            status_code=response.status_code,
            detail=f"News Search Failed: {response.text}",
        )

    def fetch_top_headlines(self, country: str = "us", limit: int = 10) -> list[dict[str, Any]]:
        """Fetch current top headlines."""
        params = {"country": country, "max": limit, "apikey": self.api_key}

        response = self._get_request(self.top_headlines_url, params)

        if response.status_code == 200:
            data = response.json()
            return self._extract_articles(data)[:limit]

        raise HTTPException(
            status_code=response.status_code,
            detail=f"Failed to fetch headlines: {response.text}",
        )
