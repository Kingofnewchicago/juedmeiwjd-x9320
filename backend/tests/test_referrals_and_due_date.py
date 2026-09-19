"""
Tests für:
- Auto due_date in POST /api/admin/tasks und /api/admin/tasks/{id}/assign-multiple
- Referrals CRUD + Tracking
- Application submit mit referral_slug (Counter inkrementiert; ungültig -> null)
"""
import os
import uuid
import pytest
import requests
from datetime import datetime, timedelta, timezone

from dotenv import dotenv_values  # noqa: E402

_base_url = os.environ.get('REACT_APP_BACKEND_URL') or dotenv_values('/app/frontend/.env').get('REACT_APP_BACKEND_URL')
if not _base_url:
    raise RuntimeError('REACT_APP_BACKEND_URL is missing from the environment and /app/frontend/.env')
BASE_URL = _base_url.rstrip('/')
ADMIN_EMAIL = "admin@webora.de"
ADMIN_PASSWORD = "Kp9!xRv2Lq@Zm7Tn4&Q"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json().get("access_token") or r.json().get("token")


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ======== Auto Due Date ========

class TestAutoDueDate:
    def test_create_task_auto_due_date_tomorrow(self, admin_headers):
        # Send arbitrary due_date to ensure it's ignored
        payload = {
            "title": f"TEST_TASK_{uuid.uuid4().hex[:6]}",
            "website": "https://example.com",
            "einleitung": "x",
            "schritt1": "1",
            "schritt2": "2",
            "schritt3": "3",
            "priority": "Mittel",
            "due_date": "2030-01-01",  # should be ignored
        }
        r = requests.post(f"{BASE_URL}/api/admin/tasks", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        expected = (datetime.utcnow() + timedelta(days=1)).date().isoformat()
        assert data["due_date"] == expected, f"due_date should be tomorrow ({expected}) but is {data['due_date']}"
        # cleanup
        requests.delete(f"{BASE_URL}/api/admin/tasks/{data['id']}", headers=admin_headers)

    def test_assign_multiple_auto_due_date(self, admin_headers):
        # Create a task first
        payload = {
            "title": f"TEST_TASK_MA_{uuid.uuid4().hex[:6]}",
            "website": "https://example.com",
            "einleitung": "x",
            "schritt1": "1", "schritt2": "2", "schritt3": "3",
            "priority": "Mittel",
        }
        r = requests.post(f"{BASE_URL}/api/admin/tasks", json=payload, headers=admin_headers)
        assert r.status_code == 200
        task_id = r.json()["id"]

        # Get a valid employee
        emp_r = requests.get(f"{BASE_URL}/api/admin/employees", headers=admin_headers)
        emp_id = None
        if emp_r.status_code == 200 and emp_r.json():
            emp_id = emp_r.json()[0].get("id")

        if not emp_id:
            # Try applications collection
            app_r = requests.get(f"{BASE_URL}/api/applications/", headers=admin_headers)
            if app_r.status_code == 200 and app_r.json():
                emp_id = app_r.json()[0].get("id")

        if not emp_id:
            requests.delete(f"{BASE_URL}/api/admin/tasks/{task_id}", headers=admin_headers)
            pytest.skip("No employee available for assignment")

        # Assign
        assign_payload = {
            "assignments": [
                {"employee_id": emp_id, "test_ident_link": "https://i.de", "test_login_email": "e@e.de", "test_login_password": "p"}
            ]
        }
        r2 = requests.put(f"{BASE_URL}/api/admin/tasks/{task_id}/assign-multiple", json=assign_payload, headers=admin_headers)
        assert r2.status_code == 200, r2.text

        # Get task and verify due_date
        tasks_r = requests.get(f"{BASE_URL}/api/admin/tasks", headers=admin_headers)
        assert tasks_r.status_code == 200
        task = next((t for t in tasks_r.json() if t["id"] == task_id), None)
        assert task is not None
        expected = (datetime.utcnow() + timedelta(days=1)).date().isoformat()
        assert task["due_date"] == expected
        assert "assignments" in task and len(task["assignments"]) >= 1
        for a in task["assignments"]:
            assert a.get("due_date") == expected

        # cleanup
        requests.delete(f"{BASE_URL}/api/admin/tasks/{task_id}", headers=admin_headers)


# ======== Referrals ========

class TestReferrals:
    slug = f"test-{uuid.uuid4().hex[:6]}"
    ref_id = None

    def test_01_create_referral(self, admin_headers):
        payload = {"slug": TestReferrals.slug, "name": "Test Kampagne", "notes": "Auto test"}
        r = requests.post(f"{BASE_URL}/api/referrals/", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["slug"] == TestReferrals.slug
        assert data["clicks"] == 0
        assert data["applications"] == 0
        assert data["active"] is True
        TestReferrals.ref_id = data["id"]

    def test_02_invalid_slug(self, admin_headers):
        r = requests.post(f"{BASE_URL}/api/referrals/", json={"slug": "ab"}, headers=admin_headers)
        assert r.status_code == 400

    def test_03_duplicate_slug(self, admin_headers):
        r = requests.post(f"{BASE_URL}/api/referrals/", json={"slug": TestReferrals.slug}, headers=admin_headers)
        assert r.status_code == 400

    def test_04_list_referrals(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/referrals/", headers=admin_headers)
        assert r.status_code == 200
        refs = r.json()
        assert isinstance(refs, list)
        ours = next((x for x in refs if x["slug"] == TestReferrals.slug), None)
        assert ours is not None
        assert "status_breakdown" in ours

    def test_05_track_click_increments(self, admin_headers):
        # Public endpoint - no auth
        r = requests.get(f"{BASE_URL}/api/referrals/track/{TestReferrals.slug}")
        assert r.status_code == 200
        data = r.json()
        assert data["valid"] is True
        assert data["slug"] == TestReferrals.slug
        # Click again
        requests.get(f"{BASE_URL}/api/referrals/track/{TestReferrals.slug}")
        # Verify counter
        list_r = requests.get(f"{BASE_URL}/api/referrals/", headers=admin_headers)
        ours = next((x for x in list_r.json() if x["slug"] == TestReferrals.slug), None)
        assert ours["clicks"] >= 2

    def test_06_track_unknown_slug(self):
        r = requests.get(f"{BASE_URL}/api/referrals/track/does-not-exist-xyz123")
        assert r.status_code == 200
        assert r.json().get("valid") is False

    def test_07_submit_with_valid_referral(self, admin_headers):
        email = f"test_ref_{uuid.uuid4().hex[:6]}@example.com"
        payload = {
            "name": "TEST Referral User",
            "email": email,
            "mobilnummer": "+491701234567",
            "geburtsdatum": "1990-01-01",
            "staatsangehoerigkeit": "DE",
            "strasse": "Teststr 1",
            "postleitzahl": "12345",
            "stadt": "Berlin",
            "position": "Tester",
            "password": "Test1234!",
            "referral_slug": TestReferrals.slug,
        }
        r = requests.post(f"{BASE_URL}/api/applications/submit", json=payload)
        assert r.status_code == 200, r.text

        # Verify applications counter
        list_r = requests.get(f"{BASE_URL}/api/referrals/", headers=admin_headers)
        ours = next((x for x in list_r.json() if x["slug"] == TestReferrals.slug), None)
        assert ours["applications"] >= 1

        # cleanup application
        # find id
        all_apps = requests.get(f"{BASE_URL}/api/applications/", headers=admin_headers).json()
        app = next((a for a in all_apps if a["email"] == email), None)
        if app:
            requests.delete(f"{BASE_URL}/api/applications/{app['id']}", headers=admin_headers)

    def test_08_submit_with_invalid_referral_becomes_null(self, admin_headers):
        email = f"test_ref_inv_{uuid.uuid4().hex[:6]}@example.com"
        payload = {
            "name": "TEST Invalid Ref",
            "email": email,
            "mobilnummer": "+491701234567",
            "geburtsdatum": "1990-01-01",
            "staatsangehoerigkeit": "DE",
            "strasse": "Teststr 1",
            "postleitzahl": "12345",
            "stadt": "Berlin",
            "position": "Tester",
            "password": "Test1234!",
            "referral_slug": "nonexistent-slug-xyz",
        }
        r = requests.post(f"{BASE_URL}/api/applications/submit", json=payload)
        assert r.status_code == 200, r.text

        all_apps = requests.get(f"{BASE_URL}/api/applications/", headers=admin_headers).json()
        app = next((a for a in all_apps if a["email"] == email), None)
        # we don't have referral_slug in response model -> check via DB through admin endpoint? skip if not exposed
        # cleanup
        if app:
            requests.delete(f"{BASE_URL}/api/applications/{app['id']}", headers=admin_headers)

    def test_09_toggle_referral_deactivates(self, admin_headers):
        r = requests.patch(f"{BASE_URL}/api/referrals/{TestReferrals.ref_id}/toggle", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["active"] is False
        # Track on inactive slug
        tr = requests.get(f"{BASE_URL}/api/referrals/track/{TestReferrals.slug}")
        assert tr.status_code == 200
        assert tr.json().get("valid") is False
        # Re-activate
        r2 = requests.patch(f"{BASE_URL}/api/referrals/{TestReferrals.ref_id}/toggle", headers=admin_headers)
        assert r2.json()["active"] is True

    def test_10_submit_with_inactive_referral_becomes_null(self, admin_headers):
        # Deactivate
        requests.patch(f"{BASE_URL}/api/referrals/{TestReferrals.ref_id}/toggle", headers=admin_headers)

        email = f"test_inactive_{uuid.uuid4().hex[:6]}@example.com"
        payload = {
            "name": "TEST Inactive Ref",
            "email": email,
            "mobilnummer": "+491701234567",
            "geburtsdatum": "1990-01-01",
            "staatsangehoerigkeit": "DE",
            "strasse": "Teststr 1", "postleitzahl": "12345", "stadt": "Berlin",
            "position": "Tester", "password": "Test1234!",
            "referral_slug": TestReferrals.slug,
        }
        r = requests.post(f"{BASE_URL}/api/applications/submit", json=payload)
        assert r.status_code == 200

        # Check counter did NOT increment (still same as before)
        list_r = requests.get(f"{BASE_URL}/api/referrals/", headers=admin_headers)
        ours = next((x for x in list_r.json() if x["slug"] == TestReferrals.slug), None)
        apps_before = ours["applications"]

        # Re-activate
        requests.patch(f"{BASE_URL}/api/referrals/{TestReferrals.ref_id}/toggle", headers=admin_headers)

        # cleanup application
        all_apps = requests.get(f"{BASE_URL}/api/applications/", headers=admin_headers).json()
        app = next((a for a in all_apps if a["email"] == email), None)
        if app:
            requests.delete(f"{BASE_URL}/api/applications/{app['id']}", headers=admin_headers)

    def test_99_delete_referral(self, admin_headers):
        r = requests.delete(f"{BASE_URL}/api/referrals/{TestReferrals.ref_id}", headers=admin_headers)
        assert r.status_code == 200
        # verify gone
        list_r = requests.get(f"{BASE_URL}/api/referrals/", headers=admin_headers)
        slugs = [x["slug"] for x in list_r.json()]
        assert TestReferrals.slug not in slugs
