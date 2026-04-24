import os
from typing import Any

from fastapi import HTTPException

import requests


class IGDBService:
    def __init__(self) -> None:
        client_id = os.getenv("IGDB_CLIENT_ID")
        client_secret = os.getenv("IGDB_KEY")
        if not client_id or not client_secret:
            raise RuntimeError(
                "IGDB_CLIENT_ID and IGDB_KEY environment variables are required"
            )

        self.client_id: str = client_id
        self.client_secret: str = client_secret
        self.auth_url = "https://id.twitch.tv/oauth2/token"
        self.base_url = "https://api.igdb.com/v4"
        self.access_token: str | None = None

    # Get an auth token from Twitch for IGDB API access
    def get_access_token(self) -> str:
        params = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "client_credentials",
        }
        response = requests.post(self.auth_url, params=params, timeout=15)
        if response.status_code != 200:
            raise HTTPException(
                status_code=401, detail=f"IGDB Auth Failed: {response.text}"
            )

        token = response.json().get("access_token")
        if not isinstance(token, str) or not token:
            raise HTTPException(
                status_code=401, detail="IGDB Auth Failed: access token missing"
            )
        return token

    def _get_headers(self) -> dict[str, str]:
        if not self.access_token:
            self.access_token = self.get_access_token()
        return {
            "Client-ID": self.client_id,
            "Authorization": f"Bearer {self.access_token}",
        }

    def _post_games_query(self, query: str) -> requests.Response:
        headers = self._get_headers()
        response = requests.post(
            f"{self.base_url}/games",
            headers=headers,
            data=query,
            timeout=20,
        )

        # Retry once on unauthorized (expired/invalid token)
        if response.status_code == 401:
            self.access_token = self.get_access_token()
            headers = self._get_headers()
            response = requests.post(
                f"{self.base_url}/games",
                headers=headers,
                data=query,
                timeout=20,
            )
        return response

    # Fetch top n amount of games from IGDB, sorted by total rating count
    def fetch_top_games(self, limit: int = 500) -> list[dict[str, Any]]:
        """Hit IGDB for the top games."""
        query = f"""
        fields id, name, summary, involved_companies.company.name, involved_companies.developer, cover.image_id, platforms.name, genres.name, first_release_date, total_rating;
        sort total_rating_count desc;
        where total_rating_count > 0;
        limit {limit};
        """

        response = self._post_games_query(query)
        if response.status_code == 200:
            data = response.json()
            return data if isinstance(data, list) else []

        raise HTTPException(
            status_code=response.status_code,
            detail=f"IGDB Fetch Failed: {response.text}",
        )

    # Search for games by name
    def search_games(self, query: str, limit: int = 10) -> list[dict[str, Any]]:
        """Search IGDB for games by name."""
        igdb_query = f"""
        search "{query}";
        fields name, cover.image_id;
        limit {limit};
        """

        response = self._post_games_query(igdb_query)
        if response.status_code == 200:
            data = response.json()
            return data if isinstance(data, list) else []

        raise HTTPException(
            status_code=response.status_code,
            detail=f"IGDB Search Failed: {response.text}",
        )

    # Fetch game details by IGDB ID
    def fetch_game_by_id(self, igdb_id: int) -> dict[str, Any] | None:
        """Fetch game details from IGDB by ID."""
        query = f"""
        fields name, summary, cover.image_id, platforms.name, genres.name, first_release_date, total_rating;
        where id = {igdb_id};
        """

        response = self._post_games_query(query)
        if response.status_code == 200:
            games = response.json()
            if isinstance(games, list) and games:
                first = games[0]
                return first if isinstance(first, dict) else None
            return None

        raise HTTPException(
            status_code=response.status_code,
            detail=f"IGDB Fetch Failed: {response.text}",
        )
