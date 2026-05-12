from fastapi import FastAPI
from fastapi.testclient import TestClient

import app.routes.auth as auth_routes
from app.models.auth import User
from app.services.auth import get_current_user
from tests.test_helpers import MockConnection, MockCursor


def _get_current_user_local() -> User:
    """Mock local (password-based) user for testing."""
    return User(
        id=1,
        username="testuser",
        email="test@example.com",
        display_name="Test User",
        profile_picture=None,
        oauth_provider=None,
        oauth_id=None,
    )


def _get_current_user_oauth() -> User:
    """Mock OAuth user for testing."""
    return User(
        id=2,
        username="oauthuser",
        email="oauth@example.com",
        display_name="OAuth User",
        profile_picture="https://example.com/pic.jpg",
        oauth_provider="google",
        oauth_id="oauth-123",
    )


def build_test_client_with_user(user: User) -> TestClient:
    """Build a test client with a mocked current user."""
    app = FastAPI()
    app.include_router(auth_routes.router)
    app.dependency_overrides[get_current_user] = lambda: user

    return TestClient(app)


def test_change_username_success_local_user(monkeypatch):
    """Test successful username change for a local user."""
    # Mock the database connection
    test_cursor = MockCursor()
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(auth_routes, "get_database_connection", lambda: test_connection)

    call_count = {"newusername": 0}

    def mock_get_user_by_username(username):
        if username == "testuser":
            return {
                "id": 1,
                "username": "testuser",
                "email": "test@example.com",
                "password_hash": "hashed_password",
            }
        if username == "newusername":
            call_count["newusername"] += 1
            # First call is to check if username exists (should be None)
            # Second call is to fetch updated user (should return the user)
            if call_count["newusername"] == 1:
                return None  # Username not taken
            return {
                "id": 1,
                "username": "newusername",
                "email": "test@example.com",
                "display_name": "Test User",
                "profile_picture": None,
                "oauth_provider": None,
                "oauth_id": None,
            }
        return None

    def mock_verify_password(password, hash_value):
        return True

    monkeypatch.setattr(auth_routes, "get_user_by_username", mock_get_user_by_username)
    monkeypatch.setattr(auth_routes, "verify_password", mock_verify_password)

    client = build_test_client_with_user(_get_current_user_local())
    response = client.patch(
        "/me/username",
        json={"new_username": "newusername", "password": "oldpassword123"},
    )

    assert response.status_code == 200
    assert response.json()["username"] == "newusername"
    assert test_connection.committed


def test_change_username_success_oauth_user(monkeypatch):
    """Test successful username change for an OAuth user (no password required)."""
    test_cursor = MockCursor()
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(auth_routes, "get_database_connection", lambda: test_connection)

    call_count = {"newusername": 0}

    def mock_get_user_by_username(username):
        if username == "oauthuser":
            return {
                "id": 2,
                "username": "oauthuser",
                "email": "oauth@example.com",
            }
        if username == "newusername":
            call_count["newusername"] += 1
            # First call is to check if username exists (should be None)
            # Second call is to fetch updated user (should return the user)
            if call_count["newusername"] == 1:
                return None  # Username not taken
            return {
                "id": 2,
                "username": "newusername",
                "email": "oauth@example.com",
                "display_name": "OAuth User",
                "profile_picture": "https://example.com/pic.jpg",
                "oauth_provider": "google",
                "oauth_id": "oauth-123",
            }
        return None

    monkeypatch.setattr(auth_routes, "get_user_by_username", mock_get_user_by_username)

    client = build_test_client_with_user(_get_current_user_oauth())
    # OAuth user doesn't need to provide password
    response = client.patch(
        "/me/username",
        json={"new_username": "newusername"},
    )

    assert response.status_code == 200
    assert response.json()["username"] == "newusername"
    assert test_connection.committed


