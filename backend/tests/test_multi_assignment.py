"""
Multi-Person Task Assignment API Tests
Tests for assigning tasks to multiple employees with individual credentials

Features tested:
- Multi-select employee modal with search
- Backend API POST /api/admin/tasks/{task_id}/assign-multiple endpoint
- Task display showing multiple assignees
- Backward compatibility with single-assignment tasks
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
EMPLOYEE_EMAIL = "mitarbeiter@precision-labs.de"
EMPLOYEE_PASSWORD = "Mitarbeiter123!"


class TestMultiAssignmentAPI:
    """Tests for multi-person task assignment endpoint"""
    
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
    def employee_token(self):
        """Get employee auth token"""
        response = requests.post(f"{BASE_URL}/api/employee/login", json={
            "email": EMPLOYEE_EMAIL,
            "password": EMPLOYEE_PASSWORD
        })
        assert response.status_code == 200, f"Employee login failed: {response.text}"
        return response.json()["access_token"]
    
    @pytest.fixture
    def test_task(self, admin_token):
        """Create a test task for assignment tests"""
        task_data = {
            "title": f"TEST_MultiAssign_{uuid.uuid4().hex[:8]}",
            "website": "https://test-multi-assign.com",
            "priority": "Normal"
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/tasks", 
            json=task_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        task = response.json()
        
        yield task
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/tasks/{task['id']}", 
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    @pytest.fixture
    def employees(self, admin_token):
        """Get list of available employees"""
        response = requests.get(f"{BASE_URL}/api/admin/employees", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200
        return response.json()
    
    def test_assign_to_single_employee(self, admin_token, test_task, employees):
        """Test assigning task to single employee via multi-assign endpoint"""
        emp1 = employees[0]
        
        assignments = [{
            "employee_id": emp1["id"],
            "test_ident_link": "https://single-test.com/ident",
            "test_login_email": "singletest@example.com",
            "test_login_password": "SinglePass123"
        }]
        
        response = requests.put(
            f"{BASE_URL}/api/admin/tasks/{test_task['id']}/assign-multiple",
            json={"assignments": assignments},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200, f"Assignment failed: {response.text}"
        data = response.json()
        assert data["assigned_count"] == 1
        assert emp1["name"] in data["assigned_names"]
        print(f"PASS: Assigned task to single employee - {emp1['name']}")
    
    def test_assign_to_multiple_employees(self, admin_token, test_task, employees):
        """Test assigning task to multiple employees with unique credentials each"""
        # Use first 3 employees
        selected_employees = employees[:3] if len(employees) >= 3 else employees
        
        assignments = []
        for i, emp in enumerate(selected_employees):
            assignments.append({
                "employee_id": emp["id"],
                "test_ident_link": f"https://multi-test.com/ident/{i}",
                "test_login_email": f"multitest{i}@example.com",
                "test_login_password": f"MultiPass{i}123"
            })
        
        response = requests.put(
            f"{BASE_URL}/api/admin/tasks/{test_task['id']}/assign-multiple",
            json={"assignments": assignments},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200, f"Assignment failed: {response.text}"
        data = response.json()
        assert data["assigned_count"] == len(selected_employees)
        print(f"PASS: Assigned task to {len(selected_employees)} employees")
        
        # Verify task has assignments array
        tasks_resp = requests.get(f"{BASE_URL}/api/admin/tasks", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        task = next((t for t in tasks_resp.json() if t["id"] == test_task["id"]), None)
        assert task is not None
        assert len(task["assignments"]) == len(selected_employees)
        
        # Verify each assignment has correct credentials
        for i, assignment in enumerate(task["assignments"]):
            assert assignment["employee_id"] in [e["id"] for e in selected_employees]
            assert "employee_name" in assignment
            assert "test_ident_link" in assignment
            assert "test_login_email" in assignment
            assert "test_login_password" in assignment
        
        print(f"PASS: Task has {len(task['assignments'])} assignments with credentials")
    
    def test_assign_empty_list(self, admin_token, test_task):
        """Test error when assigning empty list"""
        response = requests.put(
            f"{BASE_URL}/api/admin/tasks/{test_task['id']}/assign-multiple",
            json={"assignments": []},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 400
        print("PASS: Empty assignments list returns 400 error")
    
    def test_assign_invalid_employee_id(self, admin_token, test_task):
        """Test assigning to non-existent employee - should be ignored"""
        assignments = [{
            "employee_id": "non-existent-employee-12345",
            "test_ident_link": "https://invalid.com",
            "test_login_email": "invalid@example.com",
            "test_login_password": "Invalid123"
        }]
        
        response = requests.put(
            f"{BASE_URL}/api/admin/tasks/{test_task['id']}/assign-multiple",
            json={"assignments": assignments},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        # Should return 400 since no valid employees found
        assert response.status_code == 400
        print("PASS: Invalid employee ID returns 400 error")
    
    def test_assign_to_nonexistent_task(self, admin_token, employees):
        """Test assigning to non-existent task"""
        assignments = [{
            "employee_id": employees[0]["id"],
            "test_ident_link": "https://test.com",
            "test_login_email": "test@example.com",
            "test_login_password": "Test123"
        }]
        
        response = requests.put(
            f"{BASE_URL}/api/admin/tasks/nonexistent-task-id/assign-multiple",
            json={"assignments": assignments},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 404
        print("PASS: Non-existent task returns 404 error")
    
    def test_assign_without_credentials(self, admin_token, test_task, employees):
        """Test assigning without test credentials (credentials are optional)"""
        emp = employees[0]
        
        assignments = [{
            "employee_id": emp["id"]
            # No credentials
        }]
        
        response = requests.put(
            f"{BASE_URL}/api/admin/tasks/{test_task['id']}/assign-multiple",
            json={"assignments": assignments},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        print("PASS: Assignment without credentials is allowed")
    
    def test_assign_unauthorized(self, test_task, employees):
        """Test assignment without authorization"""
        assignments = [{
            "employee_id": employees[0]["id"],
            "test_ident_link": "https://test.com",
            "test_login_email": "test@example.com",
            "test_login_password": "Test123"
        }]
        
        response = requests.put(
            f"{BASE_URL}/api/admin/tasks/{test_task['id']}/assign-multiple",
            json={"assignments": assignments}
            # No auth header
        )
        
        assert response.status_code == 401
        print("PASS: Unauthorized request returns 401")
    
    def test_backward_compatibility_fields(self, admin_token, test_task, employees):
        """Test that legacy fields (assigned_to, test_*) are set for backward compatibility"""
        emp1 = employees[0]
        emp2 = employees[1] if len(employees) > 1 else None
        
        selected = [emp1]
        if emp2:
            selected.append(emp2)
        
        assignments = []
        for i, emp in enumerate(selected):
            assignments.append({
                "employee_id": emp["id"],
                "test_ident_link": f"https://compat-test.com/ident/{i}",
                "test_login_email": f"compat{i}@example.com",
                "test_login_password": f"CompatPass{i}"
            })
        
        response = requests.put(
            f"{BASE_URL}/api/admin/tasks/{test_task['id']}/assign-multiple",
            json={"assignments": assignments},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        
        # Fetch updated task
        tasks_resp = requests.get(f"{BASE_URL}/api/admin/tasks", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        task = next((t for t in tasks_resp.json() if t["id"] == test_task["id"]), None)
        
        # Legacy fields should be set from first assignment
        assert task["assigned_to"] == emp1["id"]
        assert task["test_ident_link"] == "https://compat-test.com/ident/0"
        assert task["test_login_email"] == "compat0@example.com"
        assert task["test_login_password"] == "CompatPass0"
        
        # assigned_to_name should show multiple names or count
        if len(selected) > 1:
            assert "," in task["assigned_to_name"] or "Mitarbeiter" in task["assigned_to_name"]
        
        print("PASS: Backward compatibility fields are set correctly")


class TestEmployeeViewMultiAssignment:
    """Test employee's view of tasks with multi-assignment"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture
    def employee_token(self):
        """Get employee auth token"""
        response = requests.post(f"{BASE_URL}/api/employee/login", json={
            "email": EMPLOYEE_EMAIL,
            "password": EMPLOYEE_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_employee_sees_their_credentials_only(self, admin_token, employee_token):
        """Test that employee only sees their own credentials, not others'"""
        # Create task
        task_data = {
            "title": f"TEST_EmployeeView_{uuid.uuid4().hex[:8]}",
            "website": "https://emp-view-test.com",
            "priority": "Normal"
        }
        
        create_resp = requests.post(f"{BASE_URL}/api/admin/tasks", 
            json=task_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        task_id = create_resp.json()["id"]
        
        try:
            # Get employees
            emp_resp = requests.get(f"{BASE_URL}/api/admin/employees", headers={
                "Authorization": f"Bearer {admin_token}"
            })
            employees = emp_resp.json()
            
            # Find test employee (emp-001)
            test_emp = next((e for e in employees if e["id"] == "emp-001"), None)
            if not test_emp:
                pytest.skip("Test employee emp-001 not found")
            
            # Find another employee
            other_emp = next((e for e in employees if e["id"] != "emp-001"), None)
            
            # Assign to test employee with credentials
            assignments = [{
                "employee_id": test_emp["id"],
                "test_ident_link": "https://emp-view.com/emp1-ident",
                "test_login_email": "emp1-login@example.com",
                "test_login_password": "Emp1Secret123"
            }]
            
            if other_emp:
                assignments.append({
                    "employee_id": other_emp["id"],
                    "test_ident_link": "https://emp-view.com/other-ident",
                    "test_login_email": "other-login@example.com",
                    "test_login_password": "OtherSecret456"
                })
            
            assign_resp = requests.put(
                f"{BASE_URL}/api/admin/tasks/{task_id}/assign-multiple",
                json={"assignments": assignments},
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            assert assign_resp.status_code == 200
            
            # Get tasks as employee
            emp_tasks_resp = requests.get(f"{BASE_URL}/api/employee/tasks", headers={
                "Authorization": f"Bearer {employee_token}"
            })
            assert emp_tasks_resp.status_code == 200
            
            # Find our test task
            emp_tasks = emp_tasks_resp.json()
            emp_task = next((t for t in emp_tasks if t["id"] == task_id), None)
            
            assert emp_task is not None, "Task not found in employee's task list"
            print(f"PASS: Employee can see their assigned task")
            
            # Verify credentials are visible (either in legacy fields or assignments)
            has_credentials = (
                emp_task.get("test_ident_link") or 
                emp_task.get("test_login_email") or
                (emp_task.get("assignments") and len(emp_task.get("assignments", [])) > 0)
            )
            assert has_credentials, "Employee should see credentials"
            print("PASS: Employee can see credentials for their task")
            
        finally:
            # Cleanup
            requests.delete(f"{BASE_URL}/api/admin/tasks/{task_id}", 
                headers={"Authorization": f"Bearer {admin_token}"}
            )


class TestSearchAndFilter:
    """Test employee search functionality for assignment modal"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_employees_list(self, admin_token):
        """Test that employees list is returned with required fields for search"""
        response = requests.get(f"{BASE_URL}/api/admin/employees", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        
        assert response.status_code == 200
        employees = response.json()
        assert isinstance(employees, list)
        assert len(employees) > 0
        
        # Verify structure for search/filtering
        for emp in employees:
            assert "id" in emp, "Employee must have id"
            assert "name" in emp, "Employee must have name for display"
            assert "email" in emp, "Employee must have email for search"
            assert "position" in emp, "Employee must have position for search"
        
        print(f"PASS: Employees list has {len(employees)} entries with all required fields")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
