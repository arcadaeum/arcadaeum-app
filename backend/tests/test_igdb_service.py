import importlib

import pytest
from fastapi import HTTPException


class MockResponse:
    def __init__(self, status_code: int, json_data=None, text: str = ""):
        self.status_code = status_code
        self._json_data = json_data
        self.text = text

    def json(self):
        return self._json_data


def make_response(status_code: int, json_data=None, text: str = ""):
    return MockResponse(status_code=status_code, json_data=json_data, text=text)


def set_required_env(monkeypatch) -> None:
    monkeypatch.setenv("IGDB_CLIENT_ID", "test_client_id")
    monkeypatch.setenv("IGDB_KEY", "test_client_secret")


def import_service_module():
    # Import lazily so env vars can be set first.
    return importlib.import_module("app.services.igdb_service")


def test_fetch_game_by_id_returns_first_game_dict_on_success(monkeypatch):
    set_required_env(monkeypatch)
    igdb_module = import_service_module()
    calls = {"count": 0}

    def fake_post(url, params=None, headers=None, data=None, timeout=None):
        calls["count"] += 1
        if "oauth2/token" in url:
            return make_response(200, {"access_token": "token_123"})
        if url.endswith("/games"):
            return make_response(
                200,
                [
                    {
                        "name": "Halo",
                        "summary": "A sci-fi shooter.",
                        "cover": {"image_id": "abc123"},
                    }
                ],
            )
        raise AssertionError(f"Unexpected URL called: {url}")

    monkeypatch.setattr(igdb_module.requests, "post", fake_post)

    service = igdb_module.IGDBService()
    result = service.fetch_game_by_id(1)

    assert isinstance(result, dict)
    assert result["name"] == "Halo"
    assert calls["count"] == 2  # auth + games


def test_fetch_game_by_id_returns_none_when_empty_list(monkeypatch):
    set_required_env(monkeypatch)
    igdb_module = import_service_module()

    def fake_post(url, params=None, headers=None, data=None, timeout=None):
        if "oauth2/token" in url:
            return make_response(200, {"access_token": "token_123"})
        if url.endswith("/games"):
            return make_response(200, [])
        raise AssertionError(f"Unexpected URL called: {url}")

    monkeypatch.setattr(igdb_module.requests, "post", fake_post)

    service = igdb_module.IGDBService()
    assert service.fetch_game_by_id(999999) is None


def test_fetch_game_by_id_raises_http_exception_on_non_200(monkeypatch):
    set_required_env(monkeypatch)
    igdb_module = import_service_module()

    def fake_post(url, params=None, headers=None, data=None, timeout=None):
        if "oauth2/token" in url:
            return make_response(200, {"access_token": "token_123"})
        if url.endswith("/games"):
            return make_response(500, {"error": "bad"}, text="IGDB server error")
        raise AssertionError(f"Unexpected URL called: {url}")

    monkeypatch.setattr(igdb_module.requests, "post", fake_post)

    service = igdb_module.IGDBService()

    with pytest.raises(HTTPException) as exc_info:
        service.fetch_game_by_id(1)

    assert exc_info.value.status_code == 500
    assert "IGDB Fetch Failed" in str(exc_info.value.detail)


def test_post_games_query_retries_once_on_401_then_succeeds(monkeypatch):
    set_required_env(monkeypatch)
    igdb_module = import_service_module()
    state = {"auth_calls": 0, "games_calls": 0}

    def fake_post(url, params=None, headers=None, data=None, timeout=None):
        if "oauth2/token" in url:
            state["auth_calls"] += 1
            return make_response(200, {"access_token": f"token_{state['auth_calls']}"})
        if url.endswith("/games"):
            state["games_calls"] += 1
            if state["games_calls"] == 1:
                return make_response(
                    401, {"message": "Unauthorized"}, text="Unauthorized"
                )
            return make_response(200, [{"id": 1, "name": "Retry Success"}])
        raise AssertionError(f"Unexpected URL called: {url}")

    monkeypatch.setattr(igdb_module.requests, "post", fake_post)

    service = igdb_module.IGDBService()
    result = service.fetch_top_games(limit=1)

    assert isinstance(result, list)
    assert result[0]["name"] == "Retry Success"
    assert state["games_calls"] == 2
    assert state["auth_calls"] == 2
