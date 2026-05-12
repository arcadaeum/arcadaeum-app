import os

os.environ.setdefault("GOOGLE_CLIENT_ID", "test-google-client-id")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "test-google-client-secret")
os.environ.setdefault("SECRET_KEY", "test-secret-key")

import app.routes.auth as auth_routes
from app.models import User
from app.services import moderation
from app.services.auth import get_current_user
from fastapi.testclient import TestClient
from tests.test_helpers import build_test_app


def test_update_display_name_rejects_moderated_content(monkeypatch):
    monkeypatch.setenv("MODERATION_BLOCKLIST", "blockedword")
    moderation.get_blocked_terms.cache_clear()
    monkeypatch.setattr(
        auth_routes,
        "update_user_display_name",
        lambda username, display_name: (_ for _ in ()).throw(
            AssertionError("display name was updated")
        ),
    )

    app = build_test_app(auth_routes.router)
    app.dependency_overrides[get_current_user] = lambda: User(
        id=10,
        username="elliott",
        email="elliott@example.com",
        display_name="Elliott",
        profile_picture=None,
    )
    client = TestClient(app)
    response = client.patch("/me", json={"display_name": "blockedword"})

    assert response.status_code == 400
    assert response.json()["detail"] == "Content contains disallowed language"
    moderation.get_blocked_terms.cache_clear()
