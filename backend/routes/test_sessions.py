from fastapi import APIRouter, HTTPException, Depends, Header
from motor.motor_asyncio import AsyncIOMotorDatabase
from utils.auth import decode_token
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import Optional
import uuid
import secrets

router = APIRouter(prefix="/api/test-sessions", tags=["test-sessions"])

def get_db():
    from server import db
    return db


def verify_admin(authorization: str):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload or payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Nur Admins")
    return payload


class CreateSession(BaseModel):
    title: str
    task_id: Optional[str] = None
    anosim_number: Optional[str] = None
    anosim_booking_id: Optional[str] = None
    email_account_id: Optional[str] = None
    test_ident_link: Optional[str] = None
    test_login_email: Optional[str] = None
    test_login_password: Optional[str] = None
    notes: Optional[str] = None


# Create a new test session
@router.post("/create")
async def create_session(
    data: CreateSession,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    verify_admin(authorization)

    session_token = secrets.token_urlsafe(32)

    session_doc = {
        "id": f"session-{uuid.uuid4().hex[:8]}",
        "token": session_token,
        "title": data.title,
        "task_id": data.task_id or "",
        "anosim_number": data.anosim_number or "",
        "anosim_booking_id": data.anosim_booking_id or "",
        "email_account_id": data.email_account_id or "",
        "test_ident_link": data.test_ident_link or "",
        "test_login_email": data.test_login_email or "",
        "test_login_password": data.test_login_password or "",
        "notes": data.notes or "",
        "status": "waiting",  # waiting, active, expired
        "started_at": None,
        "expires_at": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.test_sessions.insert_one(session_doc)

    return {
        "message": "Test-Sitzung erstellt",
        "session": {
            "id": session_doc["id"],
            "token": session_token,
            "title": data.title,
            "status": "waiting",
            "created_at": session_doc["created_at"],
        }
    }


# List all test sessions (admin)
@router.get("/")
async def list_sessions(
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    verify_admin(authorization)
    sessions = await db.test_sessions.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Get email account details for sessions with email_account_id
    for s in sessions:
        if s.get("email_account_id"):
            account = await db.email_accounts.find_one({"id": s["email_account_id"]}, {"_id": 0, "email": 1})
            s["email_address"] = account.get("email", "") if account else ""
        # Check if expired
        if s.get("expires_at"):
            exp = datetime.fromisoformat(s["expires_at"])
            if exp < datetime.now(timezone.utc):
                s["status"] = "expired"
    
    return sessions


# Delete a test session (admin)
@router.delete("/{session_id}")
async def delete_session(
    session_id: str,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    verify_admin(authorization)
    result = await db.test_sessions.delete_one({"id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sitzung nicht gefunden")
    return {"message": "Sitzung gelöscht"}


# PUBLIC: Get session info (no auth needed)
@router.get("/public/{token}")
async def get_public_session(
    token: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    session = await db.test_sessions.find_one({"token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Sitzung nicht gefunden")

    # Check expiry
    if session.get("expires_at"):
        exp = datetime.fromisoformat(session["expires_at"])
        if exp < datetime.now(timezone.utc):
            return {"status": "expired", "title": session["title"]}

    return {
        "status": session["status"],
        "title": session["title"],
        "started_at": session.get("started_at"),
        "expires_at": session.get("expires_at"),
    }


# PUBLIC: Start a session (activates 1h timer)
@router.post("/public/{token}/start")
async def start_session(
    token: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    session = await db.test_sessions.find_one({"token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Sitzung nicht gefunden")

    # If already expired
    if session.get("expires_at"):
        exp = datetime.fromisoformat(session["expires_at"])
        if exp < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Sitzung abgelaufen")

    # Start the session (1 hour timer)
    now = datetime.now(timezone.utc)
    expires = now + timedelta(hours=1)

    await db.test_sessions.update_one(
        {"token": token},
        {"$set": {
            "status": "active",
            "started_at": now.isoformat(),
            "expires_at": expires.isoformat()
        }}
    )

    return {
        "status": "active",
        "started_at": now.isoformat(),
        "expires_at": expires.isoformat(),
    }


# PUBLIC: Get live data (SMS + Email codes) for active session
@router.get("/public/{token}/data")
async def get_session_data(
    token: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    session = await db.test_sessions.find_one({"token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Sitzung nicht gefunden")

    # Check if active and not expired
    if session.get("status") != "active":
        raise HTTPException(status_code=400, detail="Sitzung nicht aktiv")
    
    if session.get("expires_at"):
        exp = datetime.fromisoformat(session["expires_at"])
        if exp < datetime.now(timezone.utc):
            await db.test_sessions.update_one({"token": token}, {"$set": {"status": "expired"}})
            raise HTTPException(status_code=400, detail="Sitzung abgelaufen")

    result = {
        "anosim_number": session.get("anosim_number", ""),
        "test_ident_link": session.get("test_ident_link", ""),
        "test_login_email": session.get("test_login_email", ""),
        "test_login_password": session.get("test_login_password", ""),
        "task": None,
        "sms_messages": [],
        "emails": [],
        "expires_at": session.get("expires_at"),
    }

    # Fetch task if assigned
    if session.get("task_id"):
        task = await db.tasks.find_one({"id": session["task_id"]}, {"_id": 0, "title": 1, "description": 1, "steps": 1, "website": 1})
        if task:
            result["task"] = task

    # Fetch SMS if anosim number assigned
    sms_raw = []
    if session.get("anosim_booking_id"):
        from services.anosim_service import get_sms_for_booking
        sms_data = await get_sms_for_booking(str(session["anosim_booking_id"]))
        if sms_data.get("status") == "success":
            sms_raw = sms_data.get("messages", [])
    elif session.get("anosim_number"):
        # Fallback: lookup booking by phone number (slower)
        from services.anosim_service import get_sms_for_number
        sms_data = await get_sms_for_number(session["anosim_number"])
        if sms_data.get("status") == "success":
            sms_raw = sms_data.get("messages", [])

    # Normalize SMS format for the public frontend + filter by session start
    from services.anosim_service import extract_verification_code
    started_at = None
    if session.get("started_at"):
        try:
            started_at = datetime.fromisoformat(session["started_at"])
        except Exception:
            started_at = None

    normalized = []
    for msg in sms_raw:
        text = msg.get("messageText") or msg.get("text") or msg.get("message") or msg.get("body") or ""
        received_raw = msg.get("messageDate") or msg.get("received_at") or msg.get("timestamp") or msg.get("date") or ""
        # Filter messages received before session start (avoid showing old codes)
        if started_at and received_raw:
            try:
                msg_dt = datetime.fromisoformat(str(received_raw).replace("Z", "+00:00"))
                if msg_dt.tzinfo is None:
                    msg_dt = msg_dt.replace(tzinfo=timezone.utc)
                if msg_dt < started_at:
                    continue
            except Exception:
                pass
        normalized.append({
            "sender": msg.get("sender") or msg.get("from") or msg.get("originator") or "SMS",
            "text": text,
            "received_at": str(received_raw),
            "code": extract_verification_code(text) if text else None,
        })
    result["sms_messages"] = normalized

    # Fetch emails if email account assigned
    if session.get("email_account_id"):
        account = await db.email_accounts.find_one({"id": session["email_account_id"]}, {"_id": 0})
        if account:
            result["email_address"] = account["email"]
            from services.email_inbox_service import get_verification_codes
            import asyncio as _asyncio
            try:
                # Run IMAP fetch in a thread + 15s hard timeout
                emails = await _asyncio.wait_for(
                    _asyncio.to_thread(
                        get_verification_codes,
                        account["email"],
                        account["app_password"],
                        60,
                    ),
                    timeout=15.0,
                )
                result["emails"] = emails
            except _asyncio.TimeoutError:
                print(f"IMAP timeout for {account['email']}")
                result["emails"] = []
            except Exception as e:
                print(f"Email fetch failed: {e}")
                result["emails"] = []

    return result
