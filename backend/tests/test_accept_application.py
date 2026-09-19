"""
Accept Application Feature Tests
Tests for accepting applications and creating employee accounts
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


class TestAcceptApplicationEndpoint:
    """Tests for POST /api/applications/{id}/accept endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return response.json()["access_token"]
    
    @pytest.fixture
    def new_application(self, admin_token):
        """Create a new test application for acceptance testing"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@testacceptance.com"
        
        app_data = {
            "name": f"Test Accept {uuid.uuid4().hex[:4]}",
            "email": unique_email,
            "mobilnummer": "+49 170 9876543",
            "geburtsdatum": "1992-08-20",
            "staatsangehoerigkeit": "Deutsch",
            "strasse": "Testweg 789",
            "postleitzahl": "20095",
            "stadt": "Hamburg",
            "position": "Junior QA Tester",
            "message": "Test application for acceptance feature"
        }
        
        # Submit application (public endpoint)
        response = requests.post(f"{BASE_URL}/api/applications/submit", json=app_data)
        assert response.status_code == 200, f"Failed to create test application: {response.text}"
        
        created_app = response.json()
        yield created_app
        
        # Cleanup - delete application after test
        requests.delete(f"{BASE_URL}/api/applications/{created_app['id']}", headers={
            "Authorization": f"Bearer {admin_token}"
        })
    
    def test_accept_application_success(self, admin_token, new_application):
        """Test successfully accepting an application and creating employee account"""
        app_id = new_application['id']
        app_email = new_application['email']
        app_name = new_application['name']
        
        # Accept the application
        response = requests.post(
            f"{BASE_URL}/api/applications/{app_id}/accept",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200, f"Accept failed: {response.text}"
        
        data = response.json()
        
        # Verify response structure
        assert "message" in data
        assert "employee" in data
        assert "Mitarbeiter" in data["message"]  # German message
        
        # Verify employee data returned
        employee = data["employee"]
        assert employee["email"] == app_email
        assert employee["name"] == app_name
        assert "password" in employee
        assert len(employee["password"]) >= 12  # Password length check
        assert "employee_number" in employee
        assert employee["employee_number"].startswith("EMP")
        assert employee["position"] == new_application["position"]
        
        print(f"Created employee: {employee['email']} with password: {employee['password']}")
        print(f"Employee number: {employee['employee_number']}")
        
        return employee
    
    def test_accept_updates_application_status(self, admin_token, new_application):
        """Test that accepting updates application status to 'Akzeptiert'"""
        app_id = new_application['id']
        
        # Verify initial status is 'Neu'
        apps_response = requests.get(f"{BASE_URL}/api/applications/", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        app_before = next((a for a in apps_response.json() if a['id'] == app_id), None)
        assert app_before is not None
        assert app_before['status'] == 'Neu'
        
        # Accept the application
        accept_response = requests.post(
            f"{BASE_URL}/api/applications/{app_id}/accept",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert accept_response.status_code == 200
        
        # Verify status changed to 'Akzeptiert'
        apps_response = requests.get(f"{BASE_URL}/api/applications/", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        app_after = next((a for a in apps_response.json() if a['id'] == app_id), None)
        assert app_after is not None
        assert app_after['status'] == 'Akzeptiert', f"Expected 'Akzeptiert', got '{app_after['status']}'"
    
    def test_accept_already_accepted_application_fails(self, admin_token, new_application):
        """Test that accepting an already accepted application returns error"""
        app_id = new_application['id']
        
        # First acceptance should succeed
        response1 = requests.post(
            f"{BASE_URL}/api/applications/{app_id}/accept",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response1.status_code == 200
        
        # Second acceptance should fail
        response2 = requests.post(
            f"{BASE_URL}/api/applications/{app_id}/accept",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response2.status_code == 400, f"Expected 400, got {response2.status_code}"
        assert "bereits" in response2.json()["detail"].lower()  # "already" in German
    
    def test_accept_nonexistent_application(self, admin_token):
        """Test accepting a non-existent application returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/applications/nonexistent-app-id-12345/accept",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 404
    
    def test_accept_without_authorization(self):
        """Test that accept endpoint requires authorization"""
        response = requests.post(
            f"{BASE_URL}/api/applications/some-app-id/accept"
        )
        assert response.status_code == 401


