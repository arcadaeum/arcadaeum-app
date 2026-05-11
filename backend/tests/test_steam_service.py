import importlib
import json
import pytest
from fastapi import HTTPException
from urllib.parse import urlencode, parse_qs, urlparse


class MockResponse:
    def __init__(self, status_code: int, json_data=None, text: str = ""):
        self.status_code = status_code
        self._json_data = json_data
        self.text = text

    def json(self):
        return self._json_data

    def raise_for_status(self):
        if self.status_code >= 400:
            raise Exception(f"HTTP {self.status_code}")


def make_response(status_code: int, json_data=None, text: str = ""):
    return MockResponse(status_code=status_code, json_data=json_data, text=text)


def set_required_env(monkeypatch) -> None:
    monkeypatch.setenv("STEAM_WEB_KEY", "test_steam_key_123")


def import_service_module():
    return importlib.import_module("app.services.steam_service")


class TestSteamServiceGetOwnedGames:
    """Tests for SteamService.get_owned_games()"""

    def test_get_owned_games_returns_games_on_success(self, monkeypatch):
        """Should return game list when Steam API returns valid data"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()

        def fake_get(url, params=None, timeout=None):
            return make_response(
                200,
                {
                    "response": {
                        "game_count": 2,
                        "games": [
                            {"appid": 570, "name": "Dota 2", "playtime_forever": 1000},
                            {
                                "appid": 730,
                                "name": "CS:GO",
                                "playtime_forever": 2000,
                            },
                        ],
                    }
                },
            )

        monkeypatch.setattr(steam_module.requests, "get", fake_get)
        service = steam_module.SteamService()
        result = service.get_owned_games("123456789")

        assert result["game_count"] == 2
        assert len(result["games"]) == 2
        assert result["games"][0]["name"] == "Dota 2"

    def test_get_owned_games_passes_correct_params(self, monkeypatch):
        """Should pass correct parameters to Steam API"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()
        captured_params = {}

        def fake_get(url, params=None, timeout=None):
            captured_params.update(params)
            return make_response(200, {"response": {"game_count": 0, "games": []}})

        monkeypatch.setattr(steam_module.requests, "get", fake_get)
        service = steam_module.SteamService()
        service.get_owned_games("123456789", include_app_info=True, include_played_free_games=False)

        assert captured_params["steamid"] == "123456789"
        assert captured_params["include_appinfo"] == "1"
        assert captured_params["include_played_free_games"] == "0"
        assert captured_params["key"] == "test_steam_key_123"

    def test_get_owned_games_raises_on_missing_response(self, monkeypatch):
        """Should raise HTTPException when response key is missing"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()

        def fake_get(url, params=None, timeout=None):
            return make_response(200, {"error": "bad response"})

        monkeypatch.setattr(steam_module.requests, "get", fake_get)
        service = steam_module.SteamService()

        with pytest.raises(HTTPException) as exc_info:
            service.get_owned_games("123456789")

        assert exc_info.value.status_code == 400

    def test_get_owned_games_raises_on_request_error(self, monkeypatch):
        """Should raise HTTPException on network error"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()

        def fake_get(url, params=None, timeout=None):
            raise steam_module.requests.exceptions.ConnectionError("Network error")

        monkeypatch.setattr(steam_module.requests, "get", fake_get)
        service = steam_module.SteamService()

        with pytest.raises(HTTPException) as exc_info:
            service.get_owned_games("123456789")

        assert exc_info.value.status_code == 500

    def test_get_owned_games_handles_empty_games_list(self, monkeypatch):
        """Should handle empty games list gracefully"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()

        def fake_get(url, params=None, timeout=None):
            return make_response(200, {"response": {"game_count": 0, "games": []}})

        monkeypatch.setattr(steam_module.requests, "get", fake_get)
        service = steam_module.SteamService()
        result = service.get_owned_games("123456789")

        assert result["game_count"] == 0
        assert result["games"] == []


class TestSteamServiceValidateSteamId:
    """Tests for SteamService.validate_steam_id()"""

    def test_validate_steam_id_returns_true_on_valid_id(self, monkeypatch):
        """Should return True for valid Steam ID"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()

        def fake_get(url, params=None, timeout=None):
            return make_response(200, {"response": {"game_count": 5, "games": [{"appid": 570}]}})

        monkeypatch.setattr(steam_module.requests, "get", fake_get)
        service = steam_module.SteamService()
        result = service.validate_steam_id("123456789")

        assert result is True

    def test_validate_steam_id_returns_false_on_invalid_id(self, monkeypatch):
        """Should return False for invalid Steam ID"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()

        def fake_get(url, params=None, timeout=None):
            raise steam_module.requests.exceptions.HTTPError("404 Not Found")

        monkeypatch.setattr(steam_module.requests, "get", fake_get)
        service = steam_module.SteamService()
        result = service.validate_steam_id("invalid_id")

        assert result is False


class TestSteamServiceResolveVanityUrl:
    """Tests for SteamService.resolve_vanity_url()"""

    def test_resolve_vanity_url_returns_steam_id_on_success(self, monkeypatch):
        """Should return Steam ID when vanity URL is resolved"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()

        def fake_get(url, params=None, timeout=None):
            return make_response(200, {"response": {"success": 1, "steamid": "76561199000000000"}})

        monkeypatch.setattr(steam_module.requests, "get", fake_get)
        service = steam_module.SteamService()
        result = service.resolve_vanity_url("archbuscam")

        assert result == "76561199000000000"

    def test_resolve_vanity_url_returns_none_on_not_found(self, monkeypatch):
        """Should return None when vanity URL is not found"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()

        def fake_get(url, params=None, timeout=None):
            return make_response(200, {"response": {"success": 42}})

        monkeypatch.setattr(steam_module.requests, "get", fake_get)
        service = steam_module.SteamService()
        result = service.resolve_vanity_url("nonexistent")

        assert result is None

    def test_resolve_vanity_url_raises_on_request_error(self, monkeypatch):
        """Should raise HTTPException on network error"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()

        def fake_get(url, params=None, timeout=None):
            raise steam_module.requests.exceptions.Timeout("Request timeout")

        monkeypatch.setattr(steam_module.requests, "get", fake_get)
        service = steam_module.SteamService()

        with pytest.raises(HTTPException) as exc_info:
            service.resolve_vanity_url("archbuscam")

        assert exc_info.value.status_code == 500

    def test_resolve_vanity_url_passes_correct_params(self, monkeypatch):
        """Should pass correct parameters to Steam API"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()
        captured_params = {}

        def fake_get(url, params=None, timeout=None):
            captured_params.update(params)
            return make_response(200, {"response": {"success": 1, "steamid": "123"}})

        monkeypatch.setattr(steam_module.requests, "get", fake_get)
        service = steam_module.SteamService()
        service.resolve_vanity_url("archbuscam")

        assert captured_params["vanityurl"] == "archbuscam"
        assert captured_params["key"] == "test_steam_key_123"


class TestSteamServiceGetPlayerProfile:
    """Tests for SteamService.get_player_profile()"""

    def test_get_player_profile_returns_profile_on_success(self, monkeypatch):
        """Should return player profile when API returns data"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()

        def fake_get(url, params=None, timeout=None):
            return make_response(
                200,
                {
                    "response": {
                        "players": [
                            {
                                "steamid": "123456789",
                                "personaname": "TestPlayer",
                                "profileurl": "https://steamcommunity.com/id/testplayer/",
                                "avatar": "https://avatars.akamai.steamstatic.com/...",
                            }
                        ]
                    }
                },
            )

        monkeypatch.setattr(steam_module.requests, "get", fake_get)
        service = steam_module.SteamService()
        result = service.get_player_profile("123456789")

        assert result["steamid"] == "123456789"
        assert result["personaname"] == "TestPlayer"

    def test_get_player_profile_returns_empty_dict_when_no_players(self, monkeypatch):
        """Should return empty dict when no player data found"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()

        def fake_get(url, params=None, timeout=None):
            return make_response(200, {"response": {"players": []}})

        monkeypatch.setattr(steam_module.requests, "get", fake_get)
        service = steam_module.SteamService()
        result = service.get_player_profile("invalid_id")

        assert result == {}


class TestSteamServiceOpenIdFlow:
    """Tests for SteamService OpenID methods"""

    def test_get_openid_redirect_url_returns_redirect_and_token(self, monkeypatch):
        """Should return valid redirect URL and verification token"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()
        service = steam_module.SteamService()

        redirect_url, token = service.get_openid_redirect_url(
            "http://localhost:8000/steam/verify-callback"
        )

        assert "https://steamcommunity.com/openid/login" in redirect_url
        assert "openid.mode=checkid_setup" in redirect_url
        assert token is not None
        assert len(token) > 20  # Should be a substantial token

    def test_get_openid_redirect_url_includes_all_parameters(self, monkeypatch):
        """Should include all required OpenID parameters"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()
        service = steam_module.SteamService()

        redirect_url, _ = service.get_openid_redirect_url(
            "http://localhost:8000/steam/verify-callback"
        )

        required_params = [
            "openid.ns",
            "openid.identity",
            "openid.claimed_id",
            "openid.mode",
            "openid.return_to",
            "openid.realm",
        ]

        for param in required_params:
            assert param in redirect_url or param.replace(".", "%2E") in redirect_url

    def test_verify_openid_response_extracts_steam_id_successfully(self, monkeypatch):
        """Should extract Steam ID from valid OpenID response"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()
        service = steam_module.SteamService()

        query_params = {
            "openid.mode": "id_res",
            "openid.claimed_id": "https://steamcommunity.com/openid/id/76561199000000000",
            "openid.sig": "valid_signature_123",
        }

        result = service.verify_openid_response(query_params)
        assert result == "76561199000000000"

    def test_verify_openid_response_returns_none_on_invalid_mode(self, monkeypatch):
        """Should return None when OpenID mode is not id_res"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()
        service = steam_module.SteamService()

        query_params = {
            "openid.mode": "cancel",
            "openid.claimed_id": "https://steamcommunity.com/openid/id/123",
            "openid.sig": "valid_signature",
        }

        result = service.verify_openid_response(query_params)
        assert result is None

    def test_verify_openid_response_returns_none_on_missing_claimed_id(self, monkeypatch):
        """Should return None when claimed_id is missing"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()
        service = steam_module.SteamService()

        query_params = {
            "openid.mode": "id_res",
            "openid.sig": "valid_signature",
        }

        result = service.verify_openid_response(query_params)
        assert result is None

    def test_verify_openid_response_returns_none_on_missing_signature(self, monkeypatch):
        """Should return None when signature is missing"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()
        service = steam_module.SteamService()

        query_params = {
            "openid.mode": "id_res",
            "openid.claimed_id": "https://steamcommunity.com/openid/id/123",
        }

        result = service.verify_openid_response(query_params)
        assert result is None

    def test_verify_openid_response_returns_none_on_invalid_claimed_id_format(self, monkeypatch):
        """Should return None when claimed_id doesn't contain /id/"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()
        service = steam_module.SteamService()

        query_params = {
            "openid.mode": "id_res",
            "openid.claimed_id": "https://example.com/invalid",
            "openid.sig": "valid_signature",
        }

        result = service.verify_openid_response(query_params)
        assert result is None

    def test_verify_openid_response_returns_none_on_non_numeric_steam_id(self, monkeypatch):
        """Should return None when extracted Steam ID is not numeric"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()
        service = steam_module.SteamService()

        query_params = {
            "openid.mode": "id_res",
            "openid.claimed_id": "https://steamcommunity.com/openid/id/not_a_number",
            "openid.sig": "valid_signature",
        }

        result = service.verify_openid_response(query_params)
        assert result is None


class TestSteamServiceInitialization:
    """Tests for SteamService initialisation"""

    def test_steam_service_raises_on_missing_api_key(self, monkeypatch):
        """Should raise RuntimeError when STEAM_WEB_KEY is not set"""
        monkeypatch.delenv("STEAM_WEB_KEY", raising=False)
        # Clear the module cache to force reimport
        import sys

        if "app.services.steam_service" in sys.modules:
            del sys.modules["app.services.steam_service"]

        steam_module = import_service_module()

        with pytest.raises(RuntimeError) as exc_info:
            steam_module.SteamService()

        assert "STEAM_WEB_KEY" in str(exc_info.value)

    def test_steam_service_initializes_with_api_key(self, monkeypatch):
        """Should initialise successfully when STEAM_WEB_KEY is set"""
        set_required_env(monkeypatch)
        steam_module = import_service_module()
        service = steam_module.SteamService()

        assert service.STEAM_WEB_KEY == "test_steam_key_123"
        assert service.base_url == "https://api.steampowered.com"
