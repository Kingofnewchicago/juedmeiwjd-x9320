"""FULL security audit (2026-07): authn/authz/RBAC/IDOR probes across all API endpoints.

Modules covered: admin, applications, contracts, employee, email_inbox, anosim,
test_sessions, referrals, quiz, chat.
"""
import os
import uuid
from datetime import datetime, timedelta

import jwt as pyjwt
import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
BASE = (os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")).rstrip("/")
API = f"{BASE}/api"

ADMIN_EMAIL = "admin@webora.de"
ADMIN_PASSWORD = "Kp9!xRv2Lq@Zm7Tn4&Q"
EMP_EMAIL = "mitarbeiter@precision-labs.de"
EMP_PASSWORD = "Mitarbeiter123!"

WRONG_SECRET = "your-secret-key-change-in-production-2026"
OK = (401, 403)


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.fail(f"Admin login failed: {r.status_code} {r.text[:300]}")
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def admin_h(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def employee_token(s):
    r = s.post(f"{API}/employee/login", json={"email": EMP_EMAIL, "password": EMP_PASSWORD})
    if r.status_code != 200:
        pytest.fail(f"Employee login failed: {r.status_code} {r.text[:300]}")
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def emp_h(employee_token):
    return {"Authorization": f"Bearer {employee_token}"}


def _mk_applicant(s, tag):
    email = f"TEST_sec_{tag}_{uuid.uuid4().hex[:6]}@qamail.de"
    pw = "TestPass123!"
    payload = {
        "name": f"Sec Test {tag}", "email": email, "password": pw,
        "mobilnummer": "+491234567890", "geburtsdatum": "1990-01-01",
        "staatsangehoerigkeit": "Deutsch", "strasse": "Teststr 1",
        "postleitzahl": "10115", "stadt": "Berlin", "position": "Kundenberater",
    }
    r = s.post(f"{API}/applications/submit", json=payload)
    assert r.status_code == 200, f"submit failed {r.status_code} {r.text[:200]}"
    app_id = r.json()["id"]
    r = s.post(f"{API}/applications/login", json={"email": email, "password": pw})
    assert r.status_code == 200, f"applicant login failed {r.status_code} {r.text[:200]}"
    return {"email": email, "id": app_id, "token": r.json()["access_token"],
            "h": {"Authorization": f"Bearer {r.json()['access_token']}"}}


@pytest.fixture(scope="session")
def applicant_a(s):
    return _mk_applicant(s, "A")


@pytest.fixture(scope="session")
def applicant_b(s):
    return _mk_applicant(s, "B")


@pytest.fixture(scope="session", autouse=True)
def cleanup(s, request):
    yield
    try:
        r = s.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        h = {"Authorization": f"Bearer {r.json()['access_token']}"}
        apps = s.get(f"{API}/applications/", headers=h).json()
        for a in apps:
            if str(a.get("email", "")).startswith("TEST_sec_"):
                s.delete(f"{API}/applications/{a['id']}", headers=h)
    except Exception:
        pass


# ---------- forged tokens ----------

def forged(role="admin", secret=WRONG_SECRET, exp_delta=timedelta(hours=1)):
    return pyjwt.encode(
        {"sub": ADMIN_EMAIL, "id": "admin-001", "role": role,
         "exp": datetime.utcnow() + exp_delta},
        secret, algorithm="HS256")


BAD_TOKENS = {
    "garbage": "not-a-jwt",
    "wrong_secret_admin": forged("admin"),
    "expired_wrong_secret": forged("admin", exp_delta=timedelta(hours=-2)),
    "tampered": forged("admin")[:-4] + "AAAA",
    "none_alg": pyjwt.encode({"sub": ADMIN_EMAIL, "role": "admin"}, key="", algorithm="none"),
}


# ---------- 1. Removed backdoor / demo endpoints ----------

@pytest.mark.parametrize("method,path", [
    ("post", "/admin/init-admin"),
    ("post", "/employee/init-employee"),
    ("get", "/status"),
    ("post", "/status"),
])
def test_removed_endpoints_gone(s, method, path):
    r = getattr(s, method)(f"{API}{path}", json={})
    assert r.status_code in (404, 405), f"{method.upper()} {path} still reachable: {r.status_code} {r.text[:200]}"


# ---------- 2. RBAC matrix over admin-only endpoints ----------
# (method, path, json_body)
ADMIN_ENDPOINTS = [
    ("get", "/admin/employees", None),
    ("get", "/admin/tasks", None),
    ("post", "/admin/tasks", {"title": "x", "description": "y", "category": "app"}),
    ("delete", "/admin/tasks/does-not-exist", None),
    ("put", "/admin/tasks/does-not-exist/assign", {"employee_id": "x"}),
    ("put", "/admin/tasks/does-not-exist/category", {"category": "x"}),
    ("put", "/admin/tasks/does-not-exist/credentials", {"username": "x", "password": "y"}),
    ("put", "/admin/tasks/does-not-exist/assign-multiple",
     {"assignments": [{"employee_id": "x", "employee_name": "x"}]}),
    ("get", "/admin/documents", None),
    ("get", "/admin/documents/does-not-exist/download", None),
    ("put", "/admin/documents/does-not-exist/approve", None),
    ("put", "/admin/documents/does-not-exist/reject", None),
    ("delete", "/admin/documents/does-not-exist", None),
    ("get", "/applications/", None),
    ("post", "/applications/does-not-exist/accept", None),
    ("post", "/applications/does-not-exist/unlock", None),
    ("put", "/applications/does-not-exist/contract-type", {"contract_type": "vollzeit"}),
    ("delete", "/applications/does-not-exist", None),
    ("get", "/applications/verification/does-not-exist/front", None),
    ("delete", "/applications/verification/does-not-exist", None),
    ("get", "/applications/contract-templates", None),
    ("put", "/applications/contract-templates/vollzeit", {"title": "x"}),
    ("get", "/email-inbox/accounts", None),
    ("post", "/email-inbox/accounts", {"email": "x@x.de", "app_password": "p", "provider": "gmail"}),
    ("delete", "/email-inbox/accounts/does-not-exist", None),
    ("post", "/email-inbox/assign", {"account_id": "x", "employee_id": "y"}),
    ("post", "/email-inbox/unassign/does-not-exist", None),
    ("get", "/email-inbox/stats", None),
    ("get", "/email-inbox/test/does-not-exist", None),
    ("get", "/anosim/numbers", None),
    ("post", "/anosim/assign", {"employee_id": "y", "anosim_number": "+4900000"}),
    ("post", "/anosim/unassign", {"employee_id": "y"}),
    ("get", "/anosim/assignments", None),
    ("post", "/test-sessions/create", {"title": "x"}),
    ("get", "/test-sessions/", None),
    ("delete", "/test-sessions/does-not-exist", None),
    ("post", "/referrals/", {"name": "x", "slug": "x"}),
    ("get", "/referrals/", None),
    ("delete", "/referrals/does-not-exist", None),
    ("patch", "/referrals/does-not-exist/toggle", None),
    ("get", "/quiz/admin/does-not-exist", None),
    ("post", "/quiz/admin/does-not-exist/approve", None),
    ("get", "/contracts/", None),
    ("post", "/contracts/create", {"employee_id": "x", "employee_name": "x", "employee_email": "x@x.de",
                                   "position": "x", "start_date": "2026-01-01", "salary": "3000"}),
]


def _call(s, method, path, body, headers):
    kwargs = {"headers": headers}
    if body is not None:
        kwargs["json"] = body
    return getattr(s, method)(f"{API}{path}", **kwargs)


@pytest.mark.parametrize("method,path,body", ADMIN_ENDPOINTS, ids=[f"{m.upper()} {p}" for m, p, _ in ADMIN_ENDPOINTS])
def test_admin_endpoint_requires_auth_header(s, method, path, body):
    r = _call(s, method, path, body, {})
    assert r.status_code in OK + (422,), f"NO-AUTH accepted: {r.status_code} {r.text[:200]}"


@pytest.mark.parametrize("method,path,body", ADMIN_ENDPOINTS, ids=[f"{m.upper()} {p}" for m, p, _ in ADMIN_ENDPOINTS])
def test_admin_endpoint_rejects_employee_token(s, emp_h, method, path, body):
    r = _call(s, method, path, body, emp_h)
    assert r.status_code in OK, f"EMPLOYEE token accepted: {r.status_code} {r.text[:200]}"


@pytest.mark.parametrize("kind", list(BAD_TOKENS))
@pytest.mark.parametrize("method,path,body", ADMIN_ENDPOINTS, ids=[f"{m.upper()} {p}" for m, p, _ in ADMIN_ENDPOINTS])
def test_admin_endpoint_rejects_forged_tokens(s, method, path, body, kind):
    h = {"Authorization": f"Bearer {BAD_TOKENS[kind]}"}
    r = _call(s, method, path, body, h)
    assert r.status_code in OK, f"FORGED[{kind}] accepted: {r.status_code} {r.text[:200]}"


def test_admin_verify_with_employee_token_shows_non_admin_role(s, emp_h):
    r = s.get(f"{API}/admin/verify", headers=emp_h)
    if r.status_code == 200:
        assert r.json().get("role") != "admin", "admin/verify reports admin role for employee token!"


def test_admin_verify_rejects_forged(s):
    r = s.get(f"{API}/admin/verify", headers={"Authorization": f"Bearer {BAD_TOKENS['wrong_secret_admin']}"})
    assert r.status_code in OK


# ---------- 3. IDOR / BOLA ----------

@pytest.fixture(scope="session")
def contract_of_a(s, admin_h, applicant_a):
    r = s.post(f"{API}/contracts/create", headers=admin_h, json={
        "employee_id": applicant_a["id"], "employee_name": "Sec Test A",
        "employee_email": applicant_a["email"], "position": "Kundenberater",
        "start_date": "2026-02-01", "salary": "3000", "working_hours": "40"})
    assert r.status_code == 200, f"contract create failed {r.status_code} {r.text[:200]}"
    data = r.json()
    cid = data.get("id") or data.get("contract_id") or data.get("contract", {}).get("id")
    assert cid, f"no contract id: {data}"
    return cid


def test_idor_contract_read_cross_user(s, applicant_b, contract_of_a):
    r = s.get(f"{API}/contracts/{contract_of_a}", headers=applicant_b["h"])
    assert r.status_code == 403, f"IDOR: other user read contract: {r.status_code} {r.text[:200]}"


def test_idor_contract_download_cross_user(s, applicant_b, contract_of_a):
    r = s.get(f"{API}/contracts/{contract_of_a}/download", headers=applicant_b["h"])
    assert r.status_code == 403, f"IDOR download: {r.status_code}"


def test_idor_contract_sign_cross_user(s, applicant_b, contract_of_a):
    r = s.post(f"{API}/contracts/{contract_of_a}/sign", headers=applicant_b["h"],
               json={"signature_data": "data:image/png;base64,AAAA", "iban": "DE02120300000000202051"})
    assert r.status_code == 403, f"IDOR sign: {r.status_code} {r.text[:200]}"


def test_owner_can_read_own_contract(s, applicant_a, contract_of_a):
    r = s.get(f"{API}/contracts/{contract_of_a}", headers=applicant_a["h"])
    assert r.status_code == 200, f"owner blocked: {r.status_code} {r.text[:200]}"


def test_my_contracts_scoped_to_caller(s, applicant_b):
    r = s.get(f"{API}/contracts/my-contracts", headers=applicant_b["h"])
    assert r.status_code == 200
    for c in r.json() if isinstance(r.json(), list) else r.json().get("contracts", []):
        assert c.get("employee_email") == applicant_b["email"], f"leaked other contract: {c.get('employee_email')}"


@pytest.fixture(scope="session")
def signed_contract_of_a(s, applicant_a, contract_of_a):
    """A signs their own contract so a SIGNED PDF exists (needed to prove the IDOR branch)."""
    png = ("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAF"
           "AAH/q842iQAAAABJRU5ErkJggg==")
    r = s.post(f"{API}/contracts/{contract_of_a}/sign", headers=applicant_a["h"],
               json={"signature_data": f"data:image/png;base64,{png}",
                     "iban": "DE02120300000000202051"})
    if r.status_code != 200:
        pytest.skip(f"could not sign contract for IDOR probe: {r.status_code} {r.text[:200]}")
    return contract_of_a


def test_employee_document_download_via_contract_prefix_is_owner_scoped(s, applicant_b, signed_contract_of_a):
    """employee/documents/{doc_id}/download has a `contract-` branch with NO ownership check."""
    r = s.get(f"{API}/employee/documents/{signed_contract_of_a}/download", headers=applicant_b["h"])
    assert r.status_code in (403, 404), (
        f"IDOR: employee B downloaded SIGNED contract PDF of A via "
        f"/api/employee/documents/{{contract_id}}/download: {r.status_code}")


def test_employee_documents_list_scoped(s, applicant_b):
    r = s.get(f"{API}/employee/documents", headers=applicant_b["h"])
    assert r.status_code == 200, r.text[:200]


def test_employee_document_cross_user_download_delete_denied(s, applicant_a, applicant_b):
    """Upload a document as applicant A, then try to download/delete it as applicant B."""
    files = {"file": ("TEST_sec.pdf", b"%PDF-1.4 test", "application/pdf")}
    r = s.post(f"{API}/employee/documents/upload", headers=applicant_a["h"],
               files=files, data={"category": "Sonstige"})
    if r.status_code != 200:
        pytest.skip(f"upload failed: {r.status_code} {r.text[:150]}")
    doc_id = r.json()["document"]["id"]

    r1 = s.get(f"{API}/employee/documents/{doc_id}/download", headers=applicant_b["h"])
    assert r1.status_code in (403, 404), f"IDOR doc download by other user: {r1.status_code}"
    r2 = s.delete(f"{API}/employee/documents/{doc_id}", headers=applicant_b["h"])
    assert r2.status_code in (403, 404), f"IDOR doc delete by other user: {r2.status_code}"
    # owner still has access
    r3 = s.get(f"{API}/employee/documents/{doc_id}/download", headers=applicant_a["h"])
    assert r3.status_code == 200, f"owner blocked from own document: {r3.status_code}"
    s.delete(f"{API}/employee/documents/{doc_id}", headers=applicant_a["h"])


def test_no_password_hash_leaked_in_responses(s, admin_h, applicant_b, emp_h):
    checks = [
        ("/applications/status", applicant_b["h"]),
        ("/employee/profile", emp_h),
        ("/admin/employees", admin_h),
        ("/applications/", admin_h),
        ("/email-inbox/accounts", admin_h),
    ]
    for path, h in checks:
        r = s.get(f"{API}{path}", headers=h)
        if r.status_code != 200:
            continue
        body = r.text.lower()
        for secret_field in ("password_hash", "app_password"):
            assert secret_field not in body, f"{path} leaks {secret_field}"


def test_chat_messages_only_own_conversation(s, applicant_b, applicant_a):
    r = s.get(f"{API}/chat/messages/{applicant_a['id']}", headers=applicant_b["h"])
    assert r.status_code == 200, r.text[:200]
    data = r.json()
    conv = data.get("conversation_id", "")
    assert applicant_b["id"] in conv or applicant_b["email"] in conv, f"conversation not caller-scoped: {conv}"
    for m in data.get("messages", []):
        assert applicant_b["id"] in (m.get("sender_id"), m.get("recipient_id")), "leaked foreign message"


def test_applications_status_is_own_data(s, applicant_b):
    r = s.get(f"{API}/applications/status", headers=applicant_b["h"])
    assert r.status_code == 200
    assert r.json().get("email") == applicant_b["email"]


def test_applications_status_requires_token(s):
    r = s.get(f"{API}/applications/status")
    assert r.status_code in OK


def test_my_contract_scoped(s, applicant_b):
    r = s.get(f"{API}/applications/my-contract", headers=applicant_b["h"])
    assert r.status_code in (200, 404)


def test_download_contract_query_token_rejects_forged(s):
    r = s.get(f"{API}/applications/download-contract", params={"token": BAD_TOKENS["wrong_secret_admin"]})
    assert r.status_code in OK, f"forged query token accepted: {r.status_code}"


# ---------- 4. JWT integrity ----------

@pytest.mark.parametrize("kind", list(BAD_TOKENS))
def test_jwt_rejected_on_employee_endpoints(s, kind):
    h = {"Authorization": f"Bearer {BAD_TOKENS[kind]}"}
    for path in ["/employee/tasks", "/employee/profile", "/employee/documents", "/chat/conversations",
                 "/anosim/my-number", "/email-inbox/my-codes", "/quiz/status", "/applications/status"]:
        r = s.get(f"{API}{path}", headers=h)
        assert r.status_code in OK, f"{path} accepted {kind}: {r.status_code} {r.text[:150]}"


def test_expired_valid_secret_token_rejected(s, employee_token):
    """Craft an expired token using the real secret from backend env."""
    secret = None
    try:
        from dotenv import dotenv_values as dv
        secret = dv("/app/backend/.env").get("JWT_SECRET_KEY")
    except Exception:
        pass
    if not secret:
        pytest.skip("JWT_SECRET_KEY not readable")
    tok = pyjwt.encode({"sub": EMP_EMAIL, "id": "x", "role": "employee",
                        "exp": datetime.utcnow() - timedelta(hours=1)}, secret, algorithm="HS256")
    r = s.get(f"{API}/employee/profile", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code in OK, f"expired token accepted: {r.status_code}"


def test_role_escalation_needs_valid_signature(s):
    """Role=admin but signed with wrong secret must fail."""
    r = s.get(f"{API}/applications/", headers={"Authorization": f"Bearer {forged('admin')}"})
    assert r.status_code in OK


# ---------- 5. NoSQL / operator injection ----------

def test_nosql_injection_admin_login(s):
    for payload in [{"email": {"$ne": None}, "password": {"$ne": None}},
                    {"email": {"$gt": ""}, "password": "x"}]:
        r = s.post(f"{API}/admin/login", json=payload)
        assert r.status_code in (401, 422, 429), f"NoSQL injection response: {r.status_code} {r.text[:200]}"


def test_nosql_injection_applicant_login(s):
    """POST /api/applications/login takes an untyped `credentials: dict` -> operators reach the query."""
    r = s.post(f"{API}/applications/login", json={"email": {"$ne": None}, "password": {"$ne": None}})
    assert r.status_code in (401, 422), (
        f"NoSQL operator injection reached the Mongo query (expected 401/422): "
        f"{r.status_code} {r.text[:200]}")


def test_nosql_injection_applicant_login_regex(s, applicant_a):
    r = s.post(f"{API}/applications/login",
               json={"email": {"$regex": applicant_a["email"].split("@")[0]}, "password": "wrong"})
    assert r.status_code in (401, 422), f"regex operator accepted: {r.status_code} {r.text[:200]}"


def test_path_traversal_chat_image(s):
    r = s.get(f"{API}/chat/image/..%2f..%2f..%2fetc%2fpasswd")
    assert r.status_code in (400, 403, 404), f"path traversal: {r.status_code} {r.text[:120]}"


# ---------- 6. Public endpoints ----------

def test_public_test_session_invalid_token(s):
    r = s.get(f"{API}/test-sessions/public/{uuid.uuid4().hex}")
    assert r.status_code == 404


def test_public_test_session_data_invalid_token(s):
    r = s.get(f"{API}/test-sessions/public/{uuid.uuid4().hex}/data")
    assert r.status_code in (400, 404)


def test_referral_tracking_public_minimal(s):
    r = s.get(f"{API}/referrals/track/contract-staging")
    assert r.status_code == 200, r.text[:200]
    data = r.json()
    assert set(data.keys()) <= {"valid", "slug", "name", "inactive"}, f"tracking leaks fields: {data}"


def test_public_test_session_lifecycle_and_field_scope(s, admin_h):
    r = s.post(f"{API}/test-sessions/create", headers=admin_h,
               json={"title": "TEST_sec session", "test_login_email": "sec@qamail.de",
                     "test_login_password": "secret-pw"})
    assert r.status_code == 200, f"create session failed: {r.status_code} {r.text[:200]}"
    data = r.json()
    token = data.get("token") or data.get("session", {}).get("token")
    sid = data.get("id") or data.get("session", {}).get("id")
    assert token, f"no token in response: {data}"
    # token entropy check (documented finding if short)
    assert len(token) >= 24, f"public session token too short/low-entropy: {len(token)} chars"

    r1 = s.get(f"{API}/test-sessions/public/{token}")
    assert r1.status_code == 200
    assert set(r1.json().keys()) <= {"status", "title", "started_at", "expires_at"}, r1.json()
    # data endpoint blocked before start
    r2 = s.get(f"{API}/test-sessions/public/{token}/data")
    assert r2.status_code in (400, 404), f"session data exposed before start: {r2.status_code}"
    if sid:
        s.delete(f"{API}/test-sessions/{sid}", headers=admin_h)


def test_telegram_webhook_endpoint_is_removed(s):
    """Endpoint was fully removed (iteration_30). Must be unreachable."""
    r = s.post(f"{API}/chat/telegram/webhook", json={"message": {"text": "hi", "chat": {"id": 1}}})
    assert r.status_code in (404, 405), f"telegram webhook still reachable: {r.status_code} {r.text[:200]}"
    assert not dotenv_values("/app/backend/.env").get("TELEGRAM_WEBHOOK_SECRET"), \
        "TELEGRAM_WEBHOOK_SECRET should be removed from backend/.env"


# ---------- 7. RE-VERIFICATION of iteration_28 fixes ----------

# FIX #1 - contract download ownership (owner + admin must still work)
def test_owner_can_download_own_contract_via_employee_route(s, applicant_a, signed_contract_of_a):
    r = s.get(f"{API}/employee/documents/{signed_contract_of_a}/download", headers=applicant_a["h"])
    assert r.status_code == 200, f"OWNER blocked from own signed contract: {r.status_code} {r.text[:200]}"
    assert r.headers.get("content-type", "").startswith("application/pdf"), r.headers.get("content-type")


def test_admin_can_download_contract_via_employee_route(s, admin_h, signed_contract_of_a):
    r = s.get(f"{API}/employee/documents/{signed_contract_of_a}/download", headers=admin_h)
    assert r.status_code == 200, f"ADMIN blocked from signed contract: {r.status_code} {r.text[:200]}"


def test_contract_download_via_employee_route_requires_auth(s, signed_contract_of_a):
    r = s.get(f"{API}/employee/documents/{signed_contract_of_a}/download")
    assert r.status_code in OK, f"no-auth contract download: {r.status_code}"


@pytest.mark.parametrize("kind", list(BAD_TOKENS))
def test_contract_download_via_employee_route_rejects_forged(s, signed_contract_of_a, kind):
    h = {"Authorization": f"Bearer {BAD_TOKENS[kind]}"}
    r = s.get(f"{API}/employee/documents/{signed_contract_of_a}/download", headers=h)
    assert r.status_code in OK, f"forged[{kind}] contract download: {r.status_code}"


# FIX #2 - applicant login typed body
def test_applicant_login_injection_returns_422(s):
    r = s.post(f"{API}/applications/login", json={"email": {"$ne": None}, "password": {"$ne": None}})
    assert r.status_code == 422, f"expected 422 validation error, got {r.status_code} {r.text[:200]}"


def test_applicant_login_valid_credentials_still_work(s, applicant_a):
    """applicant_a fixture already logs in; re-login explicitly to prove no regression."""
    assert applicant_a["token"], "applicant login token missing"
    r = s.post(f"{API}/applications/login", json={"email": applicant_a["email"], "password": "TestPass123!"})
    assert r.status_code == 200, f"valid applicant login broken: {r.status_code} {r.text[:200]}"
    assert r.json().get("access_token")
    assert r.json()["applicant"]["email"] == applicant_a["email"]
    assert "password_hash" not in r.text


def test_applicant_login_wrong_password_401(s, applicant_a):
    r = s.post(f"{API}/applications/login", json={"email": applicant_a["email"], "password": "totally-wrong"})
    assert r.status_code == 401, f"expected 401, got {r.status_code} {r.text[:200]}"


@pytest.mark.parametrize("body", [
    {"email": "not-an-email", "password": "x"},
    {"email": "a@b.de"},
    {"password": "x"},
    {},
    {"email": ["a@b.de"], "password": "x"},
    {"email": "a@b.de", "password": {"$ne": None}},
])
def test_applicant_login_malformed_bodies_are_422(s, body):
    r = s.post(f"{API}/applications/login", json=body)
    assert r.status_code == 422, f"body {body} -> {r.status_code} {r.text[:200]}"


# FIX #3 - session token entropy + full public lifecycle
def test_session_token_entropy_and_full_public_lifecycle(s, admin_h):
    r = s.post(f"{API}/test-sessions/create", headers=admin_h, json={
        "title": "TEST_sec lifecycle", "test_login_email": "sec-life@qamail.de",
        "test_login_password": "secret-pw"})
    assert r.status_code == 200, f"create session failed: {r.status_code} {r.text[:200]}"
    data = r.json()
    token = data.get("token") or data.get("session", {}).get("token")
    sid = data.get("id") or data.get("session", {}).get("id")
    assert token, f"no token: {data}"
    assert len(token) >= 32, f"token too short ({len(token)}): {token}"
    try:
        # public info before start
        r1 = s.get(f"{API}/test-sessions/public/{token}")
        assert r1.status_code == 200, f"public info: {r1.status_code} {r1.text[:200]}"
        assert "test_login_password" not in r1.text, f"credentials leaked before start: {r1.text[:300]}"

        # data blocked before start
        r2 = s.get(f"{API}/test-sessions/public/{token}/data")
        assert r2.status_code == 400, f"expected 400 before start, got {r2.status_code} {r2.text[:200]}"

        # start
        r3 = s.post(f"{API}/test-sessions/public/{token}/start")
        assert r3.status_code == 200, f"start failed: {r3.status_code} {r3.text[:200]}"

        # data available after start
        r4 = s.get(f"{API}/test-sessions/public/{token}/data")
        assert r4.status_code == 200, f"data after start: {r4.status_code} {r4.text[:200]}"

        # invalid token still 404
        r5 = s.get(f"{API}/test-sessions/public/{uuid.uuid4().hex}")
        assert r5.status_code == 404
        r6 = s.post(f"{API}/test-sessions/public/{uuid.uuid4().hex}/start")
        assert r6.status_code == 404, f"invalid start token: {r6.status_code}"
    finally:
        if sid:
            s.delete(f"{API}/test-sessions/{sid}", headers=admin_h)


def test_session_tokens_are_unique(s, admin_h):
    tokens, sids = set(), []
    try:
        for _ in range(3):
            r = s.post(f"{API}/test-sessions/create", headers=admin_h, json={"title": "TEST_sec uniq"})
            assert r.status_code == 200
            d = r.json()
            tokens.add(d.get("token") or d.get("session", {}).get("token"))
            sid = d.get("id") or d.get("session", {}).get("id")
            if sid:
                sids.append(sid)
        assert len(tokens) == 3, f"duplicate session tokens: {tokens}"
    finally:
        for sid in sids:
            s.delete(f"{API}/test-sessions/{sid}", headers=admin_h)


# FIX #4 - telegram webhook removed entirely (iteration_30)
@pytest.mark.parametrize("headers", [
    {},
    {"X-Telegram-Bot-Api-Secret-Token": "wrong-secret-value"},
    {"X-Telegram-Bot-Api-Secret-Token": ""},
])
def test_telegram_webhook_unreachable_with_any_headers(s, headers):
    r = s.post(f"{API}/chat/telegram/webhook", headers=headers,
               json={"message": {"text": "/start", "chat": {"id": 999000111},
                                 "from": {"first_name": "Attacker"}}})
    assert r.status_code in (404, 405), f"webhook reachable with headers={headers}: {r.status_code} {r.text[:200]}"


@pytest.mark.parametrize("method", ["get", "put", "delete", "patch"])
def test_telegram_webhook_other_methods_unreachable(s, method):
    r = getattr(s, method)(f"{API}/chat/telegram/webhook")
    assert r.status_code in (404, 405), f"{method.upper()} webhook -> {r.status_code} {r.text[:150]}"
