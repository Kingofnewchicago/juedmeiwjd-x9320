"""Supplementary probes for the iteration_29 re-verification.

Focus: remaining LOW finding from iteration_28 (untyped `data: dict` bodies) and
robustness of the newly fixed endpoints against malformed input (must not 500).
"""
import os
import uuid

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
BASE = (os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")).rstrip("/")
API = f"{BASE}/api"

ADMIN_EMAIL = "admin@webora.de"
ADMIN_PASSWORD = "Kp9!xRv2Lq@Zm7Tn4&Q"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def admin_h(s):
    r = s.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.fail(f"admin login failed {r.status_code} {r.text[:200]}")
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture(scope="module")
def applicant(s):
    email = f"TEST_sec_X_{uuid.uuid4().hex[:6]}@qamail.de"
    pw = "TestPass123!"
    r = s.post(f"{API}/applications/submit", json={
        "name": "Sec Test X", "email": email, "password": pw,
        "mobilnummer": "+491234567890", "geburtsdatum": "1990-01-01",
        "staatsangehoerigkeit": "Deutsch", "strasse": "Teststr 1",
        "postleitzahl": "10115", "stadt": "Berlin", "position": "Kundenberater"})
    assert r.status_code == 200, r.text[:200]
    app_id = r.json()["id"]
    r = s.post(f"{API}/applications/login", json={"email": email, "password": pw})
    assert r.status_code == 200
    yield {"email": email, "id": app_id, "h": {"Authorization": f"Bearer {r.json()['access_token']}"}}


@pytest.fixture(scope="module", autouse=True)
def cleanup(s, admin_h):
    yield
    try:
        for a in s.get(f"{API}/applications/", headers=admin_h).json():
            if str(a.get("email", "")).startswith("TEST_sec_"):
                s.delete(f"{API}/applications/{a['id']}", headers=admin_h)
    except Exception:
        pass


# --- untyped `data: dict` admin endpoints: must not 500 on malformed types ---
@pytest.mark.parametrize("path,body", [
    ("/admin/tasks/does-not-exist/category", {"category": {"$ne": None}}),
    ("/admin/tasks/does-not-exist/category", {}),
    ("/admin/tasks/does-not-exist/credentials", {"username": ["a"], "password": 5}),
    ("/admin/tasks/does-not-exist/credentials", {}),
    ("/admin/tasks/does-not-exist/assign", {"employee_id": {"$ne": None}}),
    ("/admin/tasks/does-not-exist/assign", {}),
])
def test_admin_untyped_dict_bodies_no_500(s, admin_h, path, body):
    r = s.put(f"{API}{path}", headers=admin_h, json=body)
    assert r.status_code < 500, f"PUT {path} body={body} -> {r.status_code} {r.text[:300]}"


@pytest.mark.parametrize("body", [
    {"signature_data": 123, "iban": None},
    {"signature_data": {"$ne": None}, "iban": {"$ne": None}},
    {},
    {"signature_data": "x" * 10, "iban": ["DE02"]},
])
def test_sign_contract_untyped_body_no_500(s, applicant, body):
    r = s.post(f"{API}/applications/sign-contract", headers=applicant["h"], json=body)
    assert r.status_code < 500, f"sign-contract body={body} -> {r.status_code} {r.text[:300]}"


@pytest.mark.parametrize("body", [
    {"title": {"$ne": None}},
    {"content": 12345},
    {},
])
def test_contract_template_untyped_body_no_500(s, admin_h, body):
    r = s.put(f"{API}/applications/contract-templates/vollzeit", headers=admin_h, json=body)
    assert r.status_code < 500, f"contract-templates body={body} -> {r.status_code} {r.text[:300]}"


# --- robustness of the newly fixed endpoints ---
@pytest.mark.parametrize("payload", [
    '{"email": "a@b.de", "password": "x"',   # malformed JSON
    'not json at all',
])
def test_applicant_login_malformed_json_no_500(s, payload):
    r = s.post(f"{API}/applications/login", data=payload,
               headers={"Content-Type": "application/json"})
    assert r.status_code in (400, 422), f"{r.status_code} {r.text[:200]}"


def test_applicant_login_case_and_operator_in_email_string(s, applicant):
    """A string that merely *looks* like an operator must not match anything."""
    r = s.post(f"{API}/applications/login",
               json={"email": "$ne@qamail.de", "password": "x"})
    assert r.status_code in (401, 422), f"{r.status_code} {r.text[:200]}"


def test_employee_document_download_nonexistent_contract(s, applicant):
    r = s.get(f"{API}/employee/documents/contract-{uuid.uuid4().hex}/download", headers=applicant["h"])
    assert r.status_code in (403, 404), f"{r.status_code} {r.text[:200]}"


def test_telegram_webhook_removed_and_no_subscriber_side_effect(s, admin_h):
    """Endpoint removed (iteration_30): unreachable and must not register a subscriber."""
    chat_id = 987654321
    r = s.post(f"{API}/chat/telegram/webhook",
               headers={"X-Telegram-Bot-Api-Secret-Token": "nope"},
               json={"message": {"text": "/start", "chat": {"id": chat_id},
                                 "from": {"first_name": "Attacker"}}})
    assert r.status_code in (404, 405), f"{r.status_code} {r.text[:200]}"
    r2 = s.post(f"{API}/chat/telegram/webhook",
                json={"message": {"text": "/start", "chat": {"id": chat_id},
                                  "from": {"first_name": "Attacker"}}})
    assert r2.status_code in (404, 405), f"{r2.status_code} {r2.text[:200]}"

    # verify no subscriber persisted in DB
    try:
        from pymongo import MongoClient
        env = dotenv_values("/app/backend/.env")
        mc = MongoClient(env["MONGO_URL"], serverSelectionTimeoutMS=5000)
        count = mc[env["DB_NAME"]].telegram_subscribers.count_documents({"chat_id": chat_id})
        mc.close()
        assert count == 0, f"attacker chat_id registered as telegram subscriber ({count} docs)"
    except ImportError:
        pytest.skip("pymongo unavailable")


def test_test_session_public_endpoints_reject_admin_paths(s):
    """Path-ish tokens must not traverse into the admin listing."""
    for tok in ["..", "%2e%2e", "../"]:
        r = s.get(f"{API}/test-sessions/public/{tok}")
        assert r.status_code in (400, 401, 403, 404, 405, 422), f"token={tok} -> {r.status_code} {r.text[:150]}"
