"""
Test Email Inbox Feature - Admin management and Employee email codes API
Tests for Outlook email integration similar to Anosim SMS feature
"""
import pytest
import requests
import os
import time

from dotenv import dotenv_values  # noqa: E402

_base_url = os.environ.get('REACT_APP_BACKEND_URL') or dotenv_values('/app/frontend/.env').get('REACT_APP_BACKEND_URL')
if not _base_url:
    raise RuntimeError('REACT_APP_BACKEND_URL is missing from the environment and /app/frontend/.env')
BASE_URL = _base_url.rstrip('/')

# Admin credentials
ADMIN_EMAIL = "admin@webora.de"
ADMIN_PASSWORD = "Kp9!xRv2Lq@Zm7Tn4&Q"


class TestEmailInboxAdminAuth:
    """Test admin authentication for email inbox endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_get_accounts_requires_auth(self):
        """Test that /api/email-inbox/accounts requires authentication"""
        response = requests.get(f"{BASE_URL}/api/email-inbox/accounts")
        assert response.status_code == 422 or response.status_code == 401, \
            f"Expected 422/401 without auth, got {response.status_code}"
        print("PASS: /api/email-inbox/accounts requires authentication")
    
    def test_get_accounts_with_valid_auth(self, admin_token):
        """Test that /api/email-inbox/accounts works with valid admin token"""
        response = requests.get(
            f"{BASE_URL}/api/email-inbox/accounts",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "accounts" in data, "Response should contain 'accounts' key"
        assert isinstance(data["accounts"], list), "Accounts should be a list"
        print(f"PASS: /api/email-inbox/accounts returns {len(data['accounts'])} accounts")
    
    def test_get_stats_requires_auth(self):
        """Test that /api/email-inbox/stats requires authentication"""
        response = requests.get(f"{BASE_URL}/api/email-inbox/stats")
        assert response.status_code == 422 or response.status_code == 401, \
            f"Expected 422/401 without auth, got {response.status_code}"
        print("PASS: /api/email-inbox/stats requires authentication")
    
    def test_get_stats_with_valid_auth(self, admin_token):
        """Test that /api/email-inbox/stats returns proper structure"""
        response = requests.get(
            f"{BASE_URL}/api/email-inbox/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify stats structure
        assert "total" in data, "Stats should contain 'total'"
        assert "assigned" in data, "Stats should contain 'assigned'"
        assert "available" in data, "Stats should contain 'available'"
        
        assert isinstance(data["total"], int), "total should be integer"
        assert isinstance(data["assigned"], int), "assigned should be integer"
        assert isinstance(data["available"], int), "available should be integer"
        
        # Verify math: available = total - assigned
        assert data["available"] == data["total"] - data["assigned"], \
            "available should equal total - assigned"
        
        print(f"PASS: /api/email-inbox/stats returns total={data['total']}, assigned={data['assigned']}, available={data['available']}")


class TestEmailInboxAddAccount:
    """Test adding email accounts (validation without real IMAP connection)"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_add_account_requires_auth(self):
        """Test that adding account requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/email-inbox/accounts",
            json={"email": "test@outlook.com", "app_password": "test123"}
        )
        assert response.status_code in [401, 422], \
            f"Expected 401/422 without auth, got {response.status_code}"
        print("PASS: POST /api/email-inbox/accounts requires authentication")
    
    def test_add_account_validates_email_format(self, admin_token):
        """Test that email format is validated"""
        response = requests.post(
            f"{BASE_URL}/api/email-inbox/accounts",
            json={"email": "invalid-email", "app_password": "test123"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 422, \
            f"Expected 422 for invalid email, got {response.status_code}"
        print("PASS: Invalid email format is rejected")
    
    def test_add_account_requires_password(self, admin_token):
        """Test that app_password is required"""
        response = requests.post(
            f"{BASE_URL}/api/email-inbox/accounts",
            json={"email": "test@outlook.com"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 422, \
            f"Expected 422 for missing password, got {response.status_code}"
        print("PASS: app_password is required")
    
    def test_add_account_invalid_credentials(self, admin_token):
        """Test that invalid Outlook credentials are rejected"""
        # This should fail because we don't have valid Outlook credentials
        response = requests.post(
            f"{BASE_URL}/api/email-inbox/accounts",
            json={
                "email": "fake.test.email@outlook.com",
                "app_password": "invalid-password-12345",
                "description": "Test account"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        # Should return 400 because IMAP connection will fail
        assert response.status_code == 400, \
            f"Expected 400 for invalid credentials, got {response.status_code}"
        
        data = response.json()
        assert "detail" in data, "Response should contain error detail"
        print(f"PASS: Invalid credentials rejected with message: {data.get('detail', 'N/A')}")


class TestEmailInboxAssignment:
    """Test email account assignment to employees"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_assign_requires_auth(self):
        """Test that assign endpoint requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/email-inbox/assign",
            json={"email_account_id": "test", "employee_id": "test"}
        )
        assert response.status_code in [401, 422], \
            f"Expected 401/422 without auth, got {response.status_code}"
        print("PASS: POST /api/email-inbox/assign requires authentication")
    
    def test_assign_nonexistent_account(self, admin_token):
        """Test assigning non-existent email account"""
        response = requests.post(
            f"{BASE_URL}/api/email-inbox/assign",
            json={
                "email_account_id": "nonexistent-account-123",
                "employee_id": "some-employee-id"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 404, \
            f"Expected 404 for non-existent account, got {response.status_code}"
        print("PASS: Non-existent email account returns 404")
    
    def test_unassign_nonexistent_account(self, admin_token):
        """Test unassigning non-existent email account"""
        response = requests.post(
            f"{BASE_URL}/api/email-inbox/unassign/nonexistent-account-123",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 404, \
            f"Expected 404 for non-existent account, got {response.status_code}"
        print("PASS: Unassign non-existent account returns 404")


class TestEmailInboxDeleteAccount:
    """Test deleting email accounts"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_delete_requires_auth(self):
        """Test that delete endpoint requires authentication"""
        response = requests.delete(f"{BASE_URL}/api/email-inbox/accounts/test-id")
        assert response.status_code in [401, 422], \
            f"Expected 401/422 without auth, got {response.status_code}"
        print("PASS: DELETE /api/email-inbox/accounts requires authentication")
    
    def test_delete_nonexistent_account(self, admin_token):
        """Test deleting non-existent account"""
        response = requests.delete(
            f"{BASE_URL}/api/email-inbox/accounts/nonexistent-account-123",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 404, \
            f"Expected 404 for non-existent account, got {response.status_code}"
        print("PASS: Delete non-existent account returns 404")


class TestEmailInboxTestConnection:
    """Test connection testing endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_connection_test_requires_auth(self):
        """Test that test connection endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/email-inbox/test/test-id")
        assert response.status_code in [401, 422], \
            f"Expected 401/422 without auth, got {response.status_code}"
        print("PASS: GET /api/email-inbox/test requires authentication")
    
    def test_connection_test_nonexistent_account(self, admin_token):
        """Test connection for non-existent account"""
        response = requests.get(
            f"{BASE_URL}/api/email-inbox/test/nonexistent-account-123",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 404, \
            f"Expected 404 for non-existent account, got {response.status_code}"
        print("PASS: Test connection non-existent account returns 404")


class TestEmployeeEmailCodes:
    """Test employee email codes endpoint"""
    
    @pytest.fixture
    def employee_token(self):
        """Get employee authentication token by creating/logging in a test user"""
        # First try to login with existing test employee
        test_email = "test.employee.email@test.de"
        test_password = "TestPass123"
        
        login_response = requests.post(
            f"{BASE_URL}/api/applications/login",
            json={"email": test_email, "password": test_password}
        )
        
        if login_response.status_code == 200:
            return login_response.json().get("token")
        
        # Try mitarbeiter login
        login_response = requests.post(
            f"{BASE_URL}/api/mitarbeiter/login",
            json={"email": test_email, "password": test_password}
        )
        
        if login_response.status_code == 200:
            return login_response.json().get("token")
        
        pytest.skip("Employee authentication failed - no test employee available")
    
    def test_my_codes_requires_auth(self):
        """Test that /api/email-inbox/my-codes requires employee authentication"""
        response = requests.get(f"{BASE_URL}/api/email-inbox/my-codes")
        assert response.status_code in [401, 422], \
            f"Expected 401/422 without auth, got {response.status_code}"
        print("PASS: /api/email-inbox/my-codes requires authentication")
    
    def test_my_codes_with_admin_token(self):
        """Test that admin token doesn't work for employee endpoint"""
        # Get admin token
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        
        admin_token = response.json().get("token")
        
        # Try to access employee endpoint with admin token
        response = requests.get(
            f"{BASE_URL}/api/email-inbox/my-codes",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        # This should fail because admin is not in applications collection
        assert response.status_code == 401, \
            f"Admin token should not work for employee endpoint, got {response.status_code}"
        print("PASS: Admin token correctly rejected for employee endpoint")


class TestEmailInboxEndpointStructure:
    """Test API endpoint structure and response format"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_accounts_response_structure(self, admin_token):
        """Verify accounts endpoint response structure"""
        response = requests.get(
            f"{BASE_URL}/api/email-inbox/accounts",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check main structure
        assert isinstance(data, dict), "Response should be a dict"
        assert "accounts" in data, "Response should contain 'accounts'"
        
        # If there are accounts, check their structure
        if data["accounts"]:
            account = data["accounts"][0]
            # Should have these fields
            expected_fields = ["id", "email", "is_active"]
            for field in expected_fields:
                assert field in account, f"Account should have '{field}' field"
            
            # Should NOT have app_password (security)
            assert "app_password" not in account, "Account should not expose app_password"
        
        print("PASS: Accounts response structure is correct")
    
    def test_stats_response_structure(self, admin_token):
        """Verify stats endpoint response structure"""
        response = requests.get(
            f"{BASE_URL}/api/email-inbox/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check structure
        required_fields = ["total", "assigned", "available"]
        for field in required_fields:
            assert field in data, f"Stats should contain '{field}'"
            assert isinstance(data[field], int), f"'{field}' should be an integer"
        
        print("PASS: Stats response structure is correct")
    
    def test_admin_can_get_employees_list(self, admin_token):
        """Verify admin can get employees list (for assignment modal)"""
        response = requests.get(
            f"{BASE_URL}/api/admin/employees",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, \
            f"Expected 200 for employees list, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Employees response should be a list"
        print(f"PASS: Admin can get employees list ({len(data)} employees found)")
