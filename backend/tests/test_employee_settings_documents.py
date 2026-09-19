"""
Tests for P1: Admin unlock verifications and P2: Employee settings and documents endpoints

P1: Admin can unlock verified users (status: Verifiziert -> Freigeschaltet)
P2: Employee profile, password change, notifications, and documents endpoints
"""

import pytest
import requests
import os
import json
from datetime import datetime

from dotenv import dotenv_values  # noqa: E402

_base_url = os.environ.get('REACT_APP_BACKEND_URL') or dotenv_values('/app/frontend/.env').get('REACT_APP_BACKEND_URL')
if not _base_url:
    raise RuntimeError('REACT_APP_BACKEND_URL is missing from the environment and /app/frontend/.env')
BASE_URL = _base_url.rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@webora.de"
ADMIN_PASSWORD = "Kp9!xRv2Lq@Zm7Tn4&Q"
EMPLOYEE_EMAIL = "mitarbeiter@precision-labs.de"
EMPLOYEE_PASSWORD = "Mitarbeiter123!"


class TestAdminLogin:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin can login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["admin"]["email"] == ADMIN_EMAIL


class TestEmployeeLogin:
    """Employee authentication tests"""
    
    def test_employee_login_success(self):
        """Test employee can login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/employee/login", json={
            "email": EMPLOYEE_EMAIL,
            "password": EMPLOYEE_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["employee"]["email"] == EMPLOYEE_EMAIL


class TestEmployeeProfile:
    """Tests for GET/PUT /api/employee/profile endpoints"""
    
    @pytest.fixture
    def employee_token(self):
        """Get employee auth token"""
        response = requests.post(f"{BASE_URL}/api/employee/login", json={
            "email": EMPLOYEE_EMAIL,
            "password": EMPLOYEE_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Employee login failed")
        return response.json().get("access_token")
    
    def test_get_profile(self, employee_token):
        """Test GET /api/employee/profile returns profile data"""
        response = requests.get(
            f"{BASE_URL}/api/employee/profile",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify profile fields
        assert "id" in data
        assert "email" in data
        assert "name" in data
        assert "position" in data
        assert "notifications" in data
        assert data["email"] == EMPLOYEE_EMAIL
    
    def test_update_profile(self, employee_token):
        """Test PUT /api/employee/profile updates profile"""
        test_phone = f"+49 170 {datetime.now().strftime('%H%M%S')}"
        test_address = f"Test Straße {datetime.now().second}, 10115 Berlin"
        
        # Update profile
        response = requests.put(
            f"{BASE_URL}/api/employee/profile",
            headers={"Authorization": f"Bearer {employee_token}"},
            json={"phone": test_phone, "address": test_address}
        )
        assert response.status_code == 200
        assert response.json()["message"] == "Profil aktualisiert"
        
        # Verify update persisted
        get_response = requests.get(
            f"{BASE_URL}/api/employee/profile",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["phone"] == test_phone
        assert data["address"] == test_address
    
    def test_profile_unauthorized(self):
        """Test profile endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/employee/profile")
        assert response.status_code in [401, 422]


