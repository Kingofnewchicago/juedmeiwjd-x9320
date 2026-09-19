"""
Email Inbox Routes - Admin management of email accounts and employee assignments
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import os

from services.email_inbox_service import get_verification_codes, test_email_credentials
from utils.auth import decode_token

router = APIRouter(prefix="/api/email-inbox", tags=["email-inbox"])

# Get database
def get_db():
    from server import db
    return db


# Pydantic models
class EmailAccountCreate(BaseModel):
    email: EmailStr
    app_password: str
    description: Optional[str] = None


class EmailAccountResponse(BaseModel):
    id: str
    email: str
    description: Optional[str]
    is_active: bool
    assigned_to: Optional[dict]
    created_at: datetime


class EmailAssignment(BaseModel):
    email_account_id: str
    employee_id: str


# Helper to verify admin token
async def verify_admin(authorization: str = Header(...), db: AsyncIOMotorDatabase = Depends(get_db)):
    try:
        token = authorization.replace("Bearer ", "")
        payload = decode_token(token)
        admin = await db.admins.find_one({"email": payload.get("sub")})
        if not admin:
            raise HTTPException(status_code=401, detail="Nicht autorisiert")
        return admin
    except Exception as e:
        raise HTTPException(status_code=401, detail="Ungültiger Token")


# Helper to verify employee token
async def verify_employee(authorization: str = Header(...), db: AsyncIOMotorDatabase = Depends(get_db)):
    try:
        token = authorization.replace("Bearer ", "")
        payload = decode_token(token)
        employee = await db.applications.find_one({"email": payload.get("sub")})
        if not employee:
            raise HTTPException(status_code=401, detail="Nicht autorisiert")
        return employee
    except Exception as e:
        raise HTTPException(status_code=401, detail="Ungültiger Token")


# ============== Admin Endpoints ==============

@router.post("/accounts")
async def add_email_account(
    account: EmailAccountCreate,
    admin = Depends(verify_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Add a new email account (Admin only)"""
    # Check if email already exists
    existing = await db.email_accounts.find_one({"email": account.email})
    if existing:
        raise HTTPException(status_code=400, detail="E-Mail-Konto existiert bereits")
    
    # Test credentials (offload sync IMAP call to thread to avoid blocking event loop)
    import asyncio as _asyncio
    try:
        test_result = await _asyncio.wait_for(
            _asyncio.to_thread(test_email_credentials, account.email, account.app_password),
            timeout=15.0,
        )
    except _asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Verbindung zum E-Mail-Server zu langsam (Timeout)")
    if not test_result["success"]:
        raise HTTPException(status_code=400, detail=test_result["message"])
    
    # Create account
    account_doc = {
        "id": f"email-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "email": account.email,
        "app_password": account.app_password,  # In production, encrypt this!
        "description": account.description,
        "is_active": True,
        "assigned_to": None,
        "assigned_at": None,
        "created_at": datetime.utcnow()
    }
    
    await db.email_accounts.insert_one(account_doc)
    
    # Return without password
    del account_doc["app_password"]
    del account_doc["_id"]
    
    return {"message": "E-Mail-Konto hinzugefügt", "account": account_doc}


