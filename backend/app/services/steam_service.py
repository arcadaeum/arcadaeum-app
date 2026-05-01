import os
from typing import Any

import requests
from fastapi import HTTPException


class SteamService:
    """Service for interacting with Steam API and managing Steam game data."""

    def __init__(self) -> None:
        self.steam_api_key = os.getenv("STEAM_API_KEY")
        if not self.steam_api_key:
            raise RuntimeError("STEAM_API_KEY environment variable is required")

        self.base_url = "https://api.steampowered.com"
        self.timeout = 15

    def get_owned_games(
        self,
        steam_id: str,
        include_app_info: bool = True,
        include_played_free_games: bool = True,
    ) -> dict[str, Any]:
        """
        Fetch owned games for a Steam user.

        Args:
            steam_id: The SteamID64 of the user
            include_app_info: Include game name and logo information
            include_played_free_games: Include free games that have been played

        Returns - Dictionary containing game_count and games array
        """
        url = f"{self.base_url}/IPlayerService/GetOwnedGames/v0001/"
        params = {
            "key": self.steam_api_key,
            "steamid": steam_id,
            "format": "json",
            "include_appinfo": "1" if include_app_info else "0",
            "include_played_free_games": "1" if include_played_free_games else "0",
        }

        try:
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            if not data.get("response"):
                raise HTTPException(status_code=400, detail="Invalid Steam API response")

            return data["response"]
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=500, detail=f"Steam API error: {str(e)}")

    def validate_steam_id(self, steam_id: str) -> bool:
        """
        Validate that a Steam ID exists and is accessible.

        Args:
            steam_id: The SteamID64 to validate

        Returns:
            True if valid, False otherwise
        """
        try:
            # Try to fetch owned games to validate the Steam ID
            # If it works, the Steam ID is valid (even if private profile)
            response = self.get_owned_games(steam_id)
            return response is not None
        except HTTPException:
            return False
