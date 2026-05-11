import app.routes.followers as followers_routes
from app.models.auth import User
from fastapi.testclient import TestClient
from tests.test_helpers import build_test_app


def test_list_social_users_with_game(monkeypatch):
    captured: dict[str, int] = {}

    def fake_get_social_users_with_game(user_id: int, game_id: int):
        captured["user_id"] = user_id
        captured["game_id"] = game_id
        return [
            {
                "id": 2,
                "username": "player2",
                "display_name": "Player Two",
                "profile_picture": None,
                "follows_you": True,
                "followed_by_you": False,
            }
        ]

    app = build_test_app(followers_routes.router)
    app.dependency_overrides[followers_routes.get_current_user] = lambda: User(
        id=1,
        username="player1",
        email="player1@example.com",
    )
    monkeypatch.setattr(
        followers_routes, "get_social_users_with_game", fake_get_social_users_with_game
    )

    response = TestClient(app).get("/users/me/social-library/42")

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": 2,
            "username": "player2",
            "display_name": "Player Two",
            "profile_picture": None,
            "follows_you": True,
            "followed_by_you": False,
        }
    ]
    assert captured == {"user_id": 1, "game_id": 42}
