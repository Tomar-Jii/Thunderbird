from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["problemStatement"] == "SIH26072"

def test_system_status():
    response = client.get("/api/v1/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["system"] == "STORMSIGHT AI"
    assert data["mode"] == "DEMO"

def test_get_observations():
    response = client.get("/api/v1/observations/current")
    assert response.status_code == 200
    data = response.json()
    assert "observations" in data
    assert len(data["observations"]) > 0

def test_get_location_forecast():
    response = client.get("/api/v1/forecast/bhopal")
    assert response.status_code == 200
    data = response.json()
    assert data["locationId"] == "bhopal"
    assert len(data["horizons"]) == 7
    assert "explainability" in data

def test_run_nowcast():
    response = client.post("/api/v1/nowcast/run")
    assert response.status_code == 200
    data = response.json()
    assert "runId" in data
    assert data["cellsDetected"] > 0