def test_change_username_already_exists(monkeypatch):
    """Test that changing username to an already taken username fails."""
    test_cursor = MockCursor()
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(auth_routes, "get_database_connection", lambda: test_connection)

    def mock_get_user_by_username(username):
        # Return current user for password verification
        if username == "testuser":
            return {
                "id": 1,
                "username": "testuser",
                "password_hash": "hashed_password",
            }
        # Return existing user for the new username
        if username == "existinguser":
            return {"id": 99, "username": "existinguser"}
        return None

    def mock_verify_password(password, hash_value):
        return True

    monkeypatch.setattr(auth_routes, "get_user_by_username", mock_get_user_by_username)
    monkeypatch.setattr(auth_routes, "verify_password", mock_verify_password)

    client = build_test_client_with_user(_get_current_user_local())
    response = client.patch(
        "/me/username",
        json={"new_username": "existinguser", "password": "password123"},
    )

    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


def test_change_username_invalid_characters(monkeypatch):
    """Test that invalid characters in username are rejected."""
    client = build_test_client_with_user(_get_current_user_local())
    response = client.patch(
        "/me/username",
        json={"new_username": "invalid-user!", "password": "password123"},
    )

    assert response.status_code == 422  # Pydantic validation error
    assert "username" in str(response.json()).lower()


def test_change_username_too_short(monkeypatch):
    """Test that usernames shorter than 3 characters are rejected."""
    client = build_test_client_with_user(_get_current_user_local())
    response = client.patch(
        "/me/username",
        json={"new_username": "ab", "password": "password123"},
    )

    assert response.status_code == 422


def test_change_username_too_long(monkeypatch):
    """Test that usernames longer than 50 characters are rejected."""
    client = build_test_client_with_user(_get_current_user_local())
    response = client.patch(
        "/me/username",
        json={"new_username": "a" * 51, "password": "password123"},
    )

    assert response.status_code == 422


def test_change_username_wrong_password(monkeypatch):
    """Test that wrong password is rejected for local users."""
    test_cursor = MockCursor()
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(auth_routes, "get_database_connection", lambda: test_connection)

    def mock_get_user_by_username(username):
        if username == "testuser":
            return {
                "id": 1,
                "username": "testuser",
                "password_hash": "hashed_password",
            }
        return None

    def mock_verify_password(password, hash_value):
        return False  # Wrong password

    monkeypatch.setattr(auth_routes, "get_user_by_username", mock_get_user_by_username)
    monkeypatch.setattr(auth_routes, "verify_password", mock_verify_password)

    client = build_test_client_with_user(_get_current_user_local())
    response = client.patch(
        "/me/username",
        json={"new_username": "newusername", "password": "wrongpassword"},
    )

    assert response.status_code == 401
    assert "Invalid password" in response.json()["detail"]


def test_change_username_local_user_missing_password(monkeypatch):
    """Test that local users must provide a password."""
    test_cursor = MockCursor()
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(auth_routes, "get_database_connection", lambda: test_connection)

    client = build_test_client_with_user(_get_current_user_local())
    response = client.patch(
        "/me/username",
        json={"new_username": "newusername"},
    )

    assert response.status_code == 400
    assert "Password is required" in response.json()["detail"]


def test_change_username_valid_characters(monkeypatch):
    """Test that valid characters (letters, numbers, underscore) are accepted."""
    test_cursor = MockCursor()
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(auth_routes, "get_database_connection", lambda: test_connection)

    call_count = {"valid_user_123": 0}

    def mock_get_user_by_username(username):
        if username == "testuser":
            return {
                "id": 1,
                "username": "testuser",
                "password_hash": "hashed_password",
            }
        if username == "valid_user_123":
            call_count["valid_user_123"] += 1
            # First call is to check if username exists (should be None)
            # Second call is to fetch updated user (should return the user)
            if call_count["valid_user_123"] == 1:
                return None  # Username not taken
            return {
                "id": 1,
                "username": "valid_user_123",
                "email": "test@example.com",
                "display_name": "Test User",
                "profile_picture": None,
                "oauth_provider": None,
                "oauth_id": None,
            }
        return None

    def mock_verify_password(password, hash_value):
        return True

    monkeypatch.setattr(auth_routes, "get_user_by_username", mock_get_user_by_username)
    monkeypatch.setattr(auth_routes, "verify_password", mock_verify_password)

    client = build_test_client_with_user(_get_current_user_local())
    response = client.patch(
        "/me/username",
        json={"new_username": "valid_user_123", "password": "password123"},
    )

    assert response.status_code == 200
    assert response.json()["username"] == "valid_user_123"


