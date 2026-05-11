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
# Add or replace the test for get_user_favorites to use collections
def test_get_user_favorites_uses_collections(monkeypatch):
    from app.routes.users import get_user_favorites
    from tests.test_helpers import MockConnection, MockCursor

    description = [("id",), ("title",), ("cover_url",)]
    rows = [(1, "Game A", "cover.jpg"), (2, "Game B", None)]

    cursor = MockCursor(rows=rows, description=description)
    conn = MockConnection(cursor)
    monkeypatch.setattr("app.routes.users.get_database_connection", lambda: conn)

    result = get_user_favorites(user_id=10)
    assert len(result) == 2
    assert result[0]["id"] == 1
    assert result[0]["title"] == "Game A"
    # Ensure the SQL uses collections and collection_games, not user_favorites
    sql, params = cursor.executed[0]
    assert "collection_games" in sql
    assert "collections" in sql
    assert params == (10,)
