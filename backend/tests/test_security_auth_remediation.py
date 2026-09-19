"""Security remediation tests: JWT auth enforcement on admin/data endpoints.

Validates:
- Bogus/invalid Bearer tokens rejected (401/403) on admin+contract endpoints
- Token signed with old hardcoded secret rejected
- Applicant token forbidden on admin endpoints (403)
- Legit admin/applicant flows still work
- BOLA: applicant cannot read another applicant's contract
"""
import os
import uuid
import time
import pytest
import requests
import jwt as pyjwt  # PyJWT for forging tokens
from datetime import datetime, timedelta

from dotenv import dotenv_values

_frontend_env = dotenv_values("/app/frontend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL")
            or _frontend_env.get("REACT_APP_BACKEND_URL", "")).rstrip("/")
assert BASE_URL, "REACT_APP_BACKEND_URL must be set"
API = f"{BASE_URL}/api"

OLD_SECRET = "your-secret-key-change-in-production-2026"
ADMIN_EMAIL = "admin@webora.de"
ADMIN_PASSWORD = "Kp9!xRv2Lq@Zm7Tn4&Q"

# ---------------- Fixtures ----------------

@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def admin_token(s):
    r = s.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    tok = r.json().get("access_token")
    assert tok
    return tok


@pytest.fixture(scope="module")
def applicant(s):
    """Create fresh applicant and login. Returns dict with token, email, app_id."""
    email = f"TEST_sec_{uuid.uuid4().hex[:8]}@example.com"
    password = "TestPass123!"
    payload = {
        "name": "Sec Test",
        "email": email,
        "password": password,
        "mobilnummer": "+491234567890",
        "geburtsdatum": "1990-01-01",
        "staatsangehoerigkeit": "Deutsch",
        "strasse": "Teststr 1",
        "postleitzahl": "10115",
        "stadt": "Berlin",
        "position": "Kundenberater",
    }
    r = s.post(f"{API}/applications/submit", json=payload)
    assert r.status_code == 200, f"Submit failed: {r.status_code} {r.text}"
    app_id = r.json()["id"]

    r = s.post(f"{API}/applications/login", json={"email": email, "password": password})
    assert r.status_code == 200, f"Applicant login failed: {r.status_code} {r.text}"
    return {"token": r.json()["access_token"], "email": email, "id": app_id, "password": password}


