from fastapi import APIRouter, HTTPException, Depends, Header, UploadFile, File, Form
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.employee import EmployeeLogin, TokenResponse, EmployeeResponse, Task, TaskCreate, TaskUpdate
from utils.auth import verify_password, create_access_token, decode_token, get_password_hash
from datetime import timedelta, datetime
from typing import List, Optional
from pydantic import BaseModel
import os
import uuid

router = APIRouter(prefix="/api/employee", tags=["employee"])

# Directory for employee documents
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCUMENTS_DIR = os.path.join(BASE_DIR, "uploads", "documents")
os.makedirs(DOCUMENTS_DIR, exist_ok=True)

# Models for settings and documents
class ProfileUpdate(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class NotificationSettings(BaseModel):
    email_notifications: bool = True
    task_reminders: bool = True
    payout_notifications: bool = True

class DocumentResponse(BaseModel):
    id: str
    name: str
    type: str
    category: str
    size: str
    uploaded_at: str
    status: str

router = APIRouter(prefix="/api/employee", tags=["employee"])

def get_db():
    from server import db
    return db

@router.post("/login", response_model=TokenResponse)
async def employee_login(credentials: EmployeeLogin, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Employee login endpoint"""
    employee = await db.employees.find_one({"email": credentials.email})
    
    if not employee:
        raise HTTPException(status_code=401, detail="Ungültige Anmeldedaten")
    
    if not employee.get("is_active", True):
        raise HTTPException(status_code=401, detail="Konto ist deaktiviert")
    
    if not verify_password(credentials.password, employee["password_hash"]):
        raise HTTPException(status_code=401, detail="Ungültige Anmeldedaten")
    
    # Update last login
    await db.employees.update_one(
        {"_id": employee["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    # Create access token (long-lived; user logs out manually)
    access_token_expires = timedelta(days=365)
    access_token = create_access_token(
        data={"sub": employee["email"], "id": employee["id"], "role": "employee"},
        expires_delta=access_token_expires
    )
    
    employee_response = EmployeeResponse(
        id=employee["id"],
        email=employee["email"],
        name=employee["name"],
        position=employee["position"],
        department=employee.get("department", "Testing"),
        employee_number=employee["employee_number"]
    )
    
    return TokenResponse(
        access_token=access_token,
        employee=employee_response
    )

@router.get("/verify")
async def verify_employee_token(authorization: str = Header(None)):
    """Verify if employee token is valid"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine gültige Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload or payload.get("role") not in ("employee", "applicant"):
        raise HTTPException(status_code=401, detail="Ungültiger oder abgelaufener Token")
    
    return {"valid": True, "email": payload.get("sub"), "role": payload.get("role")}

@router.get("/tasks", response_model=List[Task])
async def get_employee_tasks(
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get tasks assigned to the employee"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger Token")
    
    employee_id = payload.get("id")
    
    # Get tasks assigned to this employee (single or multi-assignment)
    tasks = await db.tasks.find({
        "$or": [
            {"assigned_to": employee_id},
            {"assignments.employee_id": employee_id}
        ]
    }).sort("created_at", -1).to_list(100)
    
    # For multi-assigned tasks, inject the employee-specific credentials and status
    for task in tasks:
        if task.get("assignments"):
            for a in task["assignments"]:
                if a.get("employee_id") == employee_id:
                    task["test_ident_link"] = a.get("test_ident_link", "")
                    task["test_login_email"] = a.get("test_login_email", "")
                    task["test_login_password"] = a.get("test_login_password", "")
                    task["test_phone_number"] = a.get("test_phone_number", "")
                    # Per-employee status overrides task-level status
                    if a.get("status"):
                        task["status"] = a["status"]
                    break
    
    return [Task(**task) for task in tasks]

@router.patch("/tasks/{task_id}")
async def update_task_status(
    task_id: str,
    update: TaskUpdate,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update task status (employee can only update their own tasks)"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger Token")
    
    employee_id = payload.get("id")
    
    # Check if task belongs to this employee
    task = await db.tasks.find_one({
        "id": task_id,
        "$or": [
            {"assigned_to": employee_id},
            {"assignments.employee_id": employee_id}
        ]
    })
    
    if not task:
        raise HTTPException(status_code=404, detail="Aufgabe nicht gefunden")
    
    # Update per-employee status in assignments array
    update_data = update.dict(exclude_unset=True)
    new_status = update_data.get("status")
    
    if task.get("assignments"):
        # Multi-assignment: update only this employee's status
        await db.tasks.update_one(
            {"id": task_id, "assignments.employee_id": employee_id},
            {"$set": {"assignments.$.status": new_status}}
        )
        if new_status == "Abgeschlossen":
            await db.tasks.update_one(
                {"id": task_id, "assignments.employee_id": employee_id},
                {"$set": {"assignments.$.completed_at": datetime.utcnow().isoformat()}}
            )
    else:
        # Single assignment: update task level
        if new_status == "Abgeschlossen":
            update_data["completed_at"] = datetime.utcnow()
        await db.tasks.update_one(
            {"id": task_id},
            {"$set": update_data}
        )
    
    return {"message": "Aufgabe aktualisiert"}

@router.get("/stats")
async def get_employee_stats(
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get employee statistics"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger Token")
    
    employee_id = payload.get("id")
    
    # Get all tasks for this employee
    all_tasks = await db.tasks.find({
        "$or": [{"assigned_to": employee_id}, {"assignments.employee_id": employee_id}]
    }).to_list(200)
    
    # Count per-employee status
    total_tasks = len(all_tasks)
    open_tasks = 0
    in_progress = 0
    completed = 0
    total_provision = 0.0
    for task in all_tasks:
        total_provision += float(task.get("provision") or 0)
        status = task.get("status", "Offen")
        if task.get("assignments"):
            for a in task["assignments"]:
                if a.get("employee_id") == employee_id and a.get("status"):
                    status = a["status"]
                    break
        if status == "Offen":
            open_tasks += 1
        elif status == "In Bearbeitung":
            in_progress += 1
        elif status == "Abgeschlossen":
            completed += 1
    
    return {
        "total_tasks": total_tasks,
        "open_tasks": open_tasks,
        "in_progress": in_progress,
        "completed": completed,
        "total_provision": round(total_provision, 2)
    }

# ==================== PROFILE / SETTINGS ENDPOINTS ====================

@router.get("/profile")
async def get_profile(
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get employee profile data"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger Token")
    
    employee_id = payload.get("id")
    employee = await db.employees.find_one({"id": employee_id}, {"_id": 0, "password_hash": 0})
    
    if not employee:
        raise HTTPException(status_code=404, detail="Mitarbeiter nicht gefunden")
    
    # Get notification settings
    settings = await db.employee_settings.find_one({"employee_id": employee_id}, {"_id": 0})
    if not settings:
        settings = {
            "email_notifications": True,
            "task_reminders": True,
            "payout_notifications": True
        }
    
    return {
        **employee,
        "notifications": settings
    }


@router.put("/profile")
async def update_profile(
    profile: ProfileUpdate,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update employee profile"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger Token")
    
    employee_id = payload.get("id")
    
    update_data = {k: v for k, v in profile.dict().items() if v is not None}
    
    if update_data:
        await db.employees.update_one(
            {"id": employee_id},
            {"$set": update_data}
        )
    
    return {"message": "Profil aktualisiert"}


@router.post("/change-password")
async def change_password(
    passwords: PasswordChange,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Change employee password"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger Token")
    
    employee_id = payload.get("id")
    employee = await db.employees.find_one({"id": employee_id})
    
    if not employee:
        raise HTTPException(status_code=404, detail="Mitarbeiter nicht gefunden")
    
    # Verify current password
    if not verify_password(passwords.current_password, employee["password_hash"]):
        raise HTTPException(status_code=400, detail="Aktuelles Passwort ist falsch")
    
    # Validate new password
    if len(passwords.new_password) < 8:
        raise HTTPException(status_code=400, detail="Passwort muss mindestens 8 Zeichen haben")
    
    # Update password
    new_hash = get_password_hash(passwords.new_password)
    await db.employees.update_one(
        {"id": employee_id},
        {"$set": {"password_hash": new_hash, "password_changed_at": datetime.utcnow()}}
    )
    
    return {"message": "Passwort geändert"}


@router.put("/notifications")
async def update_notifications(
    settings: NotificationSettings,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update notification settings"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger Token")
    
    employee_id = payload.get("id")
    
    await db.employee_settings.update_one(
        {"employee_id": employee_id},
        {"$set": {
            "employee_id": employee_id,
            **settings.dict()
        }},
        upsert=True
    )
    
    return {"message": "Einstellungen gespeichert"}


# ==================== DOCUMENTS ENDPOINTS ====================

@router.get("/documents")
async def get_documents(
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get employee documents"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger Token")
    
    employee_id = payload.get("id")
    
    # Get documents from database
    documents = await db.employee_documents.find(
        {"employee_id": employee_id},
        {"_id": 0}
    ).sort("uploaded_at", -1).to_list(100)
    
    # Also include signed contracts
    contracts = await db.contracts.find(
        {"employee_id": employee_id.replace("emp-", "EMP").upper(), "status": "signed"},
        {"_id": 0}
    ).to_list(100)
    
    # Add contracts as documents
    for contract in contracts:
        documents.append({
            "id": contract["id"],
            "name": f"Arbeitsvertrag - {contract.get('position', 'Minijob')}.pdf",
            "type": "contract",
            "category": "Verträge",
            "size": "~50 KB",
            "uploaded_at": contract.get("signed_at", contract.get("created_at", datetime.utcnow())).strftime("%Y-%m-%d") if isinstance(contract.get("signed_at", contract.get("created_at")), datetime) else str(contract.get("signed_at", ""))[:10],
            "status": "approved",
            "is_contract": True
        })
    
    return documents


@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form("Sonstige"),
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Upload a document"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger Token")
    
    employee_id = payload.get("id")
    
    # Validate file type
    allowed_types = ["application/pdf", "image/jpeg", "image/png"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Nur PDF, JPEG und PNG erlaubt")
    
    # Validate file size (10MB max)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Datei zu groß (max. 10 MB)")
    
    # Save file
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "pdf"
    doc_id = f"doc-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
    filename = f"{employee_id}_{doc_id}.{file_ext}"
    filepath = os.path.join(DOCUMENTS_DIR, filename)
    
    with open(filepath, "wb") as f:
        f.write(content)
    
    # Save to database
    doc_data = {
        "id": doc_id,
        "employee_id": employee_id,
        "name": file.filename,
        "filename": filename,
        "type": "other",
        "category": category,
        "size": f"{round(len(content) / 1024)} KB",
        "uploaded_at": datetime.utcnow(),
        "status": "pending"
    }
    
    await db.employee_documents.insert_one(doc_data)
    
    return {
        "message": "Dokument hochgeladen",
        "document": {
            "id": doc_id,
            "name": file.filename,
            "category": category,
            "status": "pending"
        }
    }


@router.get("/documents/{doc_id}/download")
async def download_document(
    doc_id: str,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Download a document"""
    from fastapi.responses import FileResponse
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger Token")
    
    employee_id = payload.get("id")
    
    # Check if it's a contract
    if doc_id.startswith("contract-"):
        # Get contract and return the signed PDF
        contract = await db.contracts.find_one({"id": doc_id, "status": "signed"})
        if not contract:
            raise HTTPException(status_code=404, detail="Vertrag nicht gefunden")

        # Ownership check: only the owning employee (or an admin) may download this contract
        if payload.get("role") != "admin" and contract.get("employee_email") != payload.get("sub"):
            raise HTTPException(status_code=403, detail="Kein Zugriff auf diesen Vertrag")

        pdf_filename = contract.get("signed_pdf")
        if not pdf_filename:
            raise HTTPException(status_code=404, detail="PDF nicht verfügbar")
        
        pdf_path = os.path.join(BASE_DIR, "uploads", "contracts", pdf_filename)
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=404, detail="Datei nicht gefunden")
        
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=f"Arbeitsvertrag_{contract.get('employee_name', 'Mitarbeiter').replace(' ', '_')}.pdf"
        )
    
    # Regular document
    document = await db.employee_documents.find_one({"id": doc_id, "employee_id": employee_id})
    
    if not document:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")
    
    filepath = os.path.join(DOCUMENTS_DIR, document["filename"])
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Datei nicht gefunden")
    
    return FileResponse(
        filepath,
        filename=document["name"]
    )


@router.delete("/documents/{doc_id}")
async def delete_document(
    doc_id: str,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete a document"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger Token")
    
    employee_id = payload.get("id")
    
    document = await db.employee_documents.find_one({"id": doc_id, "employee_id": employee_id})
    
    if not document:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")
    
    # Don't allow deleting approved documents
    if document.get("status") == "approved":
        raise HTTPException(status_code=400, detail="Bestätigte Dokumente können nicht gelöscht werden")
    
    # Delete file
    filepath = os.path.join(DOCUMENTS_DIR, document["filename"])
    if os.path.exists(filepath):
        os.remove(filepath)
    
    # Delete from database
    await db.employee_documents.delete_one({"id": doc_id})
    
    return {"message": "Dokument gelöscht"}
