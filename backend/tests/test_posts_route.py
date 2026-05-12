from datetime import datetime

import app.routes.posts as posts_routes
from app.models import User
from app.services import moderation
from app.services.auth import get_current_user
from fastapi.testclient import TestClient
from tests.test_helpers import build_test_app


def _post_dict(post_id: int = 1, user_id: int = 10, content: str = "Hello world"):
    return {
        "id": post_id,
        "user_id": user_id,
        "content": content,
        "created_at": datetime(2026, 1, 1, 12, 0, 0),
        "updated_at": datetime(2026, 1, 1, 12, 0, 0),
        "username": "elliott",
        "display_name": "Elliott",
        "profile_picture": None,
    }


def _client_with_user():
    app = build_test_app(posts_routes.router)
    app.dependency_overrides[get_current_user] = lambda: User(
        id=10,
        username="elliott",
        email="elliott@example.com",
        display_name="Elliott",
        profile_picture=None,
    )
    return TestClient(app)


def _client_with_admin():
    app = build_test_app(posts_routes.router)
    app.dependency_overrides[get_current_user] = lambda: User(
        id=99,
        username="admin",
        email="arcadaeum@gmail.com",
        display_name="Arcadaeum",
        profile_picture=None,
    )
    return TestClient(app)


def test_create_post_trims_content_and_returns_post(monkeypatch):
    created = {}

    def fake_create_post(user_id: int, content: str) -> int:
        created["user_id"] = user_id
        created["content"] = content
        return 123

    monkeypatch.setattr(posts_routes, "create_post", fake_create_post)
    monkeypatch.setattr(posts_routes, "get_post_with_user", lambda post_id: _post_dict(post_id))

    client = _client_with_user()
    response = client.post("/users/me/posts", json={"content": "  Hello world  "})

    assert response.status_code == 201
    assert created == {"user_id": 10, "content": "Hello world"}
    assert response.json()["id"] == 123
    assert response.json()["content"] == "Hello world"


def test_create_post_rejects_blank_content(monkeypatch):
    monkeypatch.setattr(posts_routes, "create_post", lambda user_id, content: 123)

    client = _client_with_user()
    response = client.post("/users/me/posts", json={"content": "   "})

    assert response.status_code == 400
    assert response.json()["detail"] == "Post content cannot be empty"


def test_create_post_rejects_moderated_content(monkeypatch):
    monkeypatch.setenv("MODERATION_BLOCKLIST", "blockedword")
    moderation.get_blocked_terms.cache_clear()
    monkeypatch.setattr(
        posts_routes,
        "create_post",
        lambda user_id, content: (_ for _ in ()).throw(AssertionError("post was created")),
    )

    client = _client_with_user()
    response = client.post("/users/me/posts", json={"content": "contains blockedword"})

    assert response.status_code == 400
    assert response.json()["detail"] == "Content contains disallowed language"
    moderation.get_blocked_terms.cache_clear()


def test_list_user_posts_returns_404_for_missing_user(monkeypatch):
    monkeypatch.setattr(posts_routes, "get_user_by_id", lambda user_id: None)

    client = TestClient(build_test_app(posts_routes.router))
    response = client.get("/users/999/posts")

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_list_following_feed_returns_followed_user_posts(monkeypatch):
    monkeypatch.setattr(
        posts_routes,
        "get_following_posts",
        lambda user_id, offset=0, limit=50: [_post_dict(user_id=20, content="Feed post")],
    )

    client = _client_with_user()
    response = client.get("/users/me/feed")

    assert response.status_code == 200
    assert response.json()[0]["user_id"] == 20
    assert response.json()[0]["content"] == "Feed post"


def test_admin_can_delete_any_post(monkeypatch):
    deleted = {}

    def fake_delete_post_by_id(post_id: int) -> bool:
        deleted["post_id"] = post_id
        return True

    monkeypatch.setattr(posts_routes, "delete_post_by_id", fake_delete_post_by_id)
    monkeypatch.setattr(
        posts_routes,
        "delete_post",
        lambda user_id, post_id: (_ for _ in ()).throw(AssertionError("owner delete used")),
    )

    client = _client_with_admin()
    response = client.delete("/users/me/posts/123")

    assert response.status_code == 204
    assert deleted == {"post_id": 123}