@pytest.fixture(scope="module")
def existing_app_id(s, admin_token):
    """Grab any existing application id (from admin list) for admin-endpoint targeting."""
    r = s.get(f"{API}/applications/", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    apps = r.json()
    assert len(apps) > 0, "Need at least one application in DB"
    return apps[0]["id"]


def _forge_old_admin_token():
    return pyjwt.encode(
        {"sub": ADMIN_EMAIL, "role": "admin", "exp": datetime.utcnow() + timedelta(hours=1)},
        OLD_SECRET,
        algorithm="HS256",
    )


# ---------------- 1) Bogus bearer rejected on admin/contract endpoints ----------------

BOGUS_HEADERS = {"Authorization": "Bearer faketoken"}

ADMIN_ENDPOINTS_GET = [
    "/applications/",
    "/contracts/",
]

@pytest.mark.parametrize("path", ADMIN_ENDPOINTS_GET)
def test_bogus_token_rejected_admin_get(s, path):
    r = s.get(f"{API}{path}", headers=BOGUS_HEADERS)
    assert r.status_code in (401, 403), f"{path} accepted bogus token: {r.status_code} {r.text[:200]}"


def test_bogus_token_rejected_accept(s, existing_app_id):
    r = s.post(f"{API}/applications/{existing_app_id}/accept", headers=BOGUS_HEADERS)
    assert r.status_code in (401, 403)


def test_bogus_token_rejected_unlock(s, existing_app_id):
    r = s.post(f"{API}/applications/{existing_app_id}/unlock", headers=BOGUS_HEADERS)
    assert r.status_code in (401, 403)


def test_bogus_token_rejected_contract_type(s, existing_app_id):
    r = s.put(
        f"{API}/applications/{existing_app_id}/contract-type",
        headers=BOGUS_HEADERS,
        json={"contract_type": "vollzeit"},
    )
    assert r.status_code in (401, 403)


def test_bogus_token_rejected_delete_application(s, existing_app_id):
    r = s.delete(f"{API}/applications/{existing_app_id}", headers=BOGUS_HEADERS)
    assert r.status_code in (401, 403)


def test_bogus_token_rejected_delete_verification(s, existing_app_id):
    r = s.delete(f"{API}/applications/verification/{existing_app_id}", headers=BOGUS_HEADERS)
    assert r.status_code in (401, 403)


def test_bogus_token_rejected_verification_image(s, existing_app_id):
    r = s.get(f"{API}/applications/verification/{existing_app_id}/front", headers=BOGUS_HEADERS)
    assert r.status_code in (401, 403)


def test_bogus_token_rejected_contract_create(s):
    payload = {
        "employee_id": "x",
        "employee_name": "x",
        "employee_email": "x@x.com",
        "position": "x",
        "start_date": "2026-01-01",
        "salary": "3000",
    }
    r = s.post(f"{API}/contracts/create", headers=BOGUS_HEADERS, json=payload)
    assert r.status_code in (401, 403)


def test_bogus_token_rejected_contract_get(s):
    r = s.get(f"{API}/contracts/nonexistent-id", headers=BOGUS_HEADERS)
    assert r.status_code in (401, 403)


def test_bogus_token_rejected_contract_download(s):
    r = s.get(f"{API}/contracts/nonexistent-id/download", headers=BOGUS_HEADERS)
    assert r.status_code in (401, 403)


def test_bogus_token_rejected_contract_sign(s):
    r = s.post(
        f"{API}/contracts/nonexistent-id/sign",
        headers=BOGUS_HEADERS,
        json={"signature_data": "data:image/png;base64,AAAA", "iban": "DE00"},
    )
    assert r.status_code in (401, 403)


# ---------------- 2) Old-secret forged admin token rejected ----------------

def test_old_secret_token_rejected_on_list_applications(s):
    tok = _forge_old_admin_token()
    r = s.get(f"{API}/applications/", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code in (401, 403), f"Old-secret token still works! {r.status_code}"


def test_old_secret_token_rejected_on_delete_application(s, existing_app_id):
    tok = _forge_old_admin_token()
    r = s.delete(
        f"{API}/applications/{existing_app_id}",
        headers={"Authorization": f"Bearer {tok}"},
    )
    assert r.status_code in (401, 403), f"Old-secret token DELETE accepted! {r.status_code}"


# ---------------- 3) Applicant token forbidden on admin endpoints ----------------

def test_applicant_token_forbidden_list_applications(s, applicant):
    r = s.get(f"{API}/applications/", headers={"Authorization": f"Bearer {applicant['token']}"})
    assert r.status_code == 403, f"Expected 403, got {r.status_code}: {r.text[:200]}"


def test_applicant_token_forbidden_accept(s, applicant, existing_app_id):
    r = s.post(
        f"{API}/applications/{existing_app_id}/accept",
        headers={"Authorization": f"Bearer {applicant['token']}"},
    )
    assert r.status_code == 403


def test_applicant_token_forbidden_contracts_list(s, applicant):
    r = s.get(f"{API}/contracts/", headers={"Authorization": f"Bearer {applicant['token']}"})
    assert r.status_code == 403


# ---------------- 4) Legit admin flow ----------------

def test_admin_can_list_applications(s, admin_token):
    r = s.get(f"{API}/applications/", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_admin_can_list_contracts(s, admin_token):
    r = s.get(f"{API}/contracts/", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ---------------- 5) Legit applicant flow ----------------

def test_applicant_can_get_status(s, applicant):
    r = s.get(f"{API}/applications/status", headers={"Authorization": f"Bearer {applicant['token']}"})
    assert r.status_code == 200
    data = r.json()
    assert data.get("email") == applicant["email"]


def test_applicant_can_get_my_contract(s, applicant):
    r = s.get(
        f"{API}/applications/my-contract",
        headers={"Authorization": f"Bearer {applicant['token']}"},
    )
    # 200 either with contract or a "no contract yet" style response — must NOT be 401/403/500
    assert r.status_code == 200, f"my-contract broken: {r.status_code} {r.text[:200]}"


# ---------------- 6) BOLA: applicant cannot read another applicant's contract ----------------

def test_bola_applicant_cannot_read_other_contract(s, admin_token, applicant):
    """Admin creates a contract for a DIFFERENT employee_email, then applicant tries to GET it."""
    other_email = f"TEST_other_{uuid.uuid4().hex[:6]}@example.com"
    payload = {
        "employee_id": f"emp-{uuid.uuid4().hex[:6]}",
        "employee_name": "Other Person",
        "employee_email": other_email,
        "position": "Kundenberater",
        "start_date": "2026-02-01",
        "salary": "3000",
        "working_hours": "40",
    }
    r = s.post(
        f"{API}/contracts/create",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=payload,
    )
    assert r.status_code == 200, f"Admin contract create failed: {r.status_code} {r.text[:200]}"
    contract_id = r.json().get("id") or r.json().get("contract", {}).get("id") or r.json().get("contract_id")
    # Try various keys
    if not contract_id:
        for k in ("id", "contract_id"):
            if k in r.json():
                contract_id = r.json()[k]
                break
    assert contract_id, f"No contract id in response: {r.json()}"

    # Applicant tries to read it — should be 403
    r2 = s.get(
        f"{API}/contracts/{contract_id}",
        headers={"Authorization": f"Bearer {applicant['token']}"},
    )
    assert r2.status_code == 403, f"BOLA! Applicant read other's contract: {r2.status_code} {r2.text[:200]}"

    # Also verify download blocked
    r3 = s.get(
        f"{API}/contracts/{contract_id}/download",
        headers={"Authorization": f"Bearer {applicant['token']}"},
    )
    assert r3.status_code == 403, f"BOLA download! {r3.status_code}"


# ---------------- Cleanup ----------------

def test_zzz_cleanup_test_applicant(s, admin_token, applicant):
    """Delete the throwaway applicant we created."""
    r = s.delete(
        f"{API}/applications/{applicant['id']}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code in (200, 204, 404)
