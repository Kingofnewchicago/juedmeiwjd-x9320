"""
Iteration 31 regression suite: verify chat endpoints still work after ALL Telegram
code was removed from /app/backend/routes/chat.py (send_telegram_notification,
TELEGRAM_BOT_TOKEN/TELEGRAM_API, httpx import) and TELEGRAM_BOT_TOKEN dropped from .env.

Modules covered: routes/chat.py -> /send, /send-image, /image/{filename},
/conversations, /messages/{partner_id}, /unread, removed /telegram/webhook.
"""
import io
import os
import re
import struct
import zlib
from pathlib import Path

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL is missing from env and /app/frontend/.env")
BASE_URL = base_url.rstrip("/")
API = f"{BASE_URL}/api"


def _creds():
    p = Path("/app/memory/test_credentials.md")
    if not p.exists():
        pytest.skip("Missing /app/memory/test_credentials.md")
    txt = p.read_text(encoding="utf-8")
    emails = re.findall(r"(?im)^-\s*Email:\s*(\S+)", txt)
    pwds = re.findall(r"(?im)^-\s*Password:\s*(\S+)", txt)
    if len(emails) < 2 or len(pwds) < 2:
        pytest.skip("Could not parse admin+employee credentials")
    return {"admin": (emails[0], pwds[0]), "employee": (emails[1], pwds[1])}


CREDS = _creds()


def _png_bytes():
    """Minimal valid 1x1 PNG."""
    def chunk(typ, data):
        c = typ + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)
    ihdr = struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0)
    idat = zlib.compress(b"\x00\x00\x00\x00")
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    yield s
    s.close()


def _login(s, role):
    email, pwd = CREDS[role]
    path = "/admin/login" if role == "admin" else "/employee/login"
    r = s.post(f"{API}{path}", json={"email": email, "password": pwd}, timeout=30)
    assert r.status_code == 200, f"{role} login failed {r.status_code}: {r.text[:300]}"
    d = r.json()
    token = d.get("token") or d.get("access_token")
    assert token, f"no token in {role} login response: {d}"
    uid = (d.get("admin") or d.get("employee") or d.get("user") or {}).get("id") or d.get("id")
    assert uid, f"no user id in {role} login response: {d}"
    return token, uid


@pytest.fixture(scope="module")
def admin(session):
    return _login(session, "admin")


@pytest.fixture(scope="module")
def employee(session):
    return _login(session, "employee")


# ---------- /api/chat/send regression (Telegram notification removed) ----------
class TestChatSend:
    def test_employee_send_to_admin_persists(self, session, admin, employee):
        a_token, a_id = admin
        e_token, e_id = employee
        text = "TEST_iter31 telegram-removal regression message"
        r = session.post(f"{API}/chat/send", json={"recipient_id": a_id, "message": text},
                         headers={"Authorization": f"Bearer {e_token}"}, timeout=30)
        assert r.status_code == 200, f"send failed {r.status_code}: {r.text[:400]}"
        body = r.json()
        assert "message" in body and "conversation_id" in body
        expected = "_".join(sorted([e_id, a_id]))
        assert body["conversation_id"] == expected

        # verify persistence via admin reading the conversation
        g = session.get(f"{API}/chat/messages/{e_id}", headers={"Authorization": f"Bearer {a_token}"}, timeout=30)
        assert g.status_code == 200
        msgs = g.json()["messages"]
        assert any(m.get("message") == text for m in msgs), "sent message not persisted"
        assert all("_id" not in m for m in msgs), "MongoDB _id leaked in response"

    def test_admin_send_to_employee_persists(self, session, admin, employee):
        a_token, _ = admin
        _, e_id = employee
        text = "TEST_iter31 admin->employee message"
        r = session.post(f"{API}/chat/send", json={"recipient_id": e_id, "message": text},
                         headers={"Authorization": f"Bearer {a_token}"}, timeout=30)
        assert r.status_code == 200, r.text[:300]

    def test_send_requires_auth(self, session, admin):
        _, a_id = admin
        r = session.post(f"{API}/chat/send", json={"recipient_id": a_id, "message": "x"}, timeout=30)
        assert r.status_code == 401, f"expected 401, got {r.status_code}"

    def test_send_invalid_token(self, session, admin):
        _, a_id = admin
        r = session.post(f"{API}/chat/send", json={"recipient_id": a_id, "message": "x"},
                         headers={"Authorization": "Bearer not.a.valid.token"}, timeout=30)
        assert r.status_code == 401


