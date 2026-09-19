"""
Test suite for the new applicant verification flow:
- Applicants choose their own password during application
- Applicants can login immediately after application
- Status-based access: Neu, Akzeptiert, Verifiziert, Freigeschaltet
- Admin can accept applications, view/verify uploaded IDs, unlock employees
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

# Test credentials
ADMIN_EMAIL = "admin@webora.de"
ADMIN_PASSWORD = "Kp9!xRv2Lq@Zm7Tn4&Q"
TEST_APPLICANT_EMAIL = "anna.schmidt@example.com"
TEST_APPLICANT_PASSWORD = "TestPass123!"


@pytest.fixture(scope="module")
def admin_token():
    """Get admin authentication token"""
    response = requests.post(f"{BASE_URL}/api/admin/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    # Try to initialize admin if not exists
    requests.post(f"{BASE_URL}/api/admin/init-admin")
    response = requests.post(f"{BASE_URL}/api/admin/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Could not get admin token")


class TestApplicationSubmission:
    """Test application submission with password"""
    
    def test_submit_application_with_password(self):
        """Submit new application with chosen password"""
        unique_email = f"test-{uuid.uuid4().hex[:8]}@test.com"
        payload = {
            "name": "Test Bewerber",
            "email": unique_email,
            "password": "SecurePass123!",
            "mobilnummer": "+49 170 9999999",
            "geburtsdatum": "1995-03-20",
            "staatsangehoerigkeit": "Deutsch",
            "strasse": "Testweg 123",
            "postleitzahl": "10115",
            "stadt": "Berlin",
            "position": "QA Engineer",
            "message": "Test application",
            "cv_filename": "test_cv.pdf"
        }
        
        response = requests.post(f"{BASE_URL}/api/applications/submit", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["name"] == "Test Bewerber"
        assert data["email"] == unique_email
        assert data["status"] == "Neu"
        assert "id" in data
        # Password should not be in response
        assert "password" not in data
        assert "password_hash" not in data
    
    def test_submit_duplicate_email_fails(self):
        """Duplicate email should fail"""
        # First create one
        unique_email = f"dup-{uuid.uuid4().hex[:8]}@test.com"
        payload = {
            "name": "First App",
            "email": unique_email,
            "password": "Pass123!",
            "mobilnummer": "+49 170 1111111",
            "geburtsdatum": "1990-01-01",
            "staatsangehoerigkeit": "Deutsch",
            "strasse": "Straße 1",
            "postleitzahl": "10000",
            "stadt": "Berlin",
            "position": "Tester",
            "message": "First"
        }
        
        response1 = requests.post(f"{BASE_URL}/api/applications/submit", json=payload)
        assert response1.status_code == 200
        
        # Try duplicate
        payload["name"] = "Second App"
        response2 = requests.post(f"{BASE_URL}/api/applications/submit", json=payload)
        assert response2.status_code == 400
        assert "existiert bereits" in response2.json().get("detail", "")


class TestApplicantLogin:
    """Test applicant login functionality"""
    
    def test_applicant_login_success(self):
        """Test login with existing applicant credentials"""
        response = requests.post(f"{BASE_URL}/api/applications/login", json={
            "email": TEST_APPLICANT_EMAIL,
            "password": TEST_APPLICANT_PASSWORD
        })
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "applicant" in data
        assert data["applicant"]["email"] == TEST_APPLICANT_EMAIL
        assert data["applicant"]["status"] in ["Neu", "Akzeptiert", "Verifiziert", "Freigeschaltet"]
    
    def test_applicant_login_wrong_password(self):
        """Wrong password should fail"""
        response = requests.post(f"{BASE_URL}/api/applications/login", json={
            "email": TEST_APPLICANT_EMAIL,
            "password": "WrongPassword123!"
        })
        assert response.status_code == 401
    
    def test_applicant_login_nonexistent_email(self):
        """Nonexistent email should fail"""
        response = requests.post(f"{BASE_URL}/api/applications/login", json={
            "email": "nonexistent@test.com",
            "password": "SomePassword123!"
        })
        assert response.status_code == 401


class TestApplicantStatus:
    """Test applicant status endpoint"""
    
    @pytest.fixture
    def applicant_token(self):
        """Get applicant token"""
        response = requests.post(f"{BASE_URL}/api/applications/login", json={
            "email": TEST_APPLICANT_EMAIL,
            "password": TEST_APPLICANT_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Could not get applicant token")
    
    def test_get_status_authorized(self, applicant_token):
        """Authorized applicant can get their status"""
        response = requests.get(
            f"{BASE_URL}/api/applications/status",
            headers={"Authorization": f"Bearer {applicant_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "email" in data
        assert "name" in data
    
    def test_get_status_unauthorized(self):
        """Unauthorized request should fail"""
        response = requests.get(f"{BASE_URL}/api/applications/status")
        assert response.status_code == 401


class TestAdminAcceptApplication:
    """Test admin accepting applications"""
    
    def test_get_applications_list(self, admin_token):
        """Admin can get all applications"""
        response = requests.get(
            f"{BASE_URL}/api/applications/",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "id" in data[0]
            assert "status" in data[0]
    
    def test_accept_application(self, admin_token):
        """Admin can accept an application with status 'Neu'"""
        # First create a new application
        unique_email = f"accept-test-{uuid.uuid4().hex[:8]}@test.com"
        submit_response = requests.post(f"{BASE_URL}/api/applications/submit", json={
            "name": "Accept Test",
            "email": unique_email,
            "password": "AcceptPass123!",
            "mobilnummer": "+49 170 2222222",
            "geburtsdatum": "1992-06-15",
            "staatsangehoerigkeit": "Deutsch",
            "strasse": "Accept Str 1",
            "postleitzahl": "20000",
            "stadt": "Hamburg",
            "position": "Tester",
            "message": "Accept test"
        })
        
        assert submit_response.status_code == 200
        app_id = submit_response.json()["id"]
        
        # Accept the application
        accept_response = requests.post(
            f"{BASE_URL}/api/applications/{app_id}/accept",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert accept_response.status_code == 200, f"Accept failed: {accept_response.text}"
        data = accept_response.json()
        assert data["status"] == "Akzeptiert"
    
    def test_accept_already_accepted_fails(self, admin_token):
        """Cannot accept an already accepted application"""
        # Create and accept a new application
        unique_email = f"double-accept-{uuid.uuid4().hex[:8]}@test.com"
        submit_response = requests.post(f"{BASE_URL}/api/applications/submit", json={
            "name": "Double Accept Test",
            "email": unique_email,
            "password": "DoublePass123!",
            "mobilnummer": "+49 170 3333333",
            "geburtsdatum": "1990-01-01",
            "staatsangehoerigkeit": "Deutsch",
            "strasse": "Test Str 1",
            "postleitzahl": "30000",
            "stadt": "München",
            "position": "Dev",
            "message": "Test"
        })
        
        app_id = submit_response.json()["id"]
        
        # First accept
        requests.post(
            f"{BASE_URL}/api/applications/{app_id}/accept",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        # Try second accept
        second_response = requests.post(
            f"{BASE_URL}/api/applications/{app_id}/accept",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert second_response.status_code == 400


class TestVerificationUpload:
    """Test ID verification upload"""
    
    @pytest.fixture
    def akzeptiert_token(self, admin_token):
        """Create and accept an application, return its token"""
        unique_email = f"upload-test-{uuid.uuid4().hex[:8]}@test.com"
        password = "UploadPass123!"
        
        # Submit
        submit_response = requests.post(f"{BASE_URL}/api/applications/submit", json={
            "name": "Upload Test",
            "email": unique_email,
            "password": password,
            "mobilnummer": "+49 170 4444444",
            "geburtsdatum": "1988-12-25",
            "staatsangehoerigkeit": "Deutsch",
            "strasse": "Upload Str 1",
            "postleitzahl": "40000",
            "stadt": "Köln",
            "position": "QA",
            "message": "Upload test"
        })
        
        app_id = submit_response.json()["id"]
        
        # Accept
        requests.post(
            f"{BASE_URL}/api/applications/{app_id}/accept",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        # Login to get token
        login_response = requests.post(f"{BASE_URL}/api/applications/login", json={
            "email": unique_email,
            "password": password
        })
        
        return login_response.json().get("access_token")
    
    def test_upload_verification_unauthorized(self):
        """Upload without auth should fail"""
        response = requests.post(f"{BASE_URL}/api/applications/verification/upload")
        assert response.status_code in [401, 422]
    
    def test_upload_verification_wrong_status(self):
        """Upload with status 'Neu' should fail"""
        # Create new application (status Neu)
        unique_email = f"neu-upload-{uuid.uuid4().hex[:8]}@test.com"
        password = "NeuPass123!"
        
        requests.post(f"{BASE_URL}/api/applications/submit", json={
            "name": "Neu Upload Test",
            "email": unique_email,
            "password": password,
            "mobilnummer": "+49 170 5555555",
            "geburtsdatum": "1985-07-04",
            "staatsangehoerigkeit": "Deutsch",
            "strasse": "Neu Str 1",
            "postleitzahl": "50000",
            "stadt": "Frankfurt",
            "position": "Dev",
            "message": "Neu upload test"
        })
        
        # Login
        login_response = requests.post(f"{BASE_URL}/api/applications/login", json={
            "email": unique_email,
            "password": password
        })
        token = login_response.json().get("access_token")
        
        # Try to upload (should fail because status is Neu)
        import io
        files = {
            'front': ('front.jpg', io.BytesIO(b'fake image data'), 'image/jpeg'),
            'back': ('back.jpg', io.BytesIO(b'fake image data'), 'image/jpeg')
        }
        
        response = requests.post(
            f"{BASE_URL}/api/applications/verification/upload",
            headers={"Authorization": f"Bearer {token}"},
            files=files
        )
        
        assert response.status_code == 400


class TestAdminUnlock:
    """Test admin unlocking employees"""
    
    def test_unlock_not_verified_fails(self, admin_token):
        """Cannot unlock application that is not 'Verifiziert'"""
        # Create and accept (status will be Akzeptiert, not Verifiziert)
        unique_email = f"unlock-fail-{uuid.uuid4().hex[:8]}@test.com"
        
        submit_response = requests.post(f"{BASE_URL}/api/applications/submit", json={
            "name": "Unlock Fail Test",
            "email": unique_email,
            "password": "UnlockPass123!",
            "mobilnummer": "+49 170 6666666",
            "geburtsdatum": "1982-03-10",
            "staatsangehoerigkeit": "Deutsch",
            "strasse": "Unlock Str 1",
            "postleitzahl": "60000",
            "stadt": "Stuttgart",
            "position": "Lead",
            "message": "Unlock fail test"
        })
        
        app_id = submit_response.json()["id"]
        
        # Accept (status becomes Akzeptiert)
        requests.post(
            f"{BASE_URL}/api/applications/{app_id}/accept",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        # Try to unlock (should fail - not Verifiziert)
        unlock_response = requests.post(
            f"{BASE_URL}/api/applications/{app_id}/unlock",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert unlock_response.status_code == 400
        assert "verifiziert" in unlock_response.json().get("detail", "").lower()


class TestAdminVerificationView:
    """Test admin viewing verification images"""
    
    def test_get_verification_image_not_found(self, admin_token):
        """Get image for application without verification should fail"""
        # Use an application that has no verification
        apps_response = requests.get(
            f"{BASE_URL}/api/applications/",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        apps = apps_response.json()
        
        # Find one without verification
        app_without_verify = None
        for app in apps:
            if not app.get("verification_front"):
                app_without_verify = app
                break
        
        if not app_without_verify:
            pytest.skip("No application without verification found")
        
        response = requests.get(
            f"{BASE_URL}/api/applications/verification/{app_without_verify['id']}/front",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 404


class TestDeleteVerification:
    """Test admin deleting verification documents"""
    
    def test_delete_verification_unauthorized(self):
        """Delete without auth should fail"""
        response = requests.delete(f"{BASE_URL}/api/applications/verification/some-id")
        assert response.status_code == 401
    
    def test_delete_verification_not_found(self, admin_token):
        """Delete non-existent application should fail"""
        response = requests.delete(
            f"{BASE_URL}/api/applications/verification/nonexistent-id",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 404


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
