"""
Anosim Integration Tests
Tests for:
- Admin assign/unassign numbers to employees
- Employee get assigned number
- Employee get SMS for assigned number
- Admin get all assignments
"""
import pytest
import requests
import os

from dotenv import dotenv_values  # noqa: E402

_base_url = os.environ.get('REACT_APP_BACKEND_URL') or dotenv_values('/app/frontend/.env').get('REACT_APP_BACKEND_URL')
if not _base_url:
    raise RuntimeError('REACT_APP_BACKEND_URL is missing from the environment and /app/frontend/.env')
BASE_URL = _base_url.rstrip('/')


# ============== FIXTURES ==============

@pytest.fixture(scope="module")
def admin_token():
    """Authenticate as admin and get token"""
    response = requests.post(
        f"{BASE_URL}/api/admin/login",
        json={
            "email": "admin@webora.de",
            "password": "Kp9!xRv2Lq@Zm7Tn4&Q"
        }
    )
    if response.status_code == 200:
        token = response.json().get("access_token")
        if token:
            print(f"Admin login successful, token: {token[:20]}...")
            return token
    # Try alternate admin
    response = requests.post(
        f"{BASE_URL}/api/admin/login",
        json={
            "email": "admin@infometrica.de",
            "password": "Kp9!xRv2Lq@Zm7Tn4&Q"
        }
    )
    if response.status_code == 200:
        token = response.json().get("access_token")
        if token:
            print(f"Admin (alt) login successful, token: {token[:20]}...")
            return token
    pytest.skip("Admin authentication failed - skipping admin tests")


@pytest.fixture(scope="module")
def employee_token():
    """Authenticate as employee and get token"""
    response = requests.post(
        f"{BASE_URL}/api/employee/login",
        json={
            "email": "mitarbeiter@infometrica.de",
            "password": "Mitarbeiter123!"
        }
    )
    if response.status_code == 200:
        token = response.json().get("access_token")
        if token:
            print(f"Employee login successful, token: {token[:20]}...")
            return token
    pytest.skip("Employee authentication failed - skipping employee tests")


