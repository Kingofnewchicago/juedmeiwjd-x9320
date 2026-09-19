"""
Test Module: Mitarbeiter (Employee) Signup Flow
Tests for POST /api/applications/submit endpoint - Employee registration
Tests for POST /api/applications/login endpoint - Employee login after registration
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

# Generate unique test email using timestamp
TEST_TIMESTAMP = str(int(time.time()))
TEST_EMAIL = f"testbenutzer_{TEST_TIMESTAMP}@test.de"


class TestMitarbeiterSignupValidation:
    """Validation tests for the signup endpoint"""
    
    def test_signup_missing_required_fields(self):
        """Test that signup fails when required fields are missing"""
        # Missing all fields
        response = requests.post(f"{BASE_URL}/api/applications/submit", json={})
        assert response.status_code == 422, f"Expected 422 for missing fields, got {response.status_code}"
        print("PASS: Signup rejects request with missing required fields (422)")
    
    def test_signup_missing_name(self):
        """Test that signup fails when name is missing"""
        response = requests.post(f"{BASE_URL}/api/applications/submit", json={
            "email": f"test_{TEST_TIMESTAMP}_noname@test.de",
            "password": "TestPass123",
            "position": "Bewerber",
            "mobilnummer": "+49 170 9876543",
            "strasse": "Teststraße 99",
            "postleitzahl": "10115",
            "stadt": "Berlin",
            "geburtsdatum": "1995-05-15",
            "staatsangehoerigkeit": "Deutsch"
        })
        assert response.status_code == 422, f"Expected 422 for missing name, got {response.status_code}"
        print("PASS: Signup rejects request when name is missing (422)")
    
    def test_signup_missing_email(self):
        """Test that signup fails when email is missing"""
        response = requests.post(f"{BASE_URL}/api/applications/submit", json={
            "name": "Test User",
            "password": "TestPass123",
            "position": "Bewerber",
            "mobilnummer": "+49 170 9876543",
            "strasse": "Teststraße 99",
            "postleitzahl": "10115",
            "stadt": "Berlin",
            "geburtsdatum": "1995-05-15",
            "staatsangehoerigkeit": "Deutsch"
        })
        assert response.status_code == 422, f"Expected 422 for missing email, got {response.status_code}"
        print("PASS: Signup rejects request when email is missing (422)")
    
    def test_signup_invalid_email_format(self):
        """Test that signup fails with invalid email format"""
        response = requests.post(f"{BASE_URL}/api/applications/submit", json={
            "name": "Test User",
            "email": "invalid-email-format",
            "password": "TestPass123",
            "position": "Bewerber",
            "mobilnummer": "+49 170 9876543",
            "strasse": "Teststraße 99",
            "postleitzahl": "10115",
            "stadt": "Berlin",
            "geburtsdatum": "1995-05-15",
            "staatsangehoerigkeit": "Deutsch"
        })
        assert response.status_code == 422, f"Expected 422 for invalid email, got {response.status_code}"
        print("PASS: Signup rejects request with invalid email format (422)")
    
    def test_signup_missing_password(self):
        """Test that signup fails when password is missing"""
        response = requests.post(f"{BASE_URL}/api/applications/submit", json={
            "name": "Test User",
            "email": f"test_{TEST_TIMESTAMP}_nopwd@test.de",
            "position": "Bewerber",
            "mobilnummer": "+49 170 9876543",
            "strasse": "Teststraße 99",
            "postleitzahl": "10115",
            "stadt": "Berlin",
            "geburtsdatum": "1995-05-15",
            "staatsangehoerigkeit": "Deutsch"
        })
        assert response.status_code == 422, f"Expected 422 for missing password, got {response.status_code}"
        print("PASS: Signup rejects request when password is missing (422)")


class TestMitarbeiterSignupSuccess:
    """Tests for successful signup flow"""
    
    def test_successful_signup_and_verify_data(self):
        """Test successful registration with all required fields"""
        signup_data = {
            "name": "Test Benutzer",
            "email": TEST_EMAIL,
            "password": "TestPass123",
            "position": "Bewerber",
            "message": "Registrierung über Mitarbeiter-Signup",
            "mobilnummer": "+49 170 9876543",
            "strasse": "Teststraße 99",
            "postleitzahl": "10115",
            "stadt": "Berlin",
            "geburtsdatum": "1995-05-15",
            "staatsangehoerigkeit": "Deutsch"
        }
        
        response = requests.post(f"{BASE_URL}/api/applications/submit", json=signup_data)
        
        assert response.status_code == 200, f"Expected 200 for successful signup, got {response.status_code}: {response.text}"
        
        # Verify response data structure
        data = response.json()
        assert "id" in data, "Response should contain 'id'"
        assert data["email"] == TEST_EMAIL, f"Email mismatch: expected {TEST_EMAIL}, got {data['email']}"
        assert data["name"] == "Test Benutzer", "Name mismatch"
        assert data["status"] == "Neu", f"Status should be 'Neu', got {data['status']}"
        assert data["mobilnummer"] == "+49 170 9876543", "Phone number mismatch"
        assert data["strasse"] == "Teststraße 99", "Street mismatch"
        assert data["postleitzahl"] == "10115", "PLZ mismatch"
        assert data["stadt"] == "Berlin", "City mismatch"
        assert data["geburtsdatum"] == "1995-05-15", "Birthday mismatch"
        assert data["staatsangehoerigkeit"] == "Deutsch", "Nationality mismatch"
        assert data["position"] == "Bewerber", "Position mismatch"
        assert "password" not in data, "Password should not be in response"
        assert "password_hash" not in data, "Password hash should not be in response"
        
        print(f"PASS: Successful signup - created application with ID: {data['id']}")
        print(f"PASS: All fields verified: name, email, status, phone, address, birthday")
        
        return data
    
    def test_duplicate_email_rejected(self):
        """Test that duplicate email registration is rejected"""
        # First create a user
        first_signup = {
            "name": "First User",
            "email": f"duplicate_{TEST_TIMESTAMP}@test.de",
            "password": "TestPass123",
            "position": "Bewerber",
            "mobilnummer": "+49 170 1111111",
            "strasse": "Straße 1",
            "postleitzahl": "10115",
            "stadt": "Berlin",
            "geburtsdatum": "1990-01-01",
            "staatsangehoerigkeit": "Deutsch"
        }
        
        response1 = requests.post(f"{BASE_URL}/api/applications/submit", json=first_signup)
        assert response1.status_code == 200, f"First signup should succeed, got {response1.status_code}"
        
        # Try to register with same email
        duplicate_signup = {
            "name": "Second User",
            "email": f"duplicate_{TEST_TIMESTAMP}@test.de",  # Same email
            "password": "DifferentPass456",
            "position": "Bewerber",
            "mobilnummer": "+49 170 2222222",
            "strasse": "Straße 2",
            "postleitzahl": "20095",
            "stadt": "Hamburg",
            "geburtsdatum": "1992-02-02",
            "staatsangehoerigkeit": "Deutsch"
        }
        
        response2 = requests.post(f"{BASE_URL}/api/applications/submit", json=duplicate_signup)
        assert response2.status_code == 400, f"Expected 400 for duplicate email, got {response2.status_code}"
        
        # Check error message
        error_data = response2.json()
        assert "detail" in error_data, "Error response should contain 'detail'"
        assert "existiert bereits" in error_data["detail"], f"Error should mention email exists, got: {error_data['detail']}"
        
        print("PASS: Duplicate email registration correctly rejected with 400")


class TestMitarbeiterLoginAfterSignup:
    """Tests for login functionality after signup"""
    
    def test_login_with_new_account(self):
        """Test login with newly created account"""
        # First create a new account
        unique_email = f"logintest_{TEST_TIMESTAMP}@test.de"
        signup_data = {
            "name": "Login Test User",
            "email": unique_email,
            "password": "LoginTestPass123",
            "position": "Bewerber",
            "mobilnummer": "+49 170 3333333",
            "strasse": "Loginstraße 1",
            "postleitzahl": "10115",
            "stadt": "Berlin",
            "geburtsdatum": "1995-05-15",
            "staatsangehoerigkeit": "Deutsch"
        }
        
        signup_response = requests.post(f"{BASE_URL}/api/applications/submit", json=signup_data)
        assert signup_response.status_code == 200, f"Signup should succeed, got {signup_response.status_code}"
        
        # Now test login
        login_response = requests.post(f"{BASE_URL}/api/applications/login", json={
            "email": unique_email,
            "password": "LoginTestPass123"
        })
        
        assert login_response.status_code == 200, f"Login should succeed, got {login_response.status_code}: {login_response.text}"
        
        login_data = login_response.json()
        assert "access_token" in login_data, "Login response should contain access_token"
        assert "applicant" in login_data, "Login response should contain applicant data"
        assert login_data["applicant"]["email"] == unique_email, "Applicant email should match"
        assert login_data["applicant"]["name"] == "Login Test User", "Applicant name should match"
        assert login_data["applicant"]["status"] == "Neu", "New account status should be 'Neu'"
        
        print(f"PASS: Login successful for new account - token received")
        print(f"PASS: Login response contains correct applicant data")
        
        return login_data["access_token"]
    
    def test_login_with_wrong_password(self):
        """Test login fails with wrong password"""
        # Use an existing email from previous test
        login_response = requests.post(f"{BASE_URL}/api/applications/login", json={
            "email": f"logintest_{TEST_TIMESTAMP}@test.de",
            "password": "WrongPassword123"
        })
        
        assert login_response.status_code == 401, f"Expected 401 for wrong password, got {login_response.status_code}"
        print("PASS: Login correctly rejected with wrong password (401)")
    
    def test_login_with_nonexistent_email(self):
        """Test login fails with non-existent email"""
        login_response = requests.post(f"{BASE_URL}/api/applications/login", json={
            "email": "nonexistent_user_12345@nowhere.com",
            "password": "SomePassword123"
        })
        
        assert login_response.status_code == 401, f"Expected 401 for non-existent email, got {login_response.status_code}"
        print("PASS: Login correctly rejected with non-existent email (401)")
    
    def test_login_missing_credentials(self):
        """Test login fails with missing credentials"""
        # Missing password
        response1 = requests.post(f"{BASE_URL}/api/applications/login", json={
            "email": "test@test.de"
        })
        assert response1.status_code == 400, f"Expected 400 for missing password, got {response1.status_code}"
        
        # Missing email
        response2 = requests.post(f"{BASE_URL}/api/applications/login", json={
            "password": "somepassword"
        })
        assert response2.status_code == 400, f"Expected 400 for missing email, got {response2.status_code}"
        
        print("PASS: Login correctly rejects missing credentials (400)")


class TestMitarbeiterStatusEndpoint:
    """Tests for applicant status endpoint"""
    
    def test_get_status_with_valid_token(self):
        """Test getting status with valid token"""
        # Create account and login
        unique_email = f"statustest_{TEST_TIMESTAMP}@test.de"
        signup_data = {
            "name": "Status Test User",
            "email": unique_email,
            "password": "StatusPass123",
            "position": "Bewerber",
            "mobilnummer": "+49 170 4444444",
            "strasse": "Statusstraße 1",
            "postleitzahl": "10115",
            "stadt": "Berlin",
            "geburtsdatum": "1995-05-15",
            "staatsangehoerigkeit": "Deutsch"
        }
        
        requests.post(f"{BASE_URL}/api/applications/submit", json=signup_data)
        
        login_response = requests.post(f"{BASE_URL}/api/applications/login", json={
            "email": unique_email,
            "password": "StatusPass123"
        })
        token = login_response.json()["access_token"]
        
        # Get status
        status_response = requests.get(
            f"{BASE_URL}/api/applications/status",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert status_response.status_code == 200, f"Status request should succeed, got {status_response.status_code}"
        
        status_data = status_response.json()
        assert status_data["email"] == unique_email, "Email should match"
        assert status_data["status"] == "Neu", "Status should be 'Neu'"
        assert "password_hash" not in status_data, "Password hash should not be exposed"
        
        print("PASS: Status endpoint returns correct user data with valid token")
    
    def test_get_status_without_token(self):
        """Test getting status without token fails"""
        status_response = requests.get(f"{BASE_URL}/api/applications/status")
        assert status_response.status_code == 401, f"Expected 401 without token, got {status_response.status_code}"
        print("PASS: Status endpoint correctly rejects request without token (401)")
    
    def test_get_status_with_invalid_token(self):
        """Test getting status with invalid token fails"""
        status_response = requests.get(
            f"{BASE_URL}/api/applications/status",
            headers={"Authorization": "Bearer invalid_token_12345"}
        )
        assert status_response.status_code == 401, f"Expected 401 with invalid token, got {status_response.status_code}"
        print("PASS: Status endpoint correctly rejects invalid token (401)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