# ---------- /api/chat/send-image regression ----------
class TestChatSendImage:
    def test_send_image_success_and_served(self, session, admin, employee):
        e_token, e_id = employee
        a_token, a_id = admin
        files = {"file": ("TEST_iter31.png", io.BytesIO(_png_bytes()), "image/png")}
        r = session.post(f"{API}/chat/send-image", data={"recipient_id": a_id}, files=files,
                         headers={"Authorization": f"Bearer {e_token}"}, timeout=60)
        assert r.status_code == 200, f"send-image failed {r.status_code}: {r.text[:400]}"
        body = r.json()
        assert "message" in body and "image" in body
        fname = body["image"]
        assert fname.endswith(".png")

        # image is retrievable
        img = session.get(f"{API}/chat/image/{fname}", timeout=30)
        assert img.status_code == 200, f"image not served: {img.status_code}"
        assert img.content.startswith(b"\x89PNG"), "served content is not the uploaded PNG"

        # message doc persisted with image field
        g = session.get(f"{API}/chat/messages/{e_id}", headers={"Authorization": f"Bearer {a_token}"}, timeout=30)
        assert g.status_code == 200
        assert any(m.get("image") == fname for m in g.json()["messages"]), "image message not persisted"

    def test_send_image_invalid_extension(self, session, admin, employee):
        e_token, _ = employee
        _, a_id = admin
        files = {"file": ("TEST_evil.exe", io.BytesIO(b"MZ\x00\x00"), "application/octet-stream")}
        r = session.post(f"{API}/chat/send-image", data={"recipient_id": a_id}, files=files,
                         headers={"Authorization": f"Bearer {e_token}"}, timeout=30)
        assert r.status_code == 400, f"expected 400 for .exe, got {r.status_code}"

    def test_send_image_requires_auth(self, session, admin):
        _, a_id = admin
        files = {"file": ("TEST_iter31.png", io.BytesIO(_png_bytes()), "image/png")}
        r = session.post(f"{API}/chat/send-image", data={"recipient_id": a_id}, files=files, timeout=30)
        assert r.status_code == 401, f"expected 401, got {r.status_code}"

    @pytest.mark.parametrize("payload", [
        "..%2f..%2f..%2fetc%2fpasswd",
        "%2e%2e%2f%2e%2e%2fetc%2fpasswd",
        "....//....//etc/passwd",
        "nonexistent_file_iter31.png",
    ])
    def test_image_path_traversal_blocked(self, session, payload):
        r = session.get(f"{API}/chat/image/{payload}", timeout=30, allow_redirects=False)
        assert r.status_code in (400, 404), f"traversal {payload} -> {r.status_code}"
        assert b"root:x:" not in r.content, f"LEAKED /etc/passwd via {payload}"


# ---------- conversations / messages / unread ----------
class TestChatReadEndpoints:
    @pytest.mark.parametrize("path", ["/chat/conversations", "/chat/unread"])
    def test_requires_auth(self, session, path):
        r = session.get(f"{API}{path}", timeout=30)
        assert r.status_code == 401

    def test_messages_requires_auth(self, session, employee):
        _, e_id = employee
        r = session.get(f"{API}/chat/messages/{e_id}", timeout=30)
        assert r.status_code == 401

    def test_admin_conversations(self, session, admin, employee):
        a_token, _ = admin
        _, e_id = employee
        r = session.get(f"{API}/chat/conversations", headers={"Authorization": f"Bearer {a_token}"}, timeout=30)
        assert r.status_code == 200
        convos = r.json()["conversations"]
        assert isinstance(convos, list)
        assert any(c["partner"].get("id") == e_id for c in convos), "employee conversation missing for admin"

    def test_employee_conversations(self, session, employee):
        e_token, _ = employee
        r = session.get(f"{API}/chat/conversations", headers={"Authorization": f"Bearer {e_token}"}, timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json()["conversations"], list)

    def test_messages_marks_read_and_unread_clears(self, session, admin, employee):
        a_token, a_id = admin
        e_token, e_id = employee
        # employee sends -> admin should have unread >= 1
        session.post(f"{API}/chat/send", json={"recipient_id": a_id, "message": "TEST_iter31 unread probe"},
                     headers={"Authorization": f"Bearer {e_token}"}, timeout=30)
        u1 = session.get(f"{API}/chat/unread", headers={"Authorization": f"Bearer {a_token}"}, timeout=30)
        assert u1.status_code == 200
        assert u1.json()["unread"] >= 1, "unread not counted for admin"

        # admin opens conversation -> marks read
        session.get(f"{API}/chat/messages/{e_id}", headers={"Authorization": f"Bearer {a_token}"}, timeout=30)
        u2 = session.get(f"{API}/chat/unread", headers={"Authorization": f"Bearer {a_token}"}, timeout=30)
        assert u2.status_code == 200
        assert u2.json()["unread"] < u1.json()["unread"] or u2.json()["unread"] == 0, \
            "reading messages did not mark them read"


# ---------- Telegram fully removed ----------
class TestTelegramFullyRemoved:
    @pytest.mark.parametrize("method", ["post", "get", "put", "patch", "delete"])
    def test_webhook_endpoint_gone(self, session, method):
        r = getattr(session, method)(f"{API}/chat/telegram/webhook", timeout=30)
        assert r.status_code in (404, 405), f"{method} webhook -> {r.status_code}"

    def test_no_telegram_references_in_app_code(self):
        backend = Path("/app/backend")
        hits = []
        for f in backend.rglob("*.py"):
            s = str(f)
            if "/tests/" in s or "pytest_cache" in s or "site-packages" in s:
                continue
            if "telegram" in f.read_text(encoding="utf-8", errors="ignore").lower():
                hits.append(s)
        assert not hits, f"Telegram references still in app code: {hits}"

    def test_telegram_token_not_in_env(self):
        env = Path("/app/backend/.env").read_text(encoding="utf-8")
        assert "TELEGRAM" not in env.upper(), "TELEGRAM_* still present in backend/.env"

    def test_chat_module_has_no_notification_symbol(self):
        src = Path("/app/backend/routes/chat.py").read_text(encoding="utf-8")
        for sym in ("send_telegram_notification", "TELEGRAM_BOT_TOKEN", "TELEGRAM_API", "import httpx"):
            assert sym not in src, f"{sym} still present in routes/chat.py"

    def test_telegram_subscribers_collection_dropped(self):
        try:
            from pymongo import MongoClient
        except ImportError:
            pytest.skip("pymongo unavailable")
        env = dotenv_values("/app/backend/.env")
        mongo_url, db_name = env.get("MONGO_URL"), env.get("DB_NAME")
        if not mongo_url or not db_name:
            pytest.skip("MONGO_URL/DB_NAME not available")
        with MongoClient(mongo_url, serverSelectionTimeoutMS=5000) as mc:
            assert "telegram_subscribers" not in mc[db_name].list_collection_names(), \
                "telegram_subscribers collection still exists"
