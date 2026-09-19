from fastapi import APIRouter, HTTPException, Depends, Header, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.admin import AdminLogin, TokenResponse, AdminResponse
from models.employee import Task, TaskCreate, TaskAssignment, MultiAssignmentRequest
from utils.auth import verify_password, create_access_token, decode_token, get_password_hash
from datetime import timedelta, datetime, timezone
from typing import List
import uuid
import os
import time

# Import SMS service
from services.sms_service import send_task_assigned_sms

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Base directory for file paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Get database instance - will be injected
def get_db():
    from server import db
    return db

# --- Brute-force protection (Sicherheitsvorfall 2026-08 Nachsorge) ---
FAILED_LOGIN_LIMIT = 5          # Anzahl erlaubter Fehlversuche
LOCKOUT_SECONDS = 15 * 60       # Sperrdauer nach Überschreitung (15 Min)


def _client_ip(request: Request) -> str:
    """Echte Client-IP hinter Nginx-Proxy ermitteln."""
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def _log_admin_login(db, email: str, ip: str, success: bool, reason: str):
    """Einfaches DB-Audit-Log für Admin-Login-Versuche."""
    try:
        await db.admin_login_audit.insert_one({
            "email": email,
            "ip": ip,
            "success": success,
            "reason": reason,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception:
        pass  # Audit-Log darf den Login niemals blockieren


async def _register_failed_attempt(db, identifier: str, now: float):
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    prev = attempt.get("failed_count", 0) if attempt else 0
    locked_until = attempt.get("locked_until_ts", 0) if attempt else 0
    if locked_until and locked_until <= now:
        prev = 0  # vorherige Sperre abgelaufen -> Zähler neu starten
    count = prev + 1
    update = {"failed_count": count, "last_attempt_ts": now}
    if count >= FAILED_LOGIN_LIMIT:
        update["locked_until_ts"] = now + LOCKOUT_SECONDS
    await db.login_attempts.update_one(
        {"identifier": identifier}, {"$set": update}, upsert=True
    )


@router.post("/login", response_model=TokenResponse)
async def admin_login(credentials: AdminLogin, request: Request, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Admin login endpoint (mit Brute-Force-Schutz)"""
    ip = _client_ip(request)
    identifier = f"{ip}:{credentials.email.strip().lower()}"
    now = time.time()

    # 1) Sperre prüfen
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("locked_until_ts", 0) > now:
        wait_min = int((attempt["locked_until_ts"] - now) // 60) + 1
        await _log_admin_login(db, credentials.email, ip, False, "locked")
        raise HTTPException(
            status_code=429,
            detail=f"Zu viele fehlgeschlagene Anmeldeversuche. Bitte versuchen Sie es in ca. {wait_min} Minute(n) erneut.",
        )

    # 2) Anmeldedaten prüfen
    admin = await db.admins.find_one({"email": credentials.email})
    if not admin or not verify_password(credentials.password, admin["password_hash"]):
        await _register_failed_attempt(db, identifier, now)
        await _log_admin_login(db, credentials.email, ip, False, "invalid_credentials")
        raise HTTPException(status_code=401, detail="Ungültige Anmeldedaten")

    # 3) Erfolg -> Fehlversuche zurücksetzen
    await db.login_attempts.delete_one({"identifier": identifier})
    await _log_admin_login(db, credentials.email, ip, True, "success")

    # Update last login
    await db.admins.update_one(
        {"_id": admin["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    # Create access token (long-lived; user logs out manually)
    access_token_expires = timedelta(days=365)
    access_token = create_access_token(
        data={"sub": admin["email"], "id": admin["id"], "role": admin["role"]},
        expires_delta=access_token_expires
    )
    
    admin_response = AdminResponse(
        id=admin["id"],
        email=admin["email"],
        name=admin["name"],
        role=admin["role"]
    )
    
    return TokenResponse(
        access_token=access_token,
        admin=admin_response
    )

@router.get("/verify")
async def verify_token(authorization: str = Header(None)):
    """Verify if token is valid"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine gültige Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger oder abgelaufener Token")
    
    return {"valid": True, "email": payload.get("sub"), "role": payload.get("role")}

# ========== TASK MANAGEMENT ==========

def verify_admin_token(authorization: str = Header(None)):
    """Helper to verify admin token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine gültige Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload or payload.get("role") != "admin":
        raise HTTPException(status_code=401, detail="Ungültiger oder abgelaufener Token")
    
    return payload

@router.get("/employees")
async def get_employees(
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all employees for task assignment dropdown"""
    verify_admin_token(authorization)
    
    # Get employees from dedicated employees collection
    employees = await db.employees.find(
        {"is_active": True},
        {"_id": 0, "id": 1, "name": 1, "email": 1, "position": 1, "department": 1}
    ).to_list(100)
    
    # Also get accepted/verified/unlocked applicants from applications collection
    applicants = await db.applications.find(
        {"status": {"$in": ["Akzeptiert", "Verifiziert", "Freigeschaltet", "Vertrag unterschrieben"]}},
        {"_id": 0, "id": 1, "name": 1, "email": 1, "position": 1}
    ).to_list(100)
    
    # Merge, avoiding duplicates by email
    existing_emails = {e["email"] for e in employees}
    for app in applicants:
        if app.get("email") not in existing_emails:
            employees.append({
                "id": app["id"],
                "name": app.get("name", ""),
                "email": app.get("email", ""),
                "position": app.get("position", ""),
                "department": "Mitarbeiter"
            })
            existing_emails.add(app["email"])
    
    return employees

@router.post("/tasks", response_model=Task)
async def create_task(
    task_data: TaskCreate,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new task (optionally assign to employee)"""
    admin_payload = verify_admin_token(authorization)
    
    assigned_to_name = None
    employee = None
    
    # Get employee info if assigned
    if task_data.assigned_to:
        employee = await db.employees.find_one({"id": task_data.assigned_to})
        if employee:
            assigned_to_name = employee["name"]
    
    # Auto-compute due_date: 1 day after creation/assignment (override any client value)
    from datetime import timedelta as _timedelta
    auto_due_date = (datetime.utcnow() + _timedelta(days=1)).date().isoformat()
    
    # Create task
    task = Task(
        id=str(uuid.uuid4()),
        title=task_data.title,
        category=task_data.category,
        ai_app_name=(task_data.ai_app_name or "").strip().lower() or None,
        provision=task_data.provision or 0,
        website=task_data.website,
        einleitung=task_data.einleitung,
        schritt1=task_data.schritt1,
        schritt2=task_data.schritt2,
        schritt3=task_data.schritt3,
        assigned_to=task_data.assigned_to or "",
        assigned_to_name=assigned_to_name or "",
        assigned_by=admin_payload.get("id"),
        priority=task_data.priority,
        due_date=auto_due_date,
        status="Offen",
        created_at=datetime.utcnow()
    )
    
    # Insert into database
    task_dict = task.model_dump()
    task_dict["created_at"] = task_dict["created_at"].isoformat()
    if task_dict.get("completed_at"):
        task_dict["completed_at"] = task_dict["completed_at"].isoformat()
    
    await db.tasks.insert_one(task_dict)
    
    return task

@router.get("/tasks", response_model=List[Task])
async def get_all_tasks(
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all tasks (admin view)"""
    verify_admin_token(authorization)
    
    tasks = await db.tasks.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Convert datetime strings back
    for task in tasks:
        if isinstance(task.get("created_at"), str):
            task["created_at"] = datetime.fromisoformat(task["created_at"])
        if task.get("completed_at") and isinstance(task["completed_at"], str):
            task["completed_at"] = datetime.fromisoformat(task["completed_at"])
    
    return tasks

@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: str,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete a task"""
    verify_admin_token(authorization)
    
    result = await db.tasks.delete_one({"id": task_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Aufgabe nicht gefunden")
    
    return {"message": "Aufgabe gelöscht"}


@router.put("/tasks/{task_id}/category")
async def update_task_category(
    task_id: str,
    data: dict,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update the admin-panel category of a task ('bd' or 'app')"""
    verify_admin_token(authorization)

    category = (data or {}).get("category")
    if category not in ("bd", "app"):
        raise HTTPException(status_code=400, detail="Ungültige Kategorie")

    result = await db.tasks.update_one({"id": task_id}, {"$set": {"category": category}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Aufgabe nicht gefunden")

    return {"message": "Kategorie aktualisiert", "category": category}


@router.put("/tasks/{task_id}/credentials")
async def update_task_credentials(
    task_id: str,
    data: dict,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update task test credentials"""
    verify_admin_token(authorization)
    
    # Find the task
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Aufgabe nicht gefunden")
    
    # Update only credential fields
    update_data = {}
    if "test_ident_link" in data:
        update_data["test_ident_link"] = data["test_ident_link"]
    if "test_login_email" in data:
        update_data["test_login_email"] = data["test_login_email"]
    if "test_login_password" in data:
        update_data["test_login_password"] = data["test_login_password"]
    
    if update_data:
        await db.tasks.update_one(
            {"id": task_id},
            {"$set": update_data}
        )
    
    return {"message": "Test-Zugangsdaten aktualisiert"}


@router.put("/tasks/{task_id}/assign")
async def assign_task(
    task_id: str,
    data: dict,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Assign a task to an employee with optional test credentials"""
    verify_admin_token(authorization)
    
    # Find the task
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Aufgabe nicht gefunden")
    
    assigned_to = data.get("assigned_to")
    if not assigned_to:
        raise HTTPException(status_code=400, detail="Mitarbeiter muss ausgewählt werden")
    
    # Get employee name - check both collections
    employee = await db.employees.find_one({"id": assigned_to})
    if not employee:
        employee = await db.applications.find_one({"id": assigned_to})
    assigned_to_name = employee.get("name") if employee else "Unbekannt"
    
    # Prepare update data
    update_data = {
        "assigned_to": assigned_to,
        "assigned_to_name": assigned_to_name,
        "test_ident_link": data.get("test_ident_link", ""),
        "test_login_email": data.get("test_login_email", ""),
        "test_login_password": data.get("test_login_password", "")
    }
    
    await db.tasks.update_one(
        {"id": task_id},
        {"$set": update_data}
    )
    
    return {"message": "Aufgabe zugewiesen", "assigned_to_name": assigned_to_name}


@router.put("/tasks/{task_id}/assign-multiple")
async def assign_task_multiple(
    task_id: str,
    request: MultiAssignmentRequest,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Assign a task to multiple employees, each with their own test credentials"""
    verify_admin_token(authorization)
    
    # Find the task
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Aufgabe nicht gefunden")
    
    if not request.assignments or len(request.assignments) == 0:
        raise HTTPException(status_code=400, detail="Mindestens ein Mitarbeiter muss ausgewählt werden")
    
    # Build assignments list
    assignments = []
    assigned_names = []
    
    # Compute due_date as next day after assignment (UTC)
    from datetime import timedelta as _timedelta
    now_utc = datetime.utcnow()
    auto_due_date = (now_utc + _timedelta(days=1)).date().isoformat()
    
    for item in request.assignments:
        # Get employee info - check both employees and applications collections
        employee = await db.employees.find_one({"id": item.employee_id})
        if not employee:
            employee = await db.applications.find_one({"id": item.employee_id})
        if not employee:
            continue
        
        assignment = {
            "employee_id": item.employee_id,
            "employee_name": employee.get("name", "Unbekannt"),
            "employee_email": employee.get("email", ""),
            "test_ident_link": item.test_ident_link or "",
            "test_login_email": item.test_login_email or "",
            "test_login_password": item.test_login_password or "",
            "assigned_at": now_utc.isoformat(),
            "due_date": auto_due_date,
            "status": "Offen"
        }
        assignments.append(assignment)
        assigned_names.append(employee.get("name", "Unbekannt"))
    
    if not assignments:
        raise HTTPException(status_code=400, detail="Keine gültigen Mitarbeiter gefunden")
    
    # Update task with multiple assignments
    # Also set legacy fields with first assignment for backward compatibility
    first_assignment = assignments[0]
    update_data = {
        "assignments": assignments,
        "assigned_to": first_assignment["employee_id"],
        "assigned_to_name": ", ".join(assigned_names) if len(assigned_names) <= 3 else f"{len(assigned_names)} Mitarbeiter",
        "test_ident_link": first_assignment["test_ident_link"],
        "test_login_email": first_assignment["test_login_email"],
        "test_login_password": first_assignment["test_login_password"],
        "due_date": auto_due_date,
    }
    
    await db.tasks.update_one(
        {"id": task_id},
        {"$set": update_data}
    )
    
    # Send SMS notifications to all assigned employees
    for assignment in assignments:
        employee = await db.employees.find_one({"id": assignment["employee_id"]})
        if not employee:
            employee = await db.applications.find_one({"id": assignment["employee_id"]})
        if employee:
            phone = employee.get("phone", "") or employee.get("mobilnummer", "")
            if phone:
                await send_task_assigned_sms(phone, assignment["employee_name"], task.get("title", "Neue Aufgabe"))
    
    return {
        "message": f"Aufgabe an {len(assignments)} Mitarbeiter zugewiesen",
        "assigned_count": len(assignments),
        "assigned_names": assigned_names
    }


# ========== DOCUMENT MANAGEMENT ==========

@router.get("/documents")
async def get_all_documents(
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all employee documents (admin view)"""
    verify_admin_token(authorization)
    
    # Get all documents
    documents = await db.employee_documents.find({}, {"_id": 0}).sort("uploaded_at", -1).to_list(500)
    
    # Get employee names for each document
    for doc in documents:
        employee = await db.employees.find_one(
            {"id": doc.get("employee_id")},
            {"_id": 0, "name": 1, "email": 1}
        )
        if employee:
            doc["employee_name"] = employee.get("name", "Unbekannt")
            doc["employee_email"] = employee.get("email", "")
        else:
            # Try to find in applications (for applicants)
            app = await db.applications.find_one(
                {"id": doc.get("employee_id")},
                {"_id": 0, "name": 1, "email": 1}
            )
            if app:
                doc["employee_name"] = app.get("name", "Unbekannt")
                doc["employee_email"] = app.get("email", "")
            else:
                doc["employee_name"] = "Unbekannt"
                doc["employee_email"] = ""
        
        # Format uploaded_at
        if isinstance(doc.get("uploaded_at"), datetime):
            doc["uploaded_at"] = doc["uploaded_at"].strftime("%Y-%m-%d %H:%M")
    
    return documents


@router.put("/documents/{doc_id}/approve")
async def approve_document(
    doc_id: str,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Approve a document"""
    verify_admin_token(authorization)
    
    result = await db.employee_documents.update_one(
        {"id": doc_id},
        {"$set": {"status": "approved", "approved_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")
    
    return {"message": "Dokument bestätigt", "status": "approved"}


@router.put("/documents/{doc_id}/reject")
async def reject_document(
    doc_id: str,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Reject a document"""
    verify_admin_token(authorization)
    
    result = await db.employee_documents.update_one(
        {"id": doc_id},
        {"$set": {"status": "rejected", "rejected_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")
    
    return {"message": "Dokument abgelehnt", "status": "rejected"}


@router.get("/documents/{doc_id}/download")
async def admin_download_document(
    doc_id: str,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Download a document (admin)"""
    from fastapi.responses import FileResponse
    import os
    
    verify_admin_token(authorization)
    
    document = await db.employee_documents.find_one({"id": doc_id})
    
    if not document:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")
    
    filepath = os.path.join(BASE_DIR, "uploads", "documents", document['filename'])
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Datei nicht gefunden")
    
    return FileResponse(
        filepath,
        filename=document["name"]
    )


@router.delete("/documents/{doc_id}")
async def admin_delete_document(
    doc_id: str,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete a document (admin)"""
    import os
    
    verify_admin_token(authorization)
    
    document = await db.employee_documents.find_one({"id": doc_id})
    
    if not document:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")
    
    # Delete file
    filepath = os.path.join(BASE_DIR, "uploads", "documents", document['filename'])
    if os.path.exists(filepath):
        os.remove(filepath)
    
    # Delete from database
    await db.employee_documents.delete_one({"id": doc_id})
    
    return {"message": "Dokument gelöscht"}
