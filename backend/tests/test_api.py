import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import engine, Base
from app.seed import seed_database

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

def test_health():
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "FloraAI"

def test_auth_workflow_and_plants():
    with TestClient(app) as client:
        # 1. Register new user
        user_payload = {
            "full_name": "Rosalind Franklin",
            "email": "rosalind@botany.org",
            "password": "StrongPassword123!",
            "terms_accepted": True
        }
        reg_res = client.post("/api/auth/register", json=user_payload)
        assert reg_res.status_code in [201, 400]

        # 2. Login
        login_res = client.post("/api/auth/login", json={
            "email": "rosalind@botany.org",
            "password": "StrongPassword123!"
        })
        assert login_res.status_code == 200
        token_data = login_res.json()
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Get profile
        me_res = client.get("/api/auth/me", headers=headers)
        assert me_res.status_code == 200
        assert me_res.json()["email"] == "rosalind@botany.org"

        # 4. Create a plant
        plant_data = {
            "common_name": "Calathea Orbifolia",
            "scientific_name": "Goeppertia orbifolia",
            "category": "Indoor",
            "location": "Office Desk",
            "environment": "indoor",
            "health_status": "healthy",
            "care_preferences": {
                "light": "Medium indirect light",
                "watering_frequency_days": 5,
                "fertilizing_frequency_days": 30
            },
            "notes": "Loves humidity and distilled water."
        }
        plant_res = client.post("/api/plants", json=plant_data, headers=headers)
        assert plant_res.status_code == 201
        created_plant = plant_res.json()
        plant_id = created_plant["id"]
        assert created_plant["common_name"] == "Calathea Orbifolia"

        # 5. List plants
        list_res = client.get("/api/plants", headers=headers)
        assert list_res.status_code == 200
        assert any(p["id"] == plant_id for p in list_res.json())

        # 6. Verify auto-generated reminders
        reminders_res = client.get("/api/reminders", headers=headers)
        assert reminders_res.status_code == 200
        user_reminders = reminders_res.json()
        assert len(user_reminders) >= 1

        # 7. Complete first reminder
        first_rem = user_reminders[0]
        comp_res = client.post(f"/api/reminders/{first_rem['id']}/complete", headers=headers)
        assert comp_res.status_code == 200
        assert comp_res.json()["status"] == "completed"

        # 8. Check dashboard stats
        stats_res = client.get("/api/dashboard/stats", headers=headers)
        assert stats_res.status_code == 200
        stats = stats_res.json()
        assert stats["total_plants"] >= 1
        assert "seasonal_tip" in stats

        # 9. Test Articles Learning Center
        articles_res = client.get("/api/articles")
        assert articles_res.status_code == 200
        assert len(articles_res.json()) > 0

        # 10. Test AI Chat
        chat_res = client.post("/api/chat", json={
            "message": "Why are my Calathea leaves curling?",
            "plant_id": plant_id
        }, headers=headers)
        assert chat_res.status_code == 200
        assert len(chat_res.json()["content"]) > 10
