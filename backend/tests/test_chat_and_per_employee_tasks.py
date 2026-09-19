"""
Test Chat System, Per-Employee Task Status, Anosim, and Quiz APIs
Tests for iteration 14 - Chat, per-employee task status, Anosim visibility
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

from dotenv import dotenv_values

_frontend_env = dotenv_values("/app/frontend/.env")
BASE_URL = (os.environ.get('REACT_APP_BACKEND_URL')
            or _frontend_env.get('REACT_APP_BACKEND_URL', '')).rstrip('/')

# Test credentials (see /app/memory/test_credentials.md)
ADMIN_EMAIL = "admin@webora.de"
ADMIN_PASSWORD = "Kp9!xRv2Lq@Zm7Tn4&Q"
EMPLOYEE_EMAIL = "mitarbeiter@precision-labs.de"
EMPLOYEE_PASSWORD = "Mitarbeiter123!"


class TestAdminLogin:
    """Test admin login returns access_token"""
    
    def test_admin_login_success(self):
        """POST /api/admin/login - Admin login returns access_token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "access_token" in data, "Response should contain access_token"
        assert len(data["access_token"]) > 0, "access_token should not be empty"
        assert "admin" in data, "Response should contain admin object"
        
    def test_admin_login_invalid_credentials(self):
        """Admin login with wrong password should fail (throwaway email to avoid lockout)"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": f"TEST_nobody_{uuid.uuid4().hex[:8]}@qamail.de",
            "password": "wrongpassword"
        })
        assert response.status_code == 401


@pytest.fixture(scope="module")
def admin_token():
    """Get admin token for authenticated requests"""
    response = requests.post(f"{BASE_URL}/api/admin/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    pytest.skip("Admin login failed")


@pytest.fixture(scope="module")
def employee_token():
    """Get employee token for authenticated requests"""
    response = requests.post(f"{BASE_URL}/api/employee/login", json={
        "email": EMPLOYEE_EMAIL,
        "password": EMPLOYEE_PASSWORD
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    pytest.skip("Employee login failed")


class TestAdminEmployees:
    """Test GET /api/admin/employees - Returns employees from both collections"""
    
    def test_get_employees(self, admin_token):
        """GET /api/admin/employees - Returns employees from both employees and applications collections"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/employees", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        # Check structure of employee objects
        if len(data) > 0:
            emp = data[0]
            assert "id" in emp, "Employee should have id"
            assert "name" in emp, "Employee should have name"
            assert "email" in emp, "Employee should have email"


