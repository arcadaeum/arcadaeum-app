import app.routes.users as users_routes
from tests.test_helpers import MockConnection, MockCursor, build_test_client


def test_search_users(monkeypatch):
    description = [("id",), ("username",), ("display_name",), ("profile_picture",)]
    rows = [(1, "steve", "Steve Beve", "https://example.com/pic.jpg")]

    test_cursor = MockCursor(rows=rows, description=description)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(users_routes, "get_database_connection", lambda: test_connection)

    client = build_test_client(users_routes.router)
    response = client.get("/users/search?q=steve")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["username"] == "steve"


def test_search_users_empty(monkeypatch):
    description = [("id",), ("username",), ("display_name",), ("profile_picture",)]
    test_cursor = MockCursor(rows=[], description=description)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(users_routes, "get_database_connection", lambda: test_connection)

    client = build_test_client(users_routes.router)
    response = client.get("/users/search?q=xyz")

    assert response.status_code == 200
    assert response.json() == []


def test_get_user(monkeypatch):
    description = [("id",), ("username",), ("email",), ("display_name",), ("profile_picture",)]
    row = (1, "steve", "steve@example.com", "Steve Beve", "https://example.com/pic.jpg")

    test_cursor = MockCursor(row=row, description=description)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(users_routes, "get_database_connection", lambda: test_connection)

    client = build_test_client(users_routes.router)
    response = client.get("/users/1")

    assert response.status_code == 200
    assert response.json()["username"] == "steve"


def test_get_user_not_found(monkeypatch):
    description = [("id",), ("username",), ("email",), ("display_name",), ("profile_picture",)]
    test_cursor = MockCursor(row=None, description=description)
    test_connection = MockConnection(test_cursor)
    monkeypatch.setattr(users_routes, "get_database_connection", lambda: test_connection)

    client = build_test_client(users_routes.router)
    response = client.get("/users/999")

    assert response.status_code == 404
