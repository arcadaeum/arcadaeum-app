import app.routes.health as health_routes
from tests.test_helpers import build_test_client


def test_health_returns_ok():
    client = build_test_client(health_routes.router)
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
