"""Tests for Steam models and basic functionality."""

import pytest
from app.models import SteamLinkRequest, SteamVerificationResponse, SteamSyncResult


class TestSteamModels:
    """Tests for Steam-related Pydantic models"""

    def test_steam_link_request_requires_steam_id(self):
        """SteamLinkRequest should require steam_id field"""
        request = SteamLinkRequest(steam_id="123456789")
        assert request.steam_id == "123456789"

    def test_steam_link_request_with_whitespace(self):
        """SteamLinkRequest accepts steam_id with whitespace (validation in route)"""
        request = SteamLinkRequest(steam_id="  123456789  ")
        assert request.steam_id == "  123456789  "

    def test_steam_link_request_empty_string(self):
        """SteamLinkRequest can be created with empty string (validation in route)"""
        request = SteamLinkRequest(steam_id="")
        assert request.steam_id == ""

    def test_steam_verification_response_model(self):
        """SteamVerificationResponse should contain redirect_url"""
        response = SteamVerificationResponse(
            redirect_url="https://steamcommunity.com/openid/login?..."
        )
        assert response.redirect_url.startswith("https://steamcommunity.com")

    def test_steam_sync_result_model_defaults(self):
        """SteamSyncResult should have default empty errors list"""
        result = SteamSyncResult(matched_games=5, added_to_library=3, unmatched_games_found=2)
        assert result.matched_games == 5
        assert result.added_to_library == 3
        assert result.unmatched_games_found == 2
        assert result.errors == []

    def test_steam_sync_result_with_errors(self):
        """SteamSyncResult should support error tracking"""
        errors = ["Game not found", "API timeout"]
        result = SteamSyncResult(
            matched_games=2, added_to_library=1, unmatched_games_found=1, errors=errors
        )
        assert result.errors == errors
        assert len(result.errors) == 2
