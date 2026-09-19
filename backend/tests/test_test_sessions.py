"""Test Test-Sessions flow: create, start, get data (SMS forwarding fix verification)."""
import os
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
ADMIN_EMAIL = "admin@webora.de"
ADMIN_PASSWORD = "Kp9!xRv2Lq@Zm7Tn4&Q"

# Direct MongoDB access for verification
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")


@pytest.fixture(scope="module")
def db():
    client = MongoClient(MONGO_URL)
    return client[DB_NAME]


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/admin/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                      timeout=15)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    token = data.get("access_token") or data.get("token")
    assert token, f"No token returned: {data}"
    return token


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# === Admin login ===
def test_admin_login_works(admin_token):
    assert isinstance(admin_token, str) and len(admin_token) > 10


# === Create session with anosim booking id persists correctly ===
def test_create_session_persists_booking_id(auth_headers, db):
    payload = {
        "title": "TEST_SMS_Fix_Session",
        "anosim_number": "+491234567890",
        "anosim_booking_id": "12345678",
        "test_login_email": "testuser@example.com",
        "test_login_password": "TestPass123",
        "test_ident_link": "https://example.com/ident",
        "notes": "Automated test session"
    }
    r = requests.post(f"{BASE_URL}/api/test-sessions/create", json=payload, headers=auth_headers, timeout=15)
    assert r.status_code == 200, f"Create failed: {r.status_code} {r.text}"
    session_info = r.json().get("session")
    assert session_info, f"No session in response: {r.json()}"
    session_id = session_info["id"]
    session_token = session_info["token"]

    # Verify MongoDB doc
    doc = db.test_sessions.find_one({"id": session_id})
    assert doc, "Session not found in DB"
    assert doc["anosim_number"] == "+491234567890"
    assert doc["anosim_booking_id"] == "12345678", f"booking_id missing: {doc.get('anosim_booking_id')!r}"
    assert doc["test_login_email"] == "testuser@example.com"
    assert doc["status"] == "waiting"

    # store for later tests
    pytest.session_token_with_booking = session_token
    pytest.session_id_with_booking = session_id


# === Waiting session /data returns 400 ===
def test_data_before_start_returns_400():
    token = pytest.session_token_with_booking
    r = requests.get(f"{BASE_URL}/api/test-sessions/public/{token}/data", timeout=15)
    assert r.status_code == 400, f"Expected 400 for non-active, got {r.status_code} {r.text}"


# === Start session sets expires_at ~ started_at + 1h ===
def test_start_session_activates(db):
    token = pytest.session_token_with_booking
    r = requests.post(f"{BASE_URL}/api/test-sessions/public/{token}/start", timeout=15)
    assert r.status_code == 200, f"Start failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["status"] == "active"
    assert data["started_at"] and data["expires_at"]

    from datetime import datetime
    started = datetime.fromisoformat(data["started_at"])
    expires = datetime.fromisoformat(data["expires_at"])
    diff_min = (expires - started).total_seconds() / 60
    assert 59 <= diff_min <= 61, f"Expected ~60 min diff, got {diff_min}"

    # DB check
    doc = db.test_sessions.find_one({"token": token})
    assert doc["status"] == "active"
    assert doc["started_at"] and doc["expires_at"]


# === /data normalized response with booking_id path ===
def test_get_data_normalized_sms_format():
    token = pytest.session_token_with_booking
    r = requests.get(f"{BASE_URL}/api/test-sessions/public/{token}/data", timeout=30)
    assert r.status_code == 200, f"/data failed: {r.status_code} {r.text}"
    data = r.json()
    # Must include sms_messages as array (can be empty)
    assert "sms_messages" in data
    assert isinstance(data["sms_messages"], list)
    assert "emails" in data
    assert isinstance(data["emails"], list)
    # Login data should be present
    assert data.get("test_login_email") == "testuser@example.com"
    assert data.get("test_login_password") == "TestPass123"
    assert data.get("test_ident_link") == "https://example.com/ident"
    assert data.get("anosim_number") == "+491234567890"

    # If any SMS present, verify normalized fields
    for m in data["sms_messages"]:
        assert "sender" in m
        assert "text" in m
        assert "received_at" in m
        assert "code" in m  # may be None


# === Fallback: number without booking_id ===
def test_create_session_with_number_only_fallback(auth_headers, db):
    payload = {
        "title": "TEST_SMS_Fallback_Session",
        "anosim_number": "+491111111111",
        "anosim_booking_id": "",  # empty -> fallback path
    }
    r = requests.post(f"{BASE_URL}/api/test-sessions/create", json=payload, headers=auth_headers, timeout=15)
    assert r.status_code == 200
    sess = r.json()["session"]
    tok = sess["token"]

    # Start
    r2 = requests.post(f"{BASE_URL}/api/test-sessions/public/{tok}/start", timeout=15)
    assert r2.status_code == 200

    # Get data - fallback path; must not 500
    r3 = requests.get(f"{BASE_URL}/api/test-sessions/public/{tok}/data", timeout=30)
    assert r3.status_code == 200, f"Fallback /data failed: {r3.status_code} {r3.text}"
    d = r3.json()
    assert isinstance(d.get("sms_messages"), list)

    pytest.session_id_fallback = sess["id"]


# === List sessions (admin) ===
def test_list_sessions(auth_headers):
    r = requests.get(f"{BASE_URL}/api/test-sessions/", headers=auth_headers, timeout=15)
    assert r.status_code == 200
    sessions = r.json()
    assert isinstance(sessions, list)
    titles = [s.get("title") for s in sessions]
    assert "TEST_SMS_Fix_Session" in titles


# === Invalid token returns 404 ===
def test_invalid_token_returns_404():
    r = requests.get(f"{BASE_URL}/api/test-sessions/public/nonexistenttoken/data", timeout=15)
    assert r.status_code == 404


# === Missing auth returns 401 ===
def test_create_without_auth_returns_401():
    r = requests.post(f"{BASE_URL}/api/test-sessions/create", json={"title": "X"}, timeout=15)
    assert r.status_code in (401, 403)


# === Cleanup ===
def test_cleanup_sessions(auth_headers, db):
    for sid in [getattr(pytest, "session_id_with_booking", None),
                getattr(pytest, "session_id_fallback", None)]:
        if sid:
            requests.delete(f"{BASE_URL}/api/test-sessions/{sid}", headers=auth_headers, timeout=10)
    db.test_sessions.delete_many({"title": {"$regex": "^TEST_SMS_"}})
