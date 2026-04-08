import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db, Base

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_analytics.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="module")
def authenticated_client():
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        c.post("/api/auth/register", json={
            "email": "analytics@example.com",
            "password": "testpassword",
            "full_name": "Analytics User"
        })
        login_resp = c.post(
            "/api/auth/login",
            data={"username": "analytics@example.com", "password": "testpassword"},
        )
        token = login_resp.json()["access_token"]
        c.headers = {"Authorization": f"Bearer {token}"}
        yield c
    Base.metadata.drop_all(bind=engine)


def test_dashboard_kpis(authenticated_client):
    response = authenticated_client.get("/api/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "total_programs" in data


def test_demand_supply(authenticated_client):
    response = authenticated_client.get("/api/analytics/demand-supply")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_skill_gaps(authenticated_client):
    response = authenticated_client.get("/api/analytics/skill-gaps")
    assert response.status_code == 200


def test_regional(authenticated_client):
    response = authenticated_client.get("/api/analytics/regional")
    assert response.status_code == 200
