"""Brute-force lockout verification for POST /api/admin/login.

Uses a NON-EXISTENT email so the real admin account is never locked out.
"""
import os
import uuid

import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
BASE = (os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")).rstrip("/")
API = f"{BASE}/api"


def test_admin_login_locks_out_after_five_failures():
    email = f"sectest-bruteforce-{uuid.uuid4().hex[:6]}@example.com"
    s = requests.Session()
    codes = []
    for _ in range(6):
        r = s.post(f"{API}/admin/login", json={"email": email, "password": "wrong-password"})
        codes.append(r.status_code)
    assert codes[:5] == [401] * 5, f"unexpected codes for first 5 attempts: {codes}"
    assert codes[5] == 429, f"6th attempt not rate-limited (got {codes[5]}); codes={codes}"


def test_locked_identifier_stays_locked():
    email = f"sectest-bruteforce-{uuid.uuid4().hex[:6]}@example.com"
    s = requests.Session()
    for _ in range(5):
        s.post(f"{API}/admin/login", json={"email": email, "password": "wrong"})
    r1 = s.post(f"{API}/admin/login", json={"email": email, "password": "wrong"})
    r2 = s.post(f"{API}/admin/login", json={"email": email, "password": "wrong"})
    assert r1.status_code == 429 and r2.status_code == 429, f"{r1.status_code}/{r2.status_code}"