def test_report_bug_success(monkeypatch):
    """Test successfully submitting a bug report."""
    test_cursor = MockCursor()
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(auth_routes, "get_database_connection", lambda: test_connection)

    client = build_test_client_with_user(_get_current_user_local())
    response = client.post(
        "/me/bug-reports",
        json={
            "title": "Login button not working",
            "description": "The login button on the home page doesn't respond to clicks",
        },
    )

    assert response.status_code == 201
    assert "success" in response.json()["message"].lower()
    assert test_connection.committed

    # Verify the SQL was executed with correct parameters
    executed_queries = test_cursor.executed
    assert len(executed_queries) > 0
    query, params = executed_queries[0]
    assert "INSERT INTO bug_reports" in query
    assert params == (
        1,
        "Login button not working",
        "The login button on the home page doesn't respond to clicks",
    )


def test_report_bug_missing_title(monkeypatch):
    """Test that bug report without title is rejected."""
    client = build_test_client_with_user(_get_current_user_local())
    response = client.post(
        "/me/bug-reports",
        json={
            "description": "Some description",
        },
    )

    assert response.status_code == 422


def test_report_bug_empty_title(monkeypatch):
    """Test that bug report with empty title is rejected."""
    client = build_test_client_with_user(_get_current_user_local())
    response = client.post(
        "/me/bug-reports",
        json={
            "title": "",
            "description": "Some description",
        },
    )

    assert response.status_code == 422


def test_report_bug_title_too_long(monkeypatch):
    """Test that bug report with title longer than 200 characters is rejected."""
    client = build_test_client_with_user(_get_current_user_local())
    response = client.post(
        "/me/bug-reports",
        json={
            "title": "a" * 201,
            "description": "Some description",
        },
    )

    assert response.status_code == 422


def test_report_bug_missing_description(monkeypatch):
    """Test that bug report without description is rejected."""
    client = build_test_client_with_user(_get_current_user_local())
    response = client.post(
        "/me/bug-reports",
        json={
            "title": "Bug title",
        },
    )

    assert response.status_code == 422


def test_report_bug_empty_description(monkeypatch):
    """Test that bug report with empty description is rejected."""
    client = build_test_client_with_user(_get_current_user_local())
    response = client.post(
        "/me/bug-reports",
        json={
            "title": "Bug title",
            "description": "",
        },
    )

    assert response.status_code == 422


def test_report_bug_long_description(monkeypatch):
    """Test that bug report with very long description is accepted."""
    test_cursor = MockCursor()
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(auth_routes, "get_database_connection", lambda: test_connection)

    long_description = "a" * 5000

    client = build_test_client_with_user(_get_current_user_local())
    response = client.post(
        "/me/bug-reports",
        json={
            "title": "Bug title",
            "description": long_description,
        },
    )

    assert response.status_code == 201
    assert test_connection.committed


def test_report_bug_oauth_user(monkeypatch):
    """Test that OAuth users can also submit bug reports."""
    test_cursor = MockCursor()
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(auth_routes, "get_database_connection", lambda: test_connection)

    client = build_test_client_with_user(_get_current_user_oauth())
    response = client.post(
        "/me/bug-reports",
        json={
            "title": "OAuth bug",
            "description": "Bug from OAuth user",
        },
    )

    assert response.status_code == 201
    assert test_connection.committed
    # Verify user ID is correct for OAuth user
    executed_queries = test_cursor.executed
    assert len(executed_queries) > 0
    query, params = executed_queries[0]
    assert params[0] == 2  # OAuth user ID


def test_report_bug_special_characters_in_title(monkeypatch):
    """Test that special characters in title are accepted."""
    test_cursor = MockCursor()
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(auth_routes, "get_database_connection", lambda: test_connection)

    client = build_test_client_with_user(_get_current_user_local())
    response = client.post(
        "/me/bug-reports",
        json={
            "title": "Bug: Can't click button! (Critical)",
            "description": "Description with special chars: !@#$%",
        },
    )

    assert response.status_code == 201
    assert test_connection.committed
