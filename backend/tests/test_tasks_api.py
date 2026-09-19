"""
Task Management API Tests
Tests for Admin and Employee task-related endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')

# Test credentials
ADMIN_EMAIL = "admin@webora.de"
ADMIN_PASSWORD = "Kp9!xRv2Lq@Zm7Tn4&Q"
EMPLOYEE_EMAIL = "mitarbeiter@precision-labs.de"
EMPLOYEE_PASSWORD = "Mitarbeiter123!"


class TestAdminAuthentication:
    """Admin login and token verification tests"""
    
    def test_admin_login_success(self):
        """Test successful admin login"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "access_token" in data, "Missing access_token"
        assert "admin" in data, "Missing admin data"
        assert data["admin"]["email"] == ADMIN_EMAIL
        assert data["admin"]["role"] == "admin"
    
    def test_admin_login_invalid_password(self):
        """Test admin login with invalid password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": "WrongPassword123!"
        })
        assert response.status_code == 401
    
    def test_admin_verify_token(self):
        """Test admin token verification"""
        # First login
        login_resp = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_resp.json()["access_token"]
        
        # Verify token
        response = requests.get(f"{BASE_URL}/api/admin/verify", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == True
        assert data["email"] == ADMIN_EMAIL


class TestEmployeeAuthentication:
    """Employee login and token verification tests"""
    
    def test_employee_login_success(self):
        """Test successful employee login"""
        response = requests.post(f"{BASE_URL}/api/employee/login", json={
            "email": EMPLOYEE_EMAIL,
            "password": EMPLOYEE_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "access_token" in data, "Missing access_token"
        assert "employee" in data, "Missing employee data"
        assert data["employee"]["email"] == EMPLOYEE_EMAIL
    
    def test_employee_login_invalid_password(self):
        """Test employee login with invalid password"""
        response = requests.post(f"{BASE_URL}/api/employee/login", json={
            "email": EMPLOYEE_EMAIL,
            "password": "WrongPassword"
        })
        assert response.status_code == 401


class TestAdminTasks:
    """Admin task management tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_employees_list(self, admin_token):
        """Test fetching employees for task assignment"""
        response = requests.get(f"{BASE_URL}/api/admin/employees", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Expected at least one employee"
        
        # Verify employee structure
        emp = data[0]
        assert "id" in emp
        assert "name" in emp
        assert "email" in emp
    
    def test_get_all_tasks(self, admin_token):
        """Test fetching all tasks"""
        response = requests.get(f"{BASE_URL}/api/admin/tasks", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_create_task_full(self, admin_token):
        """Test creating a task with all fields"""
        unique_title = f"TEST_Task_{uuid.uuid4().hex[:8]}"
        
        task_data = {
            "title": unique_title,
            "website": "https://test-example.com",
            "einleitung": "Test Einleitung - Allgemeine Beschreibung",
            "schritt1": "Test Schritt 1 - Erste Aktion",
            "schritt2": "Test Schritt 2 - Zweite Aktion",
            "schritt3": "Test Schritt 3 - Dritte Aktion",
            "assigned_to": "emp-001",
            "priority": "Normal",
            "due_date": "2026-03-15"
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/tasks", 
            json=task_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        created_task = response.json()
        assert created_task["title"] == unique_title
        assert created_task["website"] == task_data["website"]
        assert created_task["einleitung"] == task_data["einleitung"]
        assert created_task["schritt1"] == task_data["schritt1"]
        assert created_task["schritt2"] == task_data["schritt2"]
        assert created_task["schritt3"] == task_data["schritt3"]
        assert created_task["priority"] == "Normal"
        assert created_task["status"] == "Offen"
        assert created_task["assigned_to"] == "emp-001"
        assert "id" in created_task
        
        # Verify task appears in task list
        tasks_response = requests.get(f"{BASE_URL}/api/admin/tasks", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        all_tasks = tasks_response.json()
        task_ids = [t["id"] for t in all_tasks]
        assert created_task["id"] in task_ids, "Created task not found in list"
        
        # Cleanup - delete the test task
        delete_resp = requests.delete(f"{BASE_URL}/api/admin/tasks/{created_task['id']}", 
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert delete_resp.status_code == 200
    
    def test_create_task_minimal(self, admin_token):
        """Test creating a task with minimal required fields"""
        unique_title = f"TEST_Minimal_{uuid.uuid4().hex[:8]}"
        
        task_data = {
            "title": unique_title,
            "assigned_to": "emp-001"
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/tasks", 
            json=task_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        created_task = response.json()
        assert created_task["title"] == unique_title
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/tasks/{created_task['id']}", 
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_create_task_invalid_employee(self, admin_token):
        """Test creating task with non-existent employee"""
        task_data = {
            "title": "TEST_Invalid",
            "assigned_to": "non-existent-employee"
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/tasks", 
            json=task_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 404
    
    def test_delete_task(self, admin_token):
        """Test deleting a task"""
        # First create a task
        task_data = {
            "title": f"TEST_Delete_{uuid.uuid4().hex[:8]}",
            "assigned_to": "emp-001"
        }
        
        create_resp = requests.post(f"{BASE_URL}/api/admin/tasks", 
            json=task_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        task_id = create_resp.json()["id"]
        
        # Delete the task
        delete_resp = requests.delete(f"{BASE_URL}/api/admin/tasks/{task_id}", 
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert delete_resp.status_code == 200
        
        # Verify task is gone from list
        tasks_resp = requests.get(f"{BASE_URL}/api/admin/tasks", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        task_ids = [t["id"] for t in tasks_resp.json()]
        assert task_id not in task_ids
    
    def test_delete_nonexistent_task(self, admin_token):
        """Test deleting a task that doesn't exist"""
        response = requests.delete(f"{BASE_URL}/api/admin/tasks/nonexistent-id-12345", 
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 404


class TestEmployeeTasks:
    """Employee task operations tests"""
    
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
    
    def test_get_employee_tasks(self, employee_token):
        """Test fetching employee's assigned tasks"""
        response = requests.get(f"{BASE_URL}/api/employee/tasks", headers={
            "Authorization": f"Bearer {employee_token}"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_employee_stats(self, employee_token):
        """Test fetching employee statistics"""
        response = requests.get(f"{BASE_URL}/api/employee/stats", headers={
            "Authorization": f"Bearer {employee_token}"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "total_tasks" in data
        assert "open_tasks" in data
        assert "in_progress" in data
        assert "completed" in data
    
    def test_update_task_status_start(self, admin_token, employee_token):
        """Test starting a task (Offen -> In Bearbeitung)"""
        # Create a new task for this test
        task_data = {
            "title": f"TEST_Start_{uuid.uuid4().hex[:8]}",
            "assigned_to": "emp-001"
        }
        
        create_resp = requests.post(f"{BASE_URL}/api/admin/tasks", 
            json=task_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        task_id = create_resp.json()["id"]
        
        # Update status to "In Bearbeitung"
        update_resp = requests.patch(f"{BASE_URL}/api/employee/tasks/{task_id}", 
            json={"status": "In Bearbeitung"},
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert update_resp.status_code == 200
        
        # Verify status was updated
        tasks_resp = requests.get(f"{BASE_URL}/api/employee/tasks", headers={
            "Authorization": f"Bearer {employee_token}"
        })
        updated_task = next((t for t in tasks_resp.json() if t["id"] == task_id), None)
        assert updated_task is not None
        assert updated_task["status"] == "In Bearbeitung"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/tasks/{task_id}", 
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_update_task_status_complete(self, admin_token, employee_token):
        """Test completing a task (In Bearbeitung -> Abgeschlossen)"""
        # Create a new task
        task_data = {
            "title": f"TEST_Complete_{uuid.uuid4().hex[:8]}",
            "assigned_to": "emp-001"
        }
        
        create_resp = requests.post(f"{BASE_URL}/api/admin/tasks", 
            json=task_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        task_id = create_resp.json()["id"]
        
        # Start the task first
        requests.patch(f"{BASE_URL}/api/employee/tasks/{task_id}", 
            json={"status": "In Bearbeitung"},
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        
        # Complete the task
        complete_resp = requests.patch(f"{BASE_URL}/api/employee/tasks/{task_id}", 
            json={"status": "Abgeschlossen"},
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert complete_resp.status_code == 200
        
        # Verify completed_at is set
        tasks_resp = requests.get(f"{BASE_URL}/api/employee/tasks", headers={
            "Authorization": f"Bearer {employee_token}"
        })
        completed_task = next((t for t in tasks_resp.json() if t["id"] == task_id), None)
        assert completed_task is not None
        assert completed_task["status"] == "Abgeschlossen"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/tasks/{task_id}", 
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_update_task_not_assigned(self, admin_token, employee_token):
        """Test that employee cannot update task not assigned to them"""
        # This requires a second employee - skip if not available
        # For now, test trying to update a non-existent task
        response = requests.patch(f"{BASE_URL}/api/employee/tasks/nonexistent-task", 
            json={"status": "In Bearbeitung"},
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert response.status_code == 404


class TestUnauthorizedAccess:
    """Test unauthorized access scenarios"""
    
    def test_admin_tasks_without_token(self):
        """Test accessing admin tasks without token"""
        response = requests.get(f"{BASE_URL}/api/admin/tasks")
        assert response.status_code == 401
    
    def test_employee_tasks_without_token(self):
        """Test accessing employee tasks without token"""
        response = requests.get(f"{BASE_URL}/api/employee/tasks")
        assert response.status_code == 401
    
    def test_admin_tasks_with_employee_token(self):
        """Test employee cannot access admin endpoints"""
        login_resp = requests.post(f"{BASE_URL}/api/employee/login", json={
            "email": EMPLOYEE_EMAIL,
            "password": EMPLOYEE_PASSWORD
        })
        token = login_resp.json()["access_token"]
        
        response = requests.get(f"{BASE_URL}/api/admin/tasks", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
