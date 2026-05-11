import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.auth import get_current_user
from app.models.auth import User


def test_update_username_settings(monkeypatch):
    client = TestClient(app)

    def mock_get_current_user():
        return User(id=1, username="oldname", email="test@example.com")

    app.dependency_overrides[get_current_user] = mock_get_current_user

    mock_user_db = {
        "id": 1,
        "username": "oldname",
        "email": "test@example.com",
        "password_hash": "hash",
    }

    def mock_get_user_by_id(user_id):
        return mock_user_db

    monkeypatch.setattr("app.routes.settings.get_user_by_id", mock_get_user_by_id)

    def mock_verify_password(plain, hashed):
        return True

    monkeypatch.setattr("app.routes.settings.verify_password", mock_verify_password)

    def mock_get_user_by_username(username):
        return None  # not taken

    monkeypatch.setattr("app.routes.settings.get_user_by_username", mock_get_user_by_username)

    def mock_update_username(user_id, new_username):
        assert user_id == 1
        assert new_username == "newname"
        return True

    monkeypatch.setattr("app.routes.settings.update_username", mock_update_username)

    response = client.patch(
        "/settings/username",
        json={"current_password": "pass", "new_username": "newname"},
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Username updated successfully"
    assert response.json()["username"] == "newname"


def test_update_display_name_settings(monkeypatch):
    client = TestClient(app)

    def mock_get_current_user():
        return User(id=1, username="user", email="test@example.com")

    app.dependency_overrides[get_current_user] = mock_get_current_user

    def mock_update_user_display_name(username, display_name):
        assert username == "user"
        assert display_name == "New Name"

    monkeypatch.setattr("app.routes.settings.update_user_display_name", mock_update_user_display_name)

    response = client.patch("/settings/display-name", json={"display_name": "New Name"})
    assert response.status_code == 200
    assert response.json()["message"] == "Display name updated successfully"
    assert response.json()["display_name"] == "New Name"


def test_delete_account_settings(monkeypatch):
    client = TestClient(app)

    def mock_get_current_user():
        return User(id=1, username="todelete", email="test@example.com")

    app.dependency_overrides[get_current_user] = mock_get_current_user

    mock_user_db = {
        "id": 1,
        "username": "todelete",
        "email": "test@example.com",
        "password_hash": "hash",
    }

    def mock_get_user_by_id(user_id):
        return mock_user_db

    monkeypatch.setattr("app.routes.settings.get_user_by_id", mock_get_user_by_id)

    def mock_verify_password(plain, hashed):
        return True

    monkeypatch.setattr("app.routes.settings.verify_password", mock_verify_password)

    def mock_delete_user(user_id):
        assert user_id == 1
        return True

    monkeypatch.setattr("app.routes.settings.delete_user", mock_delete_user)

    response = client.delete("/settings/account", json={"password": "pass", "confirmation": "DELETE MY ACCOUNT"})
    assert response.status_code == 200
    assert response.json()["message"] == "Account deleted successfully."


def test_delete_account_wrong_confirmation(monkeypatch):
    client = TestClient(app)

    def mock_get_current_user():
        return User(id=1, username="todelete", email="test@example.com")

    app.dependency_overrides[get_current_user] = mock_get_current_user

    response = client.delete("/settings/account", json={"password": "pass", "confirmation": "wrong phrase"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Confirmation phrase mismatch."
    