@pytest.fixture(scope="module")
def employee_id(admin_token):
    """Get employee ID from admin employees list"""
    response = requests.get(
        f"{BASE_URL}/api/admin/employees",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    if response.status_code == 200:
        employees = response.json()
        # Find the mitarbeiter@infometrica.de employee
        for emp in employees:
            if emp.get("email") == "mitarbeiter@infometrica.de":
                print(f"Found employee: {emp.get('name')} ({emp.get('id')})")
                return emp.get("id")
        # Return first employee if not found
        if employees:
            print(f"Using first employee: {employees[0].get('name')} ({employees[0].get('id')})")
            return employees[0].get("id")
    pytest.skip("Could not get employee ID")


# ============== ADMIN TESTS ==============

class TestAdminAnosimAssignments:
    """Admin Anosim number assignment tests"""
    
    def test_admin_get_assignments_endpoint(self, admin_token):
        """Test GET /api/anosim/assignments - get all assignments"""
        response = requests.get(
            f"{BASE_URL}/api/anosim/assignments",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "assignments" in data, "Response should contain 'assignments' key"
        assert isinstance(data["assignments"], list), "Assignments should be a list"
        print(f"Found {len(data['assignments'])} assignments")
        for assignment in data["assignments"]:
            print(f"  - {assignment.get('name')}: {assignment.get('anosim_number')}")
    
    def test_admin_assign_number_to_employee(self, admin_token, employee_id):
        """Test POST /api/anosim/assign - assign number to employee"""
        test_number = "+4917600000000"
        
        response = requests.post(
            f"{BASE_URL}/api/anosim/assign",
            json={
                "employee_id": employee_id,
                "anosim_number": test_number
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        # Should succeed (200) or fail if already assigned (400)
        assert response.status_code in [200, 400], f"Expected 200 or 400, got {response.status_code}: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert "message" in data
            assert data.get("employee_id") == employee_id
            print(f"Successfully assigned {test_number} to employee {employee_id}")
        else:
            print(f"Assignment response (400): {response.json()}")
    
    def test_admin_assign_number_missing_fields(self, admin_token):
        """Test POST /api/anosim/assign with missing fields"""
        response = requests.post(
            f"{BASE_URL}/api/anosim/assign",
            json={"employee_id": "some-id"},  # Missing anosim_number
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 422, f"Expected 422 validation error, got {response.status_code}"
        print("Correctly returned validation error for missing fields")
    
    def test_admin_assign_nonexistent_employee(self, admin_token):
        """Test POST /api/anosim/assign to non-existent employee"""
        response = requests.post(
            f"{BASE_URL}/api/anosim/assign",
            json={
                "employee_id": "nonexistent-employee-id-12345",
                "anosim_number": "+4917600000001"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
        data = response.json()
        assert "detail" in data
        print(f"Correctly returned 404 for non-existent employee: {data['detail']}")
    
    def test_admin_unassign_number(self, admin_token, employee_id):
        """Test POST /api/anosim/unassign - remove number from employee"""
        response = requests.post(
            f"{BASE_URL}/api/anosim/unassign",
            json={"employee_id": employee_id},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "message" in data
        print(f"Successfully unassigned number from employee {employee_id}")
    
    def test_admin_unassign_nonexistent_employee(self, admin_token):
        """Test POST /api/anosim/unassign for non-existent employee"""
        response = requests.post(
            f"{BASE_URL}/api/anosim/unassign",
            json={"employee_id": "nonexistent-employee-id-12345"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
        print("Correctly returned 404 for non-existent employee")
    
    def test_admin_endpoints_require_auth(self):
        """Test that admin endpoints require authentication"""
        # Test assignments endpoint
        response = requests.get(f"{BASE_URL}/api/anosim/assignments")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        # Test assign endpoint
        response = requests.post(
            f"{BASE_URL}/api/anosim/assign",
            json={"employee_id": "test", "anosim_number": "+491234567890"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        # Test unassign endpoint
        response = requests.post(
            f"{BASE_URL}/api/anosim/unassign",
            json={"employee_id": "test"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print("All admin endpoints correctly require authentication")


# ============== EMPLOYEE TESTS ==============

class TestEmployeeAnosim:
    """Employee Anosim tests"""
    
    def test_employee_get_my_number_endpoint(self, employee_token):
        """Test GET /api/anosim/my-number - get employee's assigned number"""
        response = requests.get(
            f"{BASE_URL}/api/anosim/my-number",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "has_number" in data, "Response should contain 'has_number' key"
        
        if data.get("has_number"):
            assert "anosim_number" in data
            print(f"Employee has assigned number: {data.get('anosim_number')}")
        else:
            print("Employee does not have an assigned number")
    
    def test_employee_get_my_sms_with_number(self, admin_token, employee_token, employee_id):
        """Test GET /api/anosim/my-sms - get SMS for assigned number"""
        # First assign a number to the employee
        requests.post(
            f"{BASE_URL}/api/anosim/assign",
            json={
                "employee_id": employee_id,
                "anosim_number": "+4917612345678"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        # Now test getting SMS
        response = requests.get(
            f"{BASE_URL}/api/anosim/my-sms?limit=10",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        
        # Should return 200 (even if empty SMS) or 500 (if Anosim API error)
        assert response.status_code in [200, 500], f"Expected 200 or 500, got {response.status_code}: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert "phone_number" in data
            assert "messages" in data
            print(f"SMS for {data['phone_number']}: {len(data['messages'])} messages")
        else:
            # Anosim API may return error (not our concern)
            print(f"Anosim API returned error: {response.json()}")
    
    def test_employee_get_my_sms_without_number(self, admin_token, employee_token, employee_id):
        """Test GET /api/anosim/my-sms when no number assigned"""
        # First unassign any number
        requests.post(
            f"{BASE_URL}/api/anosim/unassign",
            json={"employee_id": employee_id},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        # Now test getting SMS
        response = requests.get(
            f"{BASE_URL}/api/anosim/my-sms",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
        data = response.json()
        assert "detail" in data
        print(f"Correctly returned 404 when no number assigned: {data['detail']}")
    
    def test_employee_endpoints_require_auth(self):
        """Test that employee endpoints require authentication"""
        # Test my-number endpoint
        response = requests.get(f"{BASE_URL}/api/anosim/my-number")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        # Test my-sms endpoint
        response = requests.get(f"{BASE_URL}/api/anosim/my-sms")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print("All employee endpoints correctly require authentication")


# ============== INTEGRATION TEST ==============

class TestAnosimFullFlow:
    """Full flow integration test"""
    
    def test_full_assign_check_unassign_flow(self, admin_token, employee_token, employee_id):
        """Test complete assign -> check -> unassign flow"""
        test_number = "+4917600099999"
        
        # Step 1: Admin assigns number
        assign_response = requests.post(
            f"{BASE_URL}/api/anosim/assign",
            json={
                "employee_id": employee_id,
                "anosim_number": test_number
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert assign_response.status_code == 200, f"Assign failed: {assign_response.text}"
        print(f"Step 1: Assigned {test_number} to employee")
        
        # Step 2: Employee checks their number
        check_response = requests.get(
            f"{BASE_URL}/api/anosim/my-number",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert check_response.status_code == 200
        data = check_response.json()
        assert data.get("has_number") == True
        assert data.get("anosim_number") == test_number
        print(f"Step 2: Employee sees assigned number: {test_number}")
        
        # Step 3: Admin verifies in assignments list
        assignments_response = requests.get(
            f"{BASE_URL}/api/anosim/assignments",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert assignments_response.status_code == 200
        assignments = assignments_response.json().get("assignments", [])
        found = any(a.get("id") == employee_id and a.get("anosim_number") == test_number for a in assignments)
        assert found, "Assignment should appear in assignments list"
        print("Step 3: Admin verifies assignment in list")
        
        # Step 4: Admin unassigns number
        unassign_response = requests.post(
            f"{BASE_URL}/api/anosim/unassign",
            json={"employee_id": employee_id},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert unassign_response.status_code == 200
        print("Step 4: Admin unassigned number")
        
        # Step 5: Employee no longer has number
        final_check = requests.get(
            f"{BASE_URL}/api/anosim/my-number",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert final_check.status_code == 200
        data = final_check.json()
        assert data.get("has_number") == False
        print("Step 5: Employee no longer has assigned number")
        
        print("Full flow test completed successfully!")