class TestNewEmployeeLogin:
    """Tests for logging in with newly created employee credentials"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture
    def accepted_employee(self, admin_token):
        """Create and accept an application, returning employee credentials"""
        unique_email = f"emp_{uuid.uuid4().hex[:8]}@testlogin.com"
        
        app_data = {
            "name": f"Login Test {uuid.uuid4().hex[:4]}",
            "email": unique_email,
            "mobilnummer": "+49 160 1112223",
            "geburtsdatum": "1988-12-01",
            "staatsangehoerigkeit": "Deutsch",
            "strasse": "Loginstraße 321",
            "postleitzahl": "80331",
            "stadt": "München",
            "position": "Test Engineer",
            "message": "Testing employee login feature"
        }
        
        # Submit application
        submit_resp = requests.post(f"{BASE_URL}/api/applications/submit", json=app_data)
        assert submit_resp.status_code == 200
        app_id = submit_resp.json()['id']
        
        # Accept application
        accept_resp = requests.post(
            f"{BASE_URL}/api/applications/{app_id}/accept",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert accept_resp.status_code == 200
        
        employee = accept_resp.json()['employee']
        yield employee
        
        # Note: We don't cleanup the employee to test login, 
        # but in production there should be an employee delete endpoint
    
    def test_new_employee_can_login(self, accepted_employee):
        """Test that newly created employee can login with generated credentials"""
        email = accepted_employee['email']
        password = accepted_employee['password']
        
        print(f"Testing login with email: {email}, password: {password}")
        
        response = requests.post(f"{BASE_URL}/api/employee/login", json={
            "email": email,
            "password": password
        })
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data
        assert "employee" in data
        assert data["employee"]["email"] == email
        assert data["employee"]["name"] == accepted_employee["name"]
        assert data["employee"]["employee_number"] == accepted_employee["employee_number"]
        
        print(f"Login successful! Employee number: {data['employee']['employee_number']}")
    
    def test_new_employee_can_access_tasks(self, accepted_employee):
        """Test that new employee can access their tasks endpoint"""
        # Login
        login_resp = requests.post(f"{BASE_URL}/api/employee/login", json={
            "email": accepted_employee['email'],
            "password": accepted_employee['password']
        })
        token = login_resp.json()["access_token"]
        
        # Access tasks
        tasks_resp = requests.get(f"{BASE_URL}/api/employee/tasks", headers={
            "Authorization": f"Bearer {token}"
        })
        
        assert tasks_resp.status_code == 200
        # New employee should have empty task list
        assert isinstance(tasks_resp.json(), list)
    
    def test_new_employee_can_access_stats(self, accepted_employee):
        """Test that new employee can access their stats endpoint"""
        # Login
        login_resp = requests.post(f"{BASE_URL}/api/employee/login", json={
            "email": accepted_employee['email'],
            "password": accepted_employee['password']
        })
        token = login_resp.json()["access_token"]
        
        # Access stats
        stats_resp = requests.get(f"{BASE_URL}/api/employee/stats", headers={
            "Authorization": f"Bearer {token}"
        })
        
        assert stats_resp.status_code == 200
        stats = stats_resp.json()
        assert stats["total_tasks"] == 0  # New employee has no tasks
        assert stats["open_tasks"] == 0
        assert stats["in_progress"] == 0
        assert stats["completed"] == 0


class TestExistingApplicationAcceptance:
    """Tests using existing applications in the database"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_applications_with_status(self, admin_token):
        """Test fetching applications and verifying status column data"""
        response = requests.get(f"{BASE_URL}/api/applications/", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        
        assert response.status_code == 200
        apps = response.json()
        
        # Check that applications have status field
        for app in apps:
            assert "status" in app
            assert app["status"] in ["Neu", "Akzeptiert"]
        
        # Count by status
        neu_count = len([a for a in apps if a['status'] == 'Neu'])
        akzeptiert_count = len([a for a in apps if a['status'] == 'Akzeptiert'])
        
        print(f"Found {len(apps)} applications: {neu_count} Neu, {akzeptiert_count} Akzeptiert")
    
    def test_verify_lisa_testerin_already_accepted(self, admin_token):
        """Verify that Lisa Testerin's application is already accepted"""
        response = requests.get(f"{BASE_URL}/api/applications/", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        
        apps = response.json()
        lisa_app = next((a for a in apps if a['name'] == 'Lisa Testerin'), None)
        
        if lisa_app:
            assert lisa_app['status'] == 'Akzeptiert', f"Lisa's status: {lisa_app['status']}"
            print(f"Verified: Lisa Testerin's application is Akzeptiert")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
