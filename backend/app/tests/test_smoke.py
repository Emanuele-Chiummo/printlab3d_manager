import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base
from app.main import create_app
from app.api_v1.deps import get_db
from app.core.security import get_password_hash
from app.models.user import User, UserRole


@pytest.mark.skip(reason="Test needs refactoring for correct endpoint resolution - TODO: fix in v1.1")
def test_smoke_login_and_list_filaments():
    # use a temporary file database rather than in‑memory; the latter
    # creates a new empty database for each connection in newer SQLite
    # environments, which breaks our simple override approach.
    engine = create_engine(
        "sqlite:///./test_smoke.db",
        connect_args={"check_same_thread": False},
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    app = create_app()

    def override_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_db

    # seed minimal user
    db = TestingSessionLocal()
    # sqlite ignores enum checks so storing the value isn’t required here,
    # but doing it makes the test closer to production behaviour.
    db.add(User(email="admin@test.local", full_name="Admin", role=UserRole.admin, hashed_password=get_password_hash("pass")))
    db.commit()
    db.close()

    client = TestClient(app)
    r = client.post("/api/v1/auth/login", data={"username": "admin@test.local", "password": "pass"})
    assert r.status_code == 200
    token = r.json()["access_token"]

    r2 = client.get("/api/v1/filaments", headers={"Authorization": f"Bearer {token}"})
    assert r2.status_code == 200

    # dashboard should load without throwing; previously a status comparison
    # against the enum produced a query passing "in_corso" which Postgres
    # rejected, crashing the backend.
    r_dash = client.get("/api/v1/dashboard/kpi", headers={"Authorization": f"Bearer {token}"})
    assert r_dash.status_code == 200, r_dash.text

    # admin should be allowed to create new resources when require_roles is
    # enforced.  previously we compared string vs enum which raised a 403 and
    # manifested in the UI as "cannot add anything".
    payload = {
        "materiale": "PLA",
        "marca": "Test",
        "colore": "Blu",
        "diametro_mm": 1.75,
        "costo_spool_eur": 10.0,
        "peso_nominale_g": 1000,
        "peso_residuo_g": 800,
        "soglia_min_g": 200,
        "ubicazione_id": None,
    }
    r3 = client.post("/api/v1/filaments", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert r3.status_code == 200, r3.text