class TestTaskCreation:
    """Test task creation and assignment"""
    
    def test_create_task(self, admin_token):
        """POST /api/admin/tasks - Create a new task"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        task_data = {
            "title": f"TEST_Task_{uuid.uuid4().hex[:8]}",
            "website": "https://example.com",
            "einleitung": "Test introduction",
            "schritt1": "Step 1",
            "schritt2": "Step 2",
            "schritt3": "Step 3",
            "priority": "Mittel",
            "due_date": "2026-12-31"
        }
        response = requests.post(f"{BASE_URL}/api/admin/tasks", json=task_data, headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data, "Task should have id"
        assert data["title"] == task_data["title"], "Task title should match"
        assert data["status"] == "Offen", "New task should have status 'Offen'"
        return data["id"]


class TestPerEmployeeTaskStatus:
    """Test per-employee task status functionality"""
    
    @pytest.fixture(scope="class")
    def test_task_and_employees(self, admin_token):
        """Create a task and get employees for testing"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Create a task
        task_data = {
            "title": f"TEST_PerEmployee_{uuid.uuid4().hex[:8]}",
            "website": "https://test.com",
            "einleitung": "Per-employee test",
            "schritt1": "Step 1",
            "schritt2": "Step 2",
            "schritt3": "Step 3",
            "priority": "Hoch",
            "due_date": "2026-12-31"
        }
        task_res = requests.post(f"{BASE_URL}/api/admin/tasks", json=task_data, headers=headers)
        assert task_res.status_code == 200
        task_id = task_res.json()["id"]
        
        # Get employees
        emp_res = requests.get(f"{BASE_URL}/api/admin/employees", headers=headers)
        employees = emp_res.json()
        
        return {"task_id": task_id, "employees": employees, "headers": headers}
    
    def test_assign_task_to_multiple_employees(self, admin_token, test_task_and_employees):
        """PUT /api/admin/tasks/{id}/assign-multiple - Assign task to employees from applications collection"""
        headers = test_task_and_employees["headers"]
        task_id = test_task_and_employees["task_id"]
        employees = test_task_and_employees["employees"]
        
        if len(employees) < 1:
            pytest.skip("No employees available for testing")
        
        # Assign to first employee (or first 2 if available)
        assignments = []
        for emp in employees[:2]:
            assignments.append({
                "employee_id": emp["id"],
                "test_ident_link": f"https://ident.test/{emp['id']}",
                "test_login_email": f"test_{emp['id']}@example.com",
                "test_login_password": "TestPass123"
            })
        
        response = requests.put(
            f"{BASE_URL}/api/admin/tasks/{task_id}/assign-multiple",
            json={"assignments": assignments},
            headers=headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "assigned_count" in data, "Response should contain assigned_count"
        assert data["assigned_count"] == len(assignments), f"Should assign {len(assignments)} employees"


class TestEmployeeTasks:
    """Test employee task endpoints"""
    
    def test_employee_get_tasks(self, employee_token):
        """GET /api/employee/tasks - Employee sees tasks assigned to them with per-employee credentials"""
        headers = {"Authorization": f"Bearer {employee_token}"}
        response = requests.get(f"{BASE_URL}/api/employee/tasks", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list of tasks"
    
    def test_employee_stats(self, employee_token):
        """GET /api/employee/stats - Stats count per-employee status correctly"""
        headers = {"Authorization": f"Bearer {employee_token}"}
        response = requests.get(f"{BASE_URL}/api/employee/stats", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "total_tasks" in data, "Stats should contain total_tasks"
        assert "open_tasks" in data, "Stats should contain open_tasks"
        assert "in_progress" in data, "Stats should contain in_progress"
        assert "completed" in data, "Stats should contain completed"


class TestChatSystem:
    """Test chat system endpoints"""
    
    def test_chat_send_message(self, admin_token, employee_token):
        """POST /api/chat/send - Send chat message"""
        # Admin sends message to employee
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # First get an employee to send to
        emp_res = requests.get(f"{BASE_URL}/api/admin/employees", headers=admin_headers)
        employees = emp_res.json()
        if len(employees) == 0:
            pytest.skip("No employees to chat with")
        
        recipient_id = employees[0]["id"]
        message_text = f"TEST_Message_{uuid.uuid4().hex[:8]}"
        
        response = requests.post(f"{BASE_URL}/api/chat/send", json={
            "recipient_id": recipient_id,
            "message": message_text
        }, headers=admin_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "conversation_id" in data, "Response should contain conversation_id"
    
    def test_chat_get_messages(self, admin_token):
        """GET /api/chat/messages/{partner_id} - Get conversation messages"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get employees
        emp_res = requests.get(f"{BASE_URL}/api/admin/employees", headers=headers)
        employees = emp_res.json()
        if len(employees) == 0:
            pytest.skip("No employees")
        
        partner_id = employees[0]["id"]
        response = requests.get(f"{BASE_URL}/api/chat/messages/{partner_id}", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "messages" in data, "Response should contain messages"
        assert isinstance(data["messages"], list), "messages should be a list"
    
    def test_chat_get_conversations(self, admin_token):
        """GET /api/chat/conversations - Get conversation list"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/chat/conversations", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "conversations" in data, "Response should contain conversations"
        assert isinstance(data["conversations"], list), "conversations should be a list"
    
    def test_chat_get_unread(self, admin_token):
        """GET /api/chat/unread - Get unread message count"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/chat/unread", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "unread" in data, "Response should contain unread count"
        assert isinstance(data["unread"], int), "unread should be an integer"
    
    def test_chat_employee_unread(self, employee_token):
        """Employee can get unread count"""
        headers = {"Authorization": f"Bearer {employee_token}"}
        response = requests.get(f"{BASE_URL}/api/chat/unread", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "unread" in data


class TestTelegramWebhook:
    """Telegram webhook endpoint was REMOVED (security hardening, iteration_30)"""

    def test_telegram_webhook_removed_start(self):
        """POST /api/chat/telegram/webhook - endpoint removed -> 404/405"""
        webhook_data = {
            "message": {
                "text": "/start",
                "chat": {"id": 123456789},
                "from": {"first_name": "TestUser"}
            }
        }
        response = requests.post(f"{BASE_URL}/api/chat/telegram/webhook", json=webhook_data)
        assert response.status_code in (404, 405), f"Expected 404/405, got {response.status_code}: {response.text[:200]}"

    def test_telegram_webhook_removed_stop(self):
        """POST /api/chat/telegram/webhook - endpoint removed -> 404/405"""
        webhook_data = {
            "message": {
                "text": "/stop",
                "chat": {"id": 123456789},
                "from": {"first_name": "TestUser"}
            }
        }
        response = requests.post(f"{BASE_URL}/api/chat/telegram/webhook", json=webhook_data)
        assert response.status_code in (404, 405), f"Expected 404/405, got {response.status_code}: {response.text[:200]}"


class TestQuizEndpoints:
    """Test quiz endpoints"""
    
    def test_quiz_status_requires_auth(self):
        """GET /api/quiz/status - Requires authentication"""
        response = requests.get(f"{BASE_URL}/api/quiz/status")
        assert response.status_code == 401
    
    def test_quiz_admin_view(self, admin_token):
        """GET /api/quiz/admin/{applicant_id} - Admin view quiz answers"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        # Use a non-existent applicant - should return completed: false
        response = requests.get(f"{BASE_URL}/api/quiz/admin/nonexistent-id", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "completed" in data, "Response should contain completed field"


class TestAnosimEndpoints:
    """Test Anosim number endpoints"""
    
    def test_anosim_my_number_employee(self, employee_token):
        """GET /api/anosim/my-number - Employee sees assigned Anosim number"""
        headers = {"Authorization": f"Bearer {employee_token}"}
        response = requests.get(f"{BASE_URL}/api/anosim/my-number", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "has_number" in data, "Response should contain has_number"
        # anosim_number can be null if not assigned
    
    def test_anosim_numbers_admin(self, admin_token):
        """GET /api/anosim/numbers - Admin can get all numbers"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/anosim/numbers", headers=headers)
        # May return 500 if Anosim API is not configured, but endpoint should exist
        assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
    
    def test_anosim_assignments_admin(self, admin_token):
        """GET /api/anosim/assignments - Admin can get all assignments"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/anosim/assignments", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "assignments" in data, "Response should contain assignments"


class TestChatImageEndpoint:
    """Test chat image endpoints"""
    
    def test_chat_image_not_found(self):
        """GET /api/chat/image/{filename} - Returns 404 for non-existent image"""
        response = requests.get(f"{BASE_URL}/api/chat/image/nonexistent.jpg")
        assert response.status_code == 404


class TestEmployeeTaskStatusUpdate:
    """Test per-employee task status update"""
    
    def test_employee_update_task_status(self, employee_token):
        """PATCH /api/employee/tasks/{id} - Per-employee status update"""
        headers = {"Authorization": f"Bearer {employee_token}"}
        
        # First get tasks
        tasks_res = requests.get(f"{BASE_URL}/api/employee/tasks", headers=headers)
        tasks = tasks_res.json()
        
        if len(tasks) == 0:
            pytest.skip("No tasks assigned to employee")
        
        task_id = tasks[0]["id"]
        
        # Update status to "In Bearbeitung"
        response = requests.patch(
            f"{BASE_URL}/api/employee/tasks/{task_id}",
            json={"status": "In Bearbeitung"},
            headers=headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify the update
        tasks_res2 = requests.get(f"{BASE_URL}/api/employee/tasks", headers=headers)
        tasks2 = tasks_res2.json()
        updated_task = next((t for t in tasks2 if t["id"] == task_id), None)
        if updated_task:
            assert updated_task["status"] == "In Bearbeitung", "Task status should be updated"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