@router.get("/accounts")
async def get_email_accounts(
    admin = Depends(verify_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all email accounts (Admin only)"""
    accounts = await db.email_accounts.find({}, {"app_password": 0, "_id": 0}).to_list(100)
    return {"accounts": accounts}


@router.delete("/accounts/{account_id}")
async def delete_email_account(
    account_id: str,
    admin = Depends(verify_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete an email account (Admin only)"""
    result = await db.email_accounts.delete_one({"id": account_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Konto nicht gefunden")
    
    # Remove assignment from any employee
    await db.applications.update_many(
        {"email_account_id": account_id},
        {"$set": {"email_account_id": None, "email_account_assigned_at": None}}
    )
    
    return {"message": "E-Mail-Konto gelöscht"}


@router.post("/assign")
async def assign_email_to_employee(
    assignment: EmailAssignment,
    admin = Depends(verify_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Assign an email account to an employee (Admin only)"""
    # Get email account
    account = await db.email_accounts.find_one({"id": assignment.email_account_id})
    if not account:
        raise HTTPException(status_code=404, detail="E-Mail-Konto nicht gefunden")
    
    # Get employee
    employee = await db.applications.find_one({"id": assignment.employee_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Mitarbeiter nicht gefunden")
    
    # Update email account
    await db.email_accounts.update_one(
        {"id": assignment.email_account_id},
        {
            "$set": {
                "assigned_to": {
                    "id": employee["id"],
                    "name": employee.get("name", ""),
                    "email": employee.get("email", "")
                },
                "assigned_at": datetime.utcnow()
            }
        }
    )
    
    # Update employee
    await db.applications.update_one(
        {"id": assignment.employee_id},
        {
            "$set": {
                "email_account_id": assignment.email_account_id,
                "email_account_assigned_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": f"E-Mail-Konto {account['email']} wurde {employee.get('name', 'Mitarbeiter')} zugewiesen"}


@router.post("/unassign/{account_id}")
async def unassign_email_account(
    account_id: str,
    admin = Depends(verify_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Remove assignment from an email account (Admin only)"""
    account = await db.email_accounts.find_one({"id": account_id})
    if not account:
        raise HTTPException(status_code=404, detail="E-Mail-Konto nicht gefunden")
    
    # Remove from employee
    if account.get("assigned_to"):
        await db.applications.update_one(
            {"id": account["assigned_to"]["id"]},
            {"$set": {"email_account_id": None, "email_account_assigned_at": None}}
        )
    
    # Clear assignment from account
    await db.email_accounts.update_one(
        {"id": account_id},
        {"$set": {"assigned_to": None, "assigned_at": None}}
    )
    
    return {"message": "Zuweisung entfernt"}


@router.get("/stats")
async def get_email_stats(
    admin = Depends(verify_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get email account statistics (Admin only)"""
    total = await db.email_accounts.count_documents({})
    assigned = await db.email_accounts.count_documents({"assigned_to": {"$ne": None}})
    
    return {
        "total": total,
        "assigned": assigned,
        "available": total - assigned
    }


# ============== Employee Endpoints ==============

@router.get("/my-codes")
async def get_my_email_codes(
    employee = Depends(verify_employee),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get verification codes from assigned email account (Employee only)"""
    # Check if employee has assigned email
    email_account_id = employee.get("email_account_id")
    if not email_account_id:
        return {"codes": [], "message": "Kein E-Mail-Konto zugewiesen"}
    
    # Get email account with credentials
    account = await db.email_accounts.find_one({"id": email_account_id})
    if not account:
        return {"codes": [], "message": "E-Mail-Konto nicht gefunden"}
    
    # Check if employee has active task (single or multi-assignment)
    active_task = await db.tasks.find_one({
        "$or": [
            {"assigned_to": employee["id"], "status": "In Bearbeitung"},
            {"assignments.employee_id": employee["id"], "status": "In Bearbeitung"}
        ]
    })
    
    if not active_task:
        return {"codes": [], "message": "Keine aktive Aufgabe - E-Mail-Codes nur bei aktiven Aufgaben sichtbar"}
    
    # Get assigned_at timestamp for filtering
    assigned_at = employee.get("email_account_assigned_at")
    since_minutes = 60  # Default
    
    if assigned_at:
        # Only show emails received after assignment
        minutes_since_assignment = (datetime.utcnow() - assigned_at).total_seconds() / 60
        since_minutes = min(int(minutes_since_assignment) + 5, 1440)  # Max 24 hours
    
    try:
        import asyncio as _asyncio
        # Fetch verification codes in a thread to avoid blocking the event loop
        emails = await _asyncio.to_thread(
            get_verification_codes,
            account["email"],
            account["app_password"],
            since_minutes,
        )
        
        # Filter to only show emails after assignment
        if assigned_at:
            filtered_emails = []
            for email_data in emails:
                try:
                    email_time = datetime.fromisoformat(email_data["received_at"])
                    if email_time >= assigned_at:
                        filtered_emails.append(email_data)
                except:
                    filtered_emails.append(email_data)
            emails = filtered_emails
        
        return {
            "codes": emails,
            "email": account["email"],
            "message": f"{len(emails)} Verifizierungs-E-Mails gefunden"
        }
    
    except Exception as e:
        return {"codes": [], "message": f"Fehler beim Abrufen: {str(e)}"}


@router.get("/test/{account_id}")
async def test_email_account(
    account_id: str,
    admin = Depends(verify_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Test an email account connection (Admin only)"""
    account = await db.email_accounts.find_one({"id": account_id})
    if not account:
        raise HTTPException(status_code=404, detail="Konto nicht gefunden")
    
    import asyncio as _asyncio
    try:
        result = await _asyncio.wait_for(
            _asyncio.to_thread(test_email_credentials, account["email"], account["app_password"]),
            timeout=15.0,
        )
    except _asyncio.TimeoutError:
        return {"success": False, "message": "Verbindung zum E-Mail-Server zu langsam (Timeout)"}
    return result
