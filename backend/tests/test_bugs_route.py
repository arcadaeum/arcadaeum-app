from fastapi.testclient import TestClient
from app.main import app
from app.services.auth import get_current_user
from app.models.auth import User


def test_report_bug_requires_auth():
    client = TestClient(app)
    response = client.post(
        "/bugs",
        json={"title": "UI glitch", "description": "Button not responding"},
    )
    assert response.status_code == 401


def test_report_bug_success(monkeypatch):
    client = TestClient(app)

    def mock_get_current_user():
        return User(id=1, username="tester", email="test@example.com")

    app.dependency_overrides[get_current_user] = mock_get_current_user

    def mock_create_bug_report(user_id, title, description):
        assert user_id == 1
        assert title == "UI glitch"
        assert description == "Button not responding"
        return 123

    monkeypatch.setattr("app.routes.bugs.create_bug_report", mock_create_bug_report)

    response = client.post(
        "/bugs",
        json={"title": "UI glitch", "description": "Button not responding"},
    )
    assert response.status_code == 201
    assert response.json() == {"id": 123, "message": "Bug report submitted successfully"}


def test_report_bug_validation_error():
    client = TestClient(app)

    def mock_get_current_user():
        return User(id=1, username="tester", email="test@example.com")

    app.dependency_overrides[get_current_user] = mock_get_current_user

    response = client.post("/bugs", json={"title": "abc", "description": "short"})  # title too short
    assert response.status_code == 422

    response = client.post("/bugs", json={"title": "x" * 101, "description": "valid description"})
    assert response.status_code == 422
