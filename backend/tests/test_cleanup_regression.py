"""Regression suite after Emergent-reference cleanup (static audit + core API health)."""
import os
import re
import subprocess
from pathlib import Path

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")

SHIPPED_PATHS = [
    "frontend/src",
    "frontend/public",
    "backend/routes",
    "backend/services",
    "backend/server.py",
    "backend/utils",
    "backend/models",
]


@pytest.fixture(scope="session")
def creds():
    content = Path("/app/memory/test_credentials.md").read_text(encoding="utf-8")
    admin_email = re.search(r"Email:\s*(\S+)", content).group(1)
    admin_pw = re.search(r"Password:\s*(\S+)", content).group(1)
    return {"email": admin_email, "password": admin_pw}


@pytest.fixture(scope="session")
def admin_token(creds):
    r = requests.post(f"{BASE_URL}/api/admin/login", json=creds, timeout=30)
    if r.status_code != 200:
        pytest.fail(f"Admin login failed {r.status_code}: {r.text[:300]}")
    data = r.json()
    assert "access_token" in data
    return data["access_token"]


# --- Static audit ---
class TestStaticAudit:
    @pytest.mark.parametrize("needle", ["emergent", "emergentagent", "posthog", "phc_"])
    def test_no_reference_in_shipped_paths(self, needle):
        existing = [p for p in SHIPPED_PATHS if Path("/app", p).exists()]
        proc = subprocess.run(
            ["grep", "-rin", "-e", needle, *existing],
            cwd="/app", capture_output=True, text=True,
        )
        hits = [line for line in proc.stdout.splitlines() if line.strip()]
        assert not hits, f"Found '{needle}' in shipped paths:\n" + "\n".join(hits[:20])


# --- Core backend health ---
class TestCoreHealth:
    def test_root(self):
        r = requests.get(f"{BASE_URL}/api/", timeout=30)
        assert r.status_code == 200
        assert r.json().get("message") == "Hello World"

    def test_admin_login_returns_token(self, admin_token):
        assert isinstance(admin_token, str) and len(admin_token) > 20

    def test_admin_login_wrong_password(self, creds):
        r = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": creds["email"], "password": "definitely-wrong-pw"},
            timeout=30,
        )
        assert r.status_code in (401, 403, 429), r.text[:200]

    def test_applications_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/applications/", timeout=30)
        assert r.status_code in (401, 403), f"got {r.status_code}"

    def test_applications_with_auth(self, admin_token):
        r = requests.get(
            f"{BASE_URL}/api/applications/",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=30,
        )
        assert r.status_code == 200, r.text[:300]
        body = r.json()
        items = body if isinstance(body, list) else body.get("items", body.get("applications"))
        assert isinstance(items, list)
        for item in items[:20]:
            assert "_id" not in item, "MongoDB _id leaked in response"


# --- Security spot-checks (NoSQL guard + removed backdoors) ---
class TestSecuritySpotChecks:
    @pytest.mark.parametrize("payload", [
        {"email": {"$ne": None}, "password": {"$ne": None}},
        {"email": ["a"], "password": 1},
    ])
    def test_employee_login_nosql_injection_guard(self, payload):
        r = requests.post(f"{BASE_URL}/api/applications/login", json=payload, timeout=30)
        assert r.status_code == 422, f"got {r.status_code}: {r.text[:200]}"

    @pytest.mark.parametrize("path", ["/api/status", "/api/admin/init-admin"])
    def test_removed_backdoors_are_gone(self, path):
        get_r = requests.get(f"{BASE_URL}{path}", timeout=30)
        post_r = requests.post(f"{BASE_URL}{path}", json={}, timeout=30)
        assert get_r.status_code in (404, 405), f"GET {path} -> {get_r.status_code}"
        assert post_r.status_code in (404, 405), f"POST {path} -> {post_r.status_code}"

    def test_admin_endpoint_rejects_bad_token(self):
        r = requests.get(
            f"{BASE_URL}/api/applications/",
            headers={"Authorization": "Bearer not.a.real.token"},
            timeout=30,
        )
        assert r.status_code in (401, 403)
