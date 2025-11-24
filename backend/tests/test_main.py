from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_read_main():
    """Test root endpoint returns correct API information."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Deep Focus Planner API"
    assert "version" in data
    assert data["status"] == "running"


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}
