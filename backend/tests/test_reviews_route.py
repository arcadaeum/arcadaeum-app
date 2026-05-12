from fastapi.testclient import TestClient

import app.routes.reviews as reviews_routes
from app.models import User
from app.services import moderation
from app.services.auth import get_current_user
from tests.test_helpers import (
    MockConnection,
    MockCursor,
    build_test_app,
    build_test_client,
)


def test_get_game_arcadaeum_review(monkeypatch):
    """Test getting the aggregated Arcadaeum review for a game."""
    row = (5, 7.5, 4)  # game_id, average_rating, total_reviews
    test_cursor = MockCursor(row=row)
    test_connection = MockConnection(test_cursor)

    import app.database.queries.reviews as reviews_queries

    monkeypatch.setattr(
        reviews_queries, "get_database_connection", lambda: test_connection
    )

    client = build_test_client(reviews_routes.router)
    response = client.get("/games/5/arcadaeum-review")

    assert response.status_code == 200
    data = response.json()
    assert data["game_id"] == 5
    assert data["average_rating"] == 7.5
    assert data["total_reviews"] == 4


def test_get_game_arcadaeum_review_not_found(monkeypatch):
    """Test getting arcadaeum review when no reviews exist."""
    test_cursor = MockCursor(row=None)
    test_connection = MockConnection(test_cursor)

    import app.database.queries.reviews as reviews_queries

    monkeypatch.setattr(
        reviews_queries, "get_database_connection", lambda: test_connection
    )

    client = build_test_client(reviews_routes.router)
    response = client.get("/games/999/arcadaeum-review")

    assert response.status_code == 404
    data = response.json()
    assert "No reviews found" in data["detail"]


def test_get_game_arcadaeum_review_single_review(monkeypatch):
    """Test arcadaeum review with a single review."""
    row = (10, 9.0, 1)  # game_id, average_rating, total_reviews
    test_cursor = MockCursor(row=row)
    test_connection = MockConnection(test_cursor)

    import app.database.queries.reviews as reviews_queries

    monkeypatch.setattr(
        reviews_queries, "get_database_connection", lambda: test_connection
    )

    client = build_test_client(reviews_routes.router)
    response = client.get("/games/10/arcadaeum-review")

    assert response.status_code == 200
    data = response.json()
    assert data["total_reviews"] == 1
    assert data["average_rating"] == 9.0


def test_get_game_arcadaeum_review_many_reviews(monkeypatch):
    """Test arcadaeum review with many reviews (average aggregation)."""
    # Simulating average of ratings: (3 + 5 + 7 + 8 + 6) / 5 = 5.8
    row = (20, 5.8, 5)  # game_id, average_rating, total_reviews
    test_cursor = MockCursor(row=row)
    test_connection = MockConnection(test_cursor)

    import app.database.queries.reviews as reviews_queries

    monkeypatch.setattr(
        reviews_queries, "get_database_connection", lambda: test_connection
    )

    client = build_test_client(reviews_routes.router)
    response = client.get("/games/20/arcadaeum-review")

    assert response.status_code == 200
    data = response.json()
    assert data["total_reviews"] == 5
    assert (
        abs(data["average_rating"] - 5.8) < 0.01
    )  # Account for floating point precision


def test_admin_can_delete_any_review(monkeypatch):
    deleted = {}

    def fake_delete_any_review_by_id(review_id: int) -> bool:
        deleted["review_id"] = review_id
        return True

    monkeypatch.setattr(
        reviews_routes, "delete_any_review_by_id", fake_delete_any_review_by_id
    )
    monkeypatch.setattr(
        reviews_routes,
        "delete_review_by_id",
        lambda user_id, review_id: (_ for _ in ()).throw(
            AssertionError("owner delete used")
        ),
    )

    app = build_test_app(reviews_routes.router)
    app.dependency_overrides[get_current_user] = lambda: User(
        id=99,
        username="admin",
        email="arcadaeum@gmail.com",
        display_name="Arcadaeum",
        profile_picture=None,
    )
    client = TestClient(app)
    response = client.delete("/users/me/reviews/456")

    assert response.status_code == 204
    assert deleted == {"review_id": 456}


def test_create_review_rejects_moderated_text(monkeypatch):
    monkeypatch.setenv("MODERATION_BLOCKLIST", "blockedword")
    moderation.get_blocked_terms.cache_clear()
    monkeypatch.setattr(
        reviews_routes,
        "add_review",
        lambda user_id, game_id, rating, review_text: (_ for _ in ()).throw(
            AssertionError("review was created")
        ),
    )

    app = build_test_app(reviews_routes.router)
    app.dependency_overrides[get_current_user] = lambda: User(
        id=10,
        username="elliott",
        email="elliott@example.com",
        display_name="Elliott",
        profile_picture=None,
    )
    client = TestClient(app)
    response = client.post(
        "/games/1/reviews",
        json={"rating": 8, "review_text": "contains blockedword"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Content contains disallowed language"
    moderation.get_blocked_terms.cache_clear()
