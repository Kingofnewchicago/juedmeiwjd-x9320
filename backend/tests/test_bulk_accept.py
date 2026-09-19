"""
Test suite for bulk accept feature - Admin can accept multiple applications at once
Tests the POST /api/applications/bulk-accept endpoint
"""
import pytest
import requests
import os
import uuid

from dotenv import dotenv_values  # noqa: E402

_base_url = os.environ.get('REACT_APP_BACKEND_URL') or dotenv_values('/app/frontend/.env').get('REACT_APP_BACKEND_URL')
if not _base_url:
    raise RuntimeError('REACT_APP_BACKEND_URL is missing from the environment and /app/frontend/.env')
BASE_URL = _base_url.rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@webora.de"
ADMIN_PASSWORD = "Kp9!xRv2Lq@Zm7Tn4&Q"


class TestBulkAcceptApplications:
    """Test bulk accept endpoint for applications"""
    
    @pytest.fixture(autouse=True)
    def setup(self, request):
        """Setup test - get admin token and create test applications"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        login_response = self.session.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert login_response.status_code == 200, f"Admin login failed: {login_response.text}"
        self.admin_token = login_response.json()["access_token"]
        self.session.headers.update({"Authorization": f"Bearer {self.admin_token}"})
        
        # Track created test applications for cleanup
        self.created_app_ids = []
        
        yield
        
        # Cleanup - delete test applications
        for app_id in self.created_app_ids:
            try:
                self.session.delete(f"{BASE_URL}/api/applications/{app_id}")
            except Exception:
                pass
    
    def create_test_application(self, name_suffix=""):
        """Helper to create a test application with status 'Neu'"""
        unique_id = uuid.uuid4().hex[:8]
        test_email = f"TEST_bulktest_{unique_id}@example.com"
        
        # Submit application (using unauthenticated request)
        app_data = {
            "name": f"TEST_Bulk Test User {name_suffix}",
            "email": test_email,
            "password": "TestPass123!",
            "geburtsdatum": "1990-01-15",
            "mobilnummer": "+491234567890",
            "staatsangehoerigkeit": "Deutsch",
            "strasse": "Teststraße 123",
            "postleitzahl": "12345",
            "stadt": "Berlin",
            "position": "Testkäufer",
            "message": "Test application for bulk accept"
        }
        
        # Remove auth header for application submission
        response = requests.post(
            f"{BASE_URL}/api/applications/submit",
            json=app_data,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Failed to create test app: {response.text}"
        
        app_id = response.json()["id"]
        self.created_app_ids.append(app_id)
        return app_id, test_email
    
    def test_bulk_accept_single_application(self):
        """Test bulk accepting a single application"""
        # Create one test application
        app_id, _ = self.create_test_application("single")
        
        # Bulk accept
        response = self.session.post(
            f"{BASE_URL}/api/applications/bulk-accept",
            json={"application_ids": [app_id]}
        )
        
        assert response.status_code == 200, f"Bulk accept failed: {response.text}"
        
        data = response.json()
        assert data["accepted"] == 1, f"Expected 1 accepted, got {data['accepted']}"
        assert data["failed"] == 0, f"Expected 0 failed, got {data['failed']}"
        assert "message" in data
        
        # Verify application status changed
        app_response = self.session.get(f"{BASE_URL}/api/applications/")
        apps = app_response.json()
        app = next((a for a in apps if a["id"] == app_id), None)
        assert app is not None, "Application not found after bulk accept"
        assert app["status"] == "Akzeptiert", f"Expected 'Akzeptiert', got '{app['status']}'"
    
    def test_bulk_accept_multiple_applications(self):
        """Test bulk accepting multiple applications at once"""
        # Create 3 test applications
        app_ids = []
        for i in range(3):
            app_id, _ = self.create_test_application(f"multi_{i}")
            app_ids.append(app_id)
        
        # Bulk accept all
        response = self.session.post(
            f"{BASE_URL}/api/applications/bulk-accept",
            json={"application_ids": app_ids}
        )
        
        assert response.status_code == 200, f"Bulk accept failed: {response.text}"
        
        data = response.json()
        assert data["accepted"] == 3, f"Expected 3 accepted, got {data['accepted']}"
        assert data["failed"] == 0, f"Expected 0 failed, got {data['failed']}"
        
        # Verify all applications status changed
        app_response = self.session.get(f"{BASE_URL}/api/applications/")
        apps = app_response.json()
        
        for app_id in app_ids:
            app = next((a for a in apps if a["id"] == app_id), None)
            assert app is not None, f"Application {app_id} not found"
            assert app["status"] == "Akzeptiert", f"App {app_id}: Expected 'Akzeptiert', got '{app['status']}'"
    
    def test_bulk_accept_empty_list(self):
        """Test bulk accept with empty list returns error"""
        response = self.session.post(
            f"{BASE_URL}/api/applications/bulk-accept",
            json={"application_ids": []}
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "detail" in response.json()
    
    def test_bulk_accept_nonexistent_application(self):
        """Test bulk accept with non-existent application ID"""
        fake_id = f"app-nonexistent-{uuid.uuid4().hex[:8]}"
        
        response = self.session.post(
            f"{BASE_URL}/api/applications/bulk-accept",
            json={"application_ids": [fake_id]}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["accepted"] == 0, f"Expected 0 accepted, got {data['accepted']}"
        assert data["failed"] == 1, f"Expected 1 failed, got {data['failed']}"
    
    def test_bulk_accept_already_accepted(self):
        """Test bulk accept on already accepted application increments failed count"""
        # Create and accept a test application
        app_id, _ = self.create_test_application("already_accepted")
        
        # First accept it individually
        accept_response = self.session.post(
            f"{BASE_URL}/api/applications/{app_id}/accept"
        )
        assert accept_response.status_code == 200
        
        # Now try bulk accept on same application
        response = self.session.post(
            f"{BASE_URL}/api/applications/bulk-accept",
            json={"application_ids": [app_id]}
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["accepted"] == 0, f"Expected 0 accepted (already accepted), got {data['accepted']}"
        assert data["failed"] == 1, f"Expected 1 failed, got {data['failed']}"
    
    def test_bulk_accept_mixed_statuses(self):
        """Test bulk accept with mix of new and already accepted applications"""
        # Create 2 new applications
        new_app_id1, _ = self.create_test_application("mixed_new1")
        new_app_id2, _ = self.create_test_application("mixed_new2")
        
        # Create and individually accept one
        accepted_app_id, _ = self.create_test_application("mixed_accepted")
        self.session.post(f"{BASE_URL}/api/applications/{accepted_app_id}/accept")
        
        # Bulk accept all 3
        response = self.session.post(
            f"{BASE_URL}/api/applications/bulk-accept",
            json={"application_ids": [new_app_id1, accepted_app_id, new_app_id2]}
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["accepted"] == 2, f"Expected 2 accepted, got {data['accepted']}"
        assert data["failed"] == 1, f"Expected 1 failed (already accepted), got {data['failed']}"
    
    def test_bulk_accept_unauthorized(self):
        """Test bulk accept without authorization fails"""
        # Create test application first
        app_id, _ = self.create_test_application("unauth")
        
        # Try bulk accept without token
        response = requests.post(
            f"{BASE_URL}/api/applications/bulk-accept",
            json={"application_ids": [app_id]},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_bulk_accept_invalid_token(self):
        """Test bulk accept with invalid token fails"""
        response = requests.post(
            f"{BASE_URL}/api/applications/bulk-accept",
            json={"application_ids": ["some-id"]},
            headers={
                "Content-Type": "application/json",
                "Authorization": "Bearer invalid_token_here"
            }
        )
        
        # Accept either 401 or 403 for invalid token
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_bulk_accept_response_structure(self):
        """Test bulk accept returns correct response structure"""
        # Create one test application
        app_id, _ = self.create_test_application("structure")
        
        response = self.session.post(
            f"{BASE_URL}/api/applications/bulk-accept",
            json={"application_ids": [app_id]}
        )
        
        assert response.status_code == 200
        
        data = response.json()
        
        # Validate response structure
        assert "message" in data, "Response missing 'message' field"
        assert "accepted" in data, "Response missing 'accepted' field"
        assert "failed" in data, "Response missing 'failed' field"
        assert isinstance(data["accepted"], int), "'accepted' should be integer"
        assert isinstance(data["failed"], int), "'failed' should be integer"


class TestBulkAcceptWithExistingData:
    """Test bulk accept using existing applications in database"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get admin token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        login_response = self.session.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert login_response.status_code == 200
        self.admin_token = login_response.json()["access_token"]
        self.session.headers.update({"Authorization": f"Bearer {self.admin_token}"})
    
    def test_get_existing_new_applications(self):
        """Test retrieving existing applications with status 'Neu'"""
        response = self.session.get(f"{BASE_URL}/api/applications/")
        
        assert response.status_code == 200
        apps = response.json()
        
        new_apps = [app for app in apps if app["status"] == "Neu"]
        print(f"Found {len(new_apps)} applications with status 'Neu'")
        
        # Just verify we can get the list
        assert isinstance(apps, list)
        
        # Print some details for debugging
        for app in new_apps[:5]:  # First 5
            print(f"  - {app['id']}: {app['name']} ({app['email']})")
    
    def test_bulk_accept_endpoint_availability(self):
        """Verify bulk-accept endpoint is available and responds"""
        # Test with empty body to verify endpoint exists
        response = self.session.post(
            f"{BASE_URL}/api/applications/bulk-accept",
            json={"application_ids": []}
        )
        
        # Endpoint should return 400 for empty list, not 404
        assert response.status_code == 400, f"Endpoint should return 400 for empty list, got {response.status_code}"
        print("Bulk accept endpoint is available and responding correctly")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
