"""
Tests for the Datenschutz clause presence in all 5 employment contracts,
plus integration test for teilzeit contract full flow.
"""
import os
import sys
import uuid
import base64
import requests
import pytest

# Ensure backend imports work for unit tests
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Load backend env (JWT_SECRET_KEY etc.) before importing backend modules
from dotenv import load_dotenv  # noqa: E402

load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env")))

from routes.applications import _build_contract_html_parts  # noqa: E402

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Fallback to reading from frontend/.env for local testing
    env_path = "/app/frontend/.env"
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().strip('"')
                    break
BASE_URL = (BASE_URL or "").rstrip("/")

ADMIN_EMAIL = "admin@webora.de"
ADMIN_PASSWORD = "Kp9!xRv2Lq@Zm7Tn4&Q"

EMPLOYMENT_CONTRACT_TYPES = ["vollzeit", "teilzeit", "minijob", "vollzeit_at", "teilzeit_at"]
DATENSCHUTZ_HEADER = "Datenschutz, Datensicherheit und ausschließliche Testzwecke"


# ---------------- Unit tests: _build_contract_html_parts ----------------

@pytest.mark.parametrize("ctype", EMPLOYMENT_CONTRACT_TYPES)
def test_employment_contract_contains_datenschutz_header(ctype):
    subtitle, html = _build_contract_html_parts(ctype, "01.01.2026")
    assert DATENSCHUTZ_HEADER in html, (
        f"[{ctype}] Missing Datenschutz header. Subtitle={subtitle!r}"
    )


@pytest.mark.parametrize("ctype", EMPLOYMENT_CONTRACT_TYPES)
def test_employment_contract_contains_all_5_paragraphs(ctype):
    _, html = _build_contract_html_parts(ctype, "01.01.2026")
    # Locate the Datenschutz section and check for markers (1)..(5)
    idx = html.find(DATENSCHUTZ_HEADER)
    assert idx >= 0, f"[{ctype}] header not found"
    section = html[idx:]
    for marker in ["(1)", "(2)", "(3)", "(4)", "(5)"]:
        assert marker in section, f"[{ctype}] Paragraph {marker} missing in Datenschutz section"
    # Check key phrases from the clause
    assert "DSGVO" in section, f"[{ctype}] DSGVO reference missing"
    assert "Art. 32" in section, f"[{ctype}] Art. 32 reference missing"


def test_teilzeit_specific_terms():
    _, html = _build_contract_html_parts("teilzeit", "01.01.2026")
    # 20 Stunden per week
    assert "20 Stunden" in html, "Teilzeit: '20 Stunden' weekly not found"
    # 2.200,00 EUR brutto
    assert "2.200,00" in html, "Teilzeit: '2.200,00' base salary not found"
    # drei Monate probation
    assert "drei Monate" in html, "Teilzeit: 'drei Monate' probation not found"


def test_freiberufler_at_is_not_employment_contract():
    # This is a Werkvertrag/freelance contract; datenschutz clause not required.
    # Just verify it renders without exception.
    subtitle, html = _build_contract_html_parts("freiberufler_at", "01.01.2026")
    assert isinstance(html, str) and len(html) > 100


# ---------------- Integration test: end-to-end teilzeit flow ----------------

@pytest.fixture(scope="module")
def admin_token():
    if not BASE_URL:
        pytest.skip("BASE_URL not configured")
    r = requests.post(
        f"{BASE_URL}/api/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=15,
    )
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def test_applicant():
    """Create a fresh applicant for teilzeit contract flow."""
    if not BASE_URL:
        pytest.skip("BASE_URL not configured")
    unique = uuid.uuid4().hex[:8]
    email = f"TEST_teilzeit_{unique}@example.com"
    password = "TestPass123!"
    payload = {
        "name": f"TEST Teilzeit {unique}",
        "email": email,
        "mobilnummer": "+491701234567",
        "geburtsdatum": "1990-01-01",
        "staatsangehoerigkeit": "Deutsch",
        "strasse": "Teststr. 1",
        "postleitzahl": "10115",
        "stadt": "Berlin",
        "position": "Tester",
        "message": "test",
        "password": password,
    }
    r = requests.post(f"{BASE_URL}/api/applications/submit", json=payload, timeout=20)
    assert r.status_code == 200, f"submit failed: {r.status_code} {r.text}"
    app_id = r.json()["id"]
    yield {"id": app_id, "email": email, "password": password}
    # Cleanup: delete via admin
    try:
        tok_r = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=10,
        )
        if tok_r.status_code == 200:
            tok = tok_r.json()["access_token"]
            requests.delete(
                f"{BASE_URL}/api/applications/{app_id}",
                headers={"Authorization": f"Bearer {tok}"},
                timeout=10,
            )
    except Exception:
        pass


def test_teilzeit_end_to_end_contract_flow(admin_token, test_applicant):
    app_id = test_applicant["id"]

    # 1) Admin accepts application with contract_type=teilzeit
    r = requests.post(
        f"{BASE_URL}/api/applications/{app_id}/accept",
        json={"contract_type": "teilzeit"},
        headers={"Authorization": f"Bearer {admin_token}"},
        timeout=15,
    )
    assert r.status_code == 200, f"accept failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["status"] == "Akzeptiert"
    assert data["contract_type"] == "teilzeit"

    # 2) Applicant logs in
    r = requests.post(
        f"{BASE_URL}/api/applications/login",
        json={"email": test_applicant["email"], "password": test_applicant["password"]},
        timeout=15,
    )
    assert r.status_code == 200, f"applicant login failed: {r.status_code} {r.text}"
    applicant_token = r.json()["access_token"]

    # 3) Sign contract - tiny 1x1 PNG as signature
    tiny_png = base64.b64encode(
        bytes.fromhex(
            "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4"
            "890000000d49444154789c6300010000000500010d0a2db40000000049454e44ae426082"
        )
    ).decode()
    r = requests.post(
        f"{BASE_URL}/api/applications/sign-contract",
        json={
            "signature_data": f"data:image/png;base64,{tiny_png}",
            "iban": "DE89370400440532013000",
        },
        headers={"Authorization": f"Bearer {applicant_token}"},
        timeout=15,
    )
    assert r.status_code == 200, f"sign-contract failed: {r.status_code} {r.text}"
    assert r.json()["status"] == "Vertrag unterschrieben"

    # 4) Download contract HTML
    r = requests.get(
        f"{BASE_URL}/api/applications/download-contract",
        headers={"Authorization": f"Bearer {applicant_token}"},
        timeout=20,
    )
    assert r.status_code == 200, f"download-contract failed: {r.status_code} {r.text}"
    html = r.text

    # 5) Verify content
    assert DATENSCHUTZ_HEADER in html, "Datenschutz header missing in downloaded teilzeit contract"
    # All 5 paragraphs after the header
    idx = html.find(DATENSCHUTZ_HEADER)
    section = html[idx:]
    for marker in ["(1)", "(2)", "(3)", "(4)", "(5)"]:
        assert marker in section, f"Paragraph {marker} missing in downloaded contract"
    assert "20 Stunden" in html
    assert "2.200,00" in html
    assert "drei Monate" in html
    assert "DSGVO" in html