class TestEmployeePasswordChange:
    """Tests for POST /api/employee/change-password endpoint"""
    
    @pytest.fixture
    def employee_token(self):
        """Get employee auth token"""
        response = requests.post(f"{BASE_URL}/api/employee/login", json={
            "email": EMPLOYEE_EMAIL,
            "password": EMPLOYEE_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Employee login failed")
        return response.json().get("access_token")
    
    def test_change_password_wrong_current(self, employee_token):
        """Test change password fails with wrong current password"""
        response = requests.post(
            f"{BASE_URL}/api/employee/change-password",
            headers={"Authorization": f"Bearer {employee_token}"},
            json={
                "current_password": "WrongPassword123!",
                "new_password": "NewPassword123!"
            }
        )
        assert response.status_code == 400
        assert "falsch" in response.json()["detail"].lower()
    
    def test_change_password_too_short(self, employee_token):
        """Test change password fails with short new password"""
        response = requests.post(
            f"{BASE_URL}/api/employee/change-password",
            headers={"Authorization": f"Bearer {employee_token}"},
            json={
                "current_password": EMPLOYEE_PASSWORD,
                "new_password": "short"
            }
        )
        assert response.status_code == 400
        assert "8 zeichen" in response.json()["detail"].lower()


class TestEmployeeNotifications:
    """Tests for PUT /api/employee/notifications endpoint"""
    
    @pytest.fixture
    def employee_token(self):
        """Get employee auth token"""
        response = requests.post(f"{BASE_URL}/api/employee/login", json={
            "email": EMPLOYEE_EMAIL,
            "password": EMPLOYEE_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Employee login failed")
        return response.json().get("access_token")
    
    def test_update_notifications(self, employee_token):
        """Test PUT /api/employee/notifications updates settings"""
        response = requests.put(
            f"{BASE_URL}/api/employee/notifications",
            headers={"Authorization": f"Bearer {employee_token}"},
            json={
                "email_notifications": False,
                "task_reminders": True,
                "payout_notifications": False
            }
        )
        assert response.status_code == 200
        assert response.json()["message"] == "Einstellungen gespeichert"
        
        # Verify changes persisted
        get_response = requests.get(
            f"{BASE_URL}/api/employee/profile",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        data = get_response.json()
        assert data["notifications"]["email_notifications"] == False
        assert data["notifications"]["task_reminders"] == True


class TestEmployeeDocuments:
    """Tests for GET /api/employee/documents endpoint"""
    
    @pytest.fixture
    def employee_token(self):
        """Get employee auth token"""
        response = requests.post(f"{BASE_URL}/api/employee/login", json={
            "email": EMPLOYEE_EMAIL,
            "password": EMPLOYEE_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Employee login failed")
        return response.json().get("access_token")
    
    def test_get_documents(self, employee_token):
        """Test GET /api/employee/documents returns documents list"""
        response = requests.get(
            f"{BASE_URL}/api/employee/documents",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should be a list
        assert isinstance(data, list)
        
        # Should have signed contracts (2 from previous tests)
        assert len(data) >= 2
        
        # Verify document structure
        for doc in data:
            assert "id" in doc
            assert "name" in doc
            assert "category" in doc
            assert "status" in doc
    
    def test_documents_include_signed_contracts(self, employee_token):
        """Test documents include signed contracts"""
        response = requests.get(
            f"{BASE_URL}/api/employee/documents",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Find contracts
        contracts = [d for d in data if d.get("is_contract") == True]
        assert len(contracts) >= 1, "Should have at least one signed contract"
        
        for contract in contracts:
            assert contract["category"] == "Verträge"
            assert contract["status"] == "approved"
            assert "Arbeitsvertrag" in contract["name"]


class TestEmployeeDocumentDownload:
    """Tests for GET /api/employee/documents/{id}/download endpoint"""
    
    @pytest.fixture
    def employee_token(self):
        """Get employee auth token"""
        response = requests.post(f"{BASE_URL}/api/employee/login", json={
            "email": EMPLOYEE_EMAIL,
            "password": EMPLOYEE_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Employee login failed")
        return response.json().get("access_token")
    
    def test_download_contract(self, employee_token):
        """Test downloading a signed contract"""
        # Get documents first
        docs_response = requests.get(
            f"{BASE_URL}/api/employee/documents",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert docs_response.status_code == 200
        docs = docs_response.json()
        
        # Find a contract
        contracts = [d for d in docs if d.get("is_contract") == True]
        if not contracts:
            pytest.skip("No contracts available for download test")
        
        contract = contracts[0]
        
        # Download the contract
        response = requests.get(
            f"{BASE_URL}/api/employee/documents/{contract['id']}/download",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert response.status_code == 200
        assert "application/pdf" in response.headers.get("content-type", "")
        assert len(response.content) > 0  # Has content
    
    def test_download_nonexistent(self, employee_token):
        """Test downloading non-existent document returns 404"""
        response = requests.get(
            f"{BASE_URL}/api/employee/documents/nonexistent-doc-id/download",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert response.status_code == 404


class TestAdminUnlockVerification:
    """Tests for P1: Admin unlock verified applicants"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json().get("access_token")
    
    def test_get_applications(self, admin_token):
        """Test admin can get all applications"""
        response = requests.get(
            f"{BASE_URL}/api/applications/",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_unlock_endpoint_exists(self, admin_token):
        """Test unlock endpoint exists and validates status"""
        # Get an application that is NOT in Verifiziert status
        apps_response = requests.get(
            f"{BASE_URL}/api/applications/",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        apps = apps_response.json()
        
        # Find an accepted (not verified) application
        accepted = next((a for a in apps if a["status"] == "Akzeptiert"), None)
        if not accepted:
            pytest.skip("No accepted application to test unlock validation")
        
        # Try to unlock - should fail because not verified
        response = requests.post(
            f"{BASE_URL}/api/applications/{accepted['id']}/unlock",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 400
        assert "verifiziert" in response.json()["detail"].lower()
    
    def test_unlock_requires_auth(self):
        """Test unlock endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/applications/test-id/unlock")
        assert response.status_code in [401, 422]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
