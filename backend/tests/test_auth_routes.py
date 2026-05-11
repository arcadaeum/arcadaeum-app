import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.auth import get_current_user
from app.models.auth import User


def test_change_username_success(monkeypatch):
    client = TestClient(app)

    def mock_get_current_user():
        return User(id=1, username="oldname", email="test@example.com", display_name=None)

    app.dependency_overrides[get_current_user] = mock_get_current_user

    # Mock user lookup
    mock_user_db = {
        "id": 1,
        "username": "oldname",
        "email": "test@example.com",
        "password_hash": "$2b$12$abc...",
        "display_name": None,
    }

    def mock_get_user_by_email(email):
        return mock_user_db

    monkeypatch.setattr("app.routes.auth.get_user_by_email", mock_get_user_by_email)

    # Mock password verification
    def mock_verify_password(plain, hashed):
        return True

    monkeypatch.setattr("app.routes.auth.verify_password", mock_verify_password)

    # Mock username update
    def mock_update_username(user_id, new_username):
        assert user_id == 1
        assert new_username == "newname"
        return True

    monkeypatch.setattr("app.routes.auth.update_username", mock_update_username)

    # Mock returning updated user
    def mock_get_user_by_email_after(email):
        return {
            "id": 1,
            "username": "newname",
            "email": "test@example.com",
            "display_name": None,
        }

    monkeypatch.setattr("app.routes.auth.get_user_by_email", mock_get_user_by_email_after)

    response = client.patch(
        "/me/username",
        json={"current_password": "correct", "new_username": "newname"},
    )
    assert response.status_code == 200
    assert response.json()["username"] == "newname"


def test_change_username_wrong_password(monkeypatch):
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

    def mock_get_user_by_email(email):
        return mock_user_db

    monkeypatch.setattr("app.routes.auth.get_user_by_email", mock_get_user_by_email)

    def mock_verify_password(plain, hashed):
        return False  # wrong password

    monkeypatch.setattr("app.routes.auth.verify_password", mock_verify_password)

    response = client.patch(
        "/me/username",
        json={"current_password": "wrong", "new_username": "newname"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect password"


def test_delete_account_success(monkeypatch):
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

    def mock_get_user_by_email(email):
        return mock_user_db

    monkeypatch.setattr("app.routes.auth.get_user_by_email", mock_get_user_by_email)

    def mock_verify_password(plain, hashed):
        return True

    monkeypatch.setattr("app.routes.auth.verify_password", mock_verify_password)

    def mock_delete_user(user_id):
        assert user_id == 1
        return True

    monkeypatch.setattr("app.routes.auth.delete_user", mock_delete_user)

    response = client.delete("/me", json={"password": "correct"})
    assert response.status_code == 204
