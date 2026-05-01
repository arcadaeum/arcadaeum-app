import os
from typing import Any

from fastapi import HTTPException

import requests


class NewsApiService:
    def __init__(self) -> None:
        api_key = os.getenv("RAPIDAPI_KEY")
        api_host = os.getenv("NEWS_API_HOST", "news-api14.p.rapidapi.com")

        if not api_key:
            raise RuntimeError("RAPIDAPI_KEY environment variable is required")

        self.headers = {
            "x-rapidapi-key": api_key,
            "x-rapidapi-host": api_host,
        }
        self.base_url = f"https://{api_host}/v2"

    def _get_request(self, endpoint: str, params: dict[str, Any]) -> requests.Response:
        """Internal helper for GET requests with standard error handling."""
        try:
            response = requests.get(
                f"{self.base_url}/{endpoint}",
                headers=self.headers,
                params=params,
                timeout=15,
            )
            return response
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")

    def search_news(
        self, query: str, language: str = "en", limit: int = 10
    ) -> list[dict[str, Any]]:
        """Search for news articles based on keywords."""
        params = {"query": query, "language": language, "limit": limit}

        response = self._get_request("search/articles", params)

        if response.status_code == 200:
            data = response.json()
            return data.get("data", []) if isinstance(data, dict) else []

        raise HTTPException(
            status_code=response.status_code,
            detail=f"News Search Failed: {response.text}",
        )

    def fetch_top_headlines(
        self, country: str = "us", limit: int = 10
    ) -> list[dict[str, Any]]:
        """Fetch current top headlines."""
        params = {"country": country, "limit": limit}

        response = self._get_request("top-headlines", params)

        if response.status_code == 200:
            data = response.json()
            return data.get("data", [])

        raise HTTPException(
            status_code=response.status_code, detail="Failed to fetch headlines"
        )
