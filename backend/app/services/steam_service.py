import os
from typing import Any

import requests
from fastapi import HTTPException


class SteamService:
    """Service for interacting with Steam API and managing Steam game data."""

    def __init__(self) -> None:
        self.STEAM_WEB_KEY = os.getenv("STEAM_WEB_KEY")
        if not self.STEAM_WEB_KEY:
            raise RuntimeError("STEAM_WEB_KEY environment variable is required")

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
            "key": self.STEAM_WEB_KEY,
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

    def resolve_vanity_url(self, vanity_url: str) -> str | None:
        """
        Resolve a Steam vanity URL to a SteamID64.

        Args:
            vanity_url: The vanity URL slug (e.g., 'archbuscam' from /id/archbuscam)

        Returns:
            The SteamID64 as a string, or None if not found
        """
        url = f"{self.base_url}/ISteamUser/ResolveVanityURL/v0001/"
        params = {
            "key": self.STEAM_WEB_KEY,
            "vanityurl": vanity_url,
            "format": "json",
        }

        try:
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            if data.get("response", {}).get("success") == 1:
                return str(data["response"]["steamid"])
            return None
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=500, detail=f"Steam API error: {str(e)}")

    def get_player_profile(self, steam_id: str) -> dict[str, Any]:
        """
        Fetch a Steam user's public profile information.

        Args:
            steam_id: The SteamID64 of the user

        Returns:
            Dictionary containing user profile data (username, profile URL, avatar, etc.)
        """
        url = f"{self.base_url}/ISteamUser/GetPlayerSummaries/v0002/"
        params = {
            "key": self.STEAM_WEB_KEY,
            "steamids": steam_id,
            "format": "json",
        }

        try:
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            players = data.get("response", {}).get("players", [])
            if players:
                return players[0]
            return {}
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=500, detail=f"Steam API error: {str(e)}")
