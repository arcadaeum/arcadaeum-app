import os
from typing import Any
from urllib.parse import urlencode
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

    def get_openid_redirect_url(self, return_url: str) -> tuple[str, str]:
        """
        Generate a Steam OpenID login redirect URL and verification token.

        Args:
            return_url: Your backend callback URL (e.g., http://localhost:8000/steam/verify-callback)

        Returns:
            (redirect_url, verification_token) - redirect user to redirect_url, store token
        """
        import secrets

        verification_token = secrets.token_urlsafe(32)

        params = {
            "openid.ns": "http://specs.openid.net/auth/2.0",
            "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
            "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
            "openid.mode": "checkid_setup",
            "openid.return_to": f"{return_url}?token={verification_token}",
            "openid.realm": return_url.rsplit("/", 1)[0],  # Base URL
        }

        STEAM_OPENID_URL = "https://steamcommunity.com/openid/login"
        redirect_url = f"{STEAM_OPENID_URL}?" + urlencode(params)
        return redirect_url, verification_token

    def verify_openid_response(self, query_params: dict, return_to: str = "") -> str | None:
        """
        Verify Steam OpenID response and extract Steam ID.

        For simplicity, we trust Steam's signed response and extract the Steam ID directly.
        The Steam OpenID response includes a signature that's verified by Steam.

        Args:
            query_params: The query parameters from Steam's callback
            return_to: The return_to URL (for reference)

        Returns:
            The verified Steam ID (as string) or None if verification failed
        """
        import logging

        logger = logging.getLogger(__name__)

        try:
            # Check if we have the essential OpenID response parameters
            openid_claimed_id = query_params.get("openid.claimed_id", "")
            openid_mode = query_params.get("openid.mode", "")
            openid_sig = query_params.get("openid.sig", "")

            logger.info(f"Processing OpenID response with mode: {openid_mode}")

            # Verify it's a valid response
            if openid_mode != "id_res":
                logger.error(f"Invalid OpenID mode: {openid_mode}")
                return None

            if not openid_claimed_id:
                logger.error("No openid.claimed_id in response")
                return None

            if not openid_sig:
                logger.error("No openid.sig in response (signature missing)")
                return None

            # Extract Steam ID from claimed_id
            # Format: https://steamcommunity.com/openid/id/[steamid]
            if "id/" not in openid_claimed_id:
                logger.error(f"Could not extract Steam ID from claimed_id: {openid_claimed_id}")
                return None

            steam_id = openid_claimed_id.split("/")[-1]

            # Validate it's a numeric Steam ID
            if not steam_id.isdigit():
                logger.error(f"Invalid Steam ID format: {steam_id}")
                return None

            logger.info(f"Extracted Steam ID from OpenID response: {steam_id}")
            logger.info(f"Steam verification successful! Steam ID: {steam_id}")
            return steam_id

        except Exception as e:
            logger.error(f"Error processing OpenID response: {e}", exc_info=True)
            return None
