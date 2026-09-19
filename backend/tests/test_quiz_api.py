"""
Test Quiz API Endpoints
- POST /api/quiz/submit - submit quiz answers (requires employee auth)
- GET /api/quiz/status - check if quiz completed (requires employee auth)
- GET /api/quiz/admin/{applicant_id} - admin get quiz answers
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

from dotenv import dotenv_values  # noqa: E402

_base_url = os.environ.get('REACT_APP_BACKEND_URL') or dotenv_values('/app/frontend/.env').get('REACT_APP_BACKEND_URL')
if not _base_url:
    raise RuntimeError('REACT_APP_BACKEND_URL is missing from the environment and /app/frontend/.env')
BASE_URL = _base_url.rstrip('/')

# Admin credentials
ADMIN_EMAIL = "admin@webora.de"
ADMIN_PASSWORD = "Kp9!xRv2Lq@Zm7Tn4&Q"

# Test applicant password
TEST_PASSWORD = "TestQuiz123!"


class TestQuizAPI:
    """Quiz API endpoint tests"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return response.json().get("access_token")
    
    @pytest.fixture(scope="class")
    def test_applicant(self, admin_token):
        """Create a test applicant and accept them to get employee token"""
        unique_id = str(uuid.uuid4())[:8]
        
        # Create application with password
        app_data = {
            "name": f"TEST_Quiz_User_{unique_id}",
            "email": f"test_quiz_{unique_id}@example.com",
            "password": TEST_PASSWORD,
            "mobilnummer": "+491234567890",
            "geburtsdatum": "1990-01-15",
            "staatsangehoerigkeit": "Deutsch",
            "strasse": "Teststraße 123",
            "postleitzahl": "12345",
            "stadt": "Berlin",
            "position": "Web Application Tester",
            "message": "Test application for quiz testing"
        }
        
        response = requests.post(f"{BASE_URL}/api/applications/submit", json=app_data)
        assert response.status_code == 200, f"Application submit failed: {response.text}"
        applicant_id = response.json().get("id")
        
        # Accept the application
        response = requests.post(
            f"{BASE_URL}/api/applications/{applicant_id}/accept",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Accept application failed: {response.text}"
        
        # Login as applicant using applications/login endpoint
        response = requests.post(f"{BASE_URL}/api/applications/login", json={
            "email": app_data["email"],
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Applicant login failed: {response.text}"
        applicant_token = response.json().get("access_token")
        
        return {
            "id": applicant_id,
            "email": app_data["email"],
            "name": app_data["name"],
            "token": applicant_token
        }
    
    def test_quiz_status_before_completion(self, test_applicant):
        """Test quiz status returns false before quiz is completed"""
        response = requests.get(
            f"{BASE_URL}/api/quiz/status",
            headers={"Authorization": f"Bearer {test_applicant['token']}"}
        )
        assert response.status_code == 200, f"Quiz status failed: {response.text}"
        data = response.json()
        assert "quiz_completed" in data
        assert data["quiz_completed"] == False
        print(f"Quiz status before completion: {data}")
    
    def test_quiz_status_without_auth(self):
        """Test quiz status returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/quiz/status")
        assert response.status_code == 401
        print("Quiz status without auth correctly returns 401")
    
    def test_quiz_submit_without_auth(self):
        """Test quiz submit returns 401 without auth"""
        response = requests.post(f"{BASE_URL}/api/quiz/submit", json={
            "answers": [{"question_id": 1, "answer": "Ja"}]
        })
        assert response.status_code == 401
        print("Quiz submit without auth correctly returns 401")
    
    def test_quiz_submit_success(self, test_applicant):
        """Test submitting quiz answers successfully"""
        # Prepare all 15 quiz answers
        quiz_answers = [
            {"question_id": 1, "answer": "Ja"},  # Deutscher Staatsbürger
            {"question_id": 2, "answer": "Ja"},  # Gültiger Ausweis
            {"question_id": 3, "answer": "Ja"},  # 18+ Jahre
            {"question_id": 4, "answer": "Bestätigt"},  # Info verstanden
            {"question_id": 5, "answer": "Ja, ich bin einverstanden mit echtem Ausweis"},  # Text answer
            {"question_id": 6, "answer": "Ja"},  # Smartphone mit Kamera
            {"question_id": 7, "answer": "Ja"},  # Stabile Internetverbindung
            {"question_id": 8, "answer": "Ja"},  # 5 Stunden/Woche
            {"question_id": 9, "answer": "Ja"},  # Minijob bewusst
            {"question_id": 10, "answer": "Ja"},  # Deutsches Bankkonto
            {"question_id": 11, "answer": "Bestätigt"},  # Homeoffice Info
            {"question_id": 12, "answer": "Ja"},  # Vertraulichkeit
            {"question_id": 13, "answer": "Ja"},  # Selbstständiges Arbeiten
            {"question_id": 14, "answer": "Etwas Erfahrung"},  # Testing Erfahrung
            {"question_id": 15, "answer": "Keine Fragen"},  # Optional Fragen
        ]
        
        response = requests.post(
            f"{BASE_URL}/api/quiz/submit",
            json={"answers": quiz_answers},
            headers={"Authorization": f"Bearer {test_applicant['token']}"}
        )
        assert response.status_code == 200, f"Quiz submit failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "message" in data
        print(f"Quiz submit response: {data}")
    
    def test_quiz_status_after_completion(self, test_applicant):
        """Test quiz status returns true after quiz is completed"""
        response = requests.get(
            f"{BASE_URL}/api/quiz/status",
            headers={"Authorization": f"Bearer {test_applicant['token']}"}
        )
        assert response.status_code == 200, f"Quiz status failed: {response.text}"
        data = response.json()
        assert data["quiz_completed"] == True
        assert "quiz_completed_at" in data
        print(f"Quiz status after completion: {data}")
    
    def test_admin_get_quiz_answers(self, admin_token, test_applicant):
        """Test admin can retrieve quiz answers for an applicant"""
        response = requests.get(
            f"{BASE_URL}/api/quiz/admin/{test_applicant['id']}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Admin get quiz failed: {response.text}"
        data = response.json()
        assert data.get("completed") == True
        assert "answers" in data
        assert len(data["answers"]) == 15
        
        # Verify answer structure
        for answer in data["answers"]:
            assert "question_id" in answer
            assert "answer" in answer
        
        print(f"Admin quiz answers retrieved: {len(data['answers'])} answers")
    
    def test_admin_get_quiz_without_auth(self, test_applicant):
        """Test admin quiz endpoint returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/quiz/admin/{test_applicant['id']}")
        assert response.status_code == 401
        print("Admin quiz endpoint without auth correctly returns 401")
    
    def test_admin_get_quiz_with_employee_token(self, test_applicant):
        """Test admin quiz endpoint returns 403 with employee token"""
        response = requests.get(
            f"{BASE_URL}/api/quiz/admin/{test_applicant['id']}",
            headers={"Authorization": f"Bearer {test_applicant['token']}"}
        )
        assert response.status_code == 403
        print("Admin quiz endpoint with employee token correctly returns 403")
    
    def test_admin_get_quiz_nonexistent_applicant(self, admin_token):
        """Test admin quiz endpoint returns empty for non-existent applicant"""
        response = requests.get(
            f"{BASE_URL}/api/quiz/admin/nonexistent-id-12345",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("completed") == False
        assert data.get("answers") == []
        print("Admin quiz for non-existent applicant returns empty correctly")


class TestQuizResubmission:
    """Test quiz can be resubmitted (upsert behavior)"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json().get("access_token")
    
    @pytest.fixture(scope="class")
    def test_applicant_resubmit(self, admin_token):
        """Create a test applicant for resubmission test"""
        unique_id = str(uuid.uuid4())[:8]
        
        app_data = {
            "name": f"TEST_Quiz_Resubmit_{unique_id}",
            "email": f"test_quiz_resubmit_{unique_id}@example.com",
            "password": TEST_PASSWORD,
            "mobilnummer": "+491234567891",
            "geburtsdatum": "1992-05-20",
            "staatsangehoerigkeit": "Deutsch",
            "strasse": "Resubmitstraße 456",
            "postleitzahl": "54321",
            "stadt": "München",
            "position": "Web Application Tester",
            "message": "Test for quiz resubmission"
        }
        
        response = requests.post(f"{BASE_URL}/api/applications/submit", json=app_data)
        assert response.status_code == 200
        applicant_id = response.json().get("id")
        
        response = requests.post(
            f"{BASE_URL}/api/applications/{applicant_id}/accept",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        response = requests.post(f"{BASE_URL}/api/applications/login", json={
            "email": app_data["email"],
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        
        return {
            "id": applicant_id,
            "token": response.json().get("access_token")
        }
    
    def test_quiz_resubmission_updates_answers(self, admin_token, test_applicant_resubmit):
        """Test that resubmitting quiz updates the answers"""
        # First submission
        first_answers = [{"question_id": i, "answer": "Ja"} for i in range(1, 16)]
        response = requests.post(
            f"{BASE_URL}/api/quiz/submit",
            json={"answers": first_answers},
            headers={"Authorization": f"Bearer {test_applicant_resubmit['token']}"}
        )
        assert response.status_code == 200
        
        # Second submission with different answers
        second_answers = [{"question_id": i, "answer": "Nein"} for i in range(1, 16)]
        response = requests.post(
            f"{BASE_URL}/api/quiz/submit",
            json={"answers": second_answers},
            headers={"Authorization": f"Bearer {test_applicant_resubmit['token']}"}
        )
        assert response.status_code == 200
        
        # Verify admin sees updated answers
        response = requests.get(
            f"{BASE_URL}/api/quiz/admin/{test_applicant_resubmit['id']}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check that answers are "Nein" (from second submission)
        for answer in data["answers"]:
            assert answer["answer"] == "Nein", f"Answer for question {answer['question_id']} should be 'Nein'"
        
        print("Quiz resubmission correctly updates answers")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
