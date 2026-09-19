"""
Anosim API Routes - Virtual Phone Numbers & SMS Codes
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from motor.motor_asyncio import AsyncIOMotorDatabase
from utils.auth import decode_token
from typing import Optional
from pydantic import BaseModel
import logging

# Import anosim service
from services.anosim_service import (
    get_purchased_numbers, 
    get_sms_for_number, 
    get_sms_for_booking,
    get_latest_sms,
    extract_verification_code
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/anosim", tags=["anosim"])


def get_db():
    from server import db
    return db


def verify_admin_token(authorization: str = Header(None)):
    """Helper to verify admin token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine gültige Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload or payload.get("role") != "admin":
        raise HTTPException(status_code=401, detail="Ungültiger oder abgelaufener Token")
    
    return payload


def verify_employee_token(authorization: str = Header(None)):
    """Helper to verify employee token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine gültige Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload or payload.get("role") not in ("employee", "applicant"):
        raise HTTPException(status_code=401, detail="Ungültiger oder abgelaufener Token")
    
    return payload


class AssignNumberRequest(BaseModel):
    employee_id: str
    anosim_number: str
    anosim_booking_id: Optional[str] = None


class RemoveNumberRequest(BaseModel):
    employee_id: str


# ==================== ADMIN ENDPOINTS ====================

@router.get("/numbers")
async def admin_get_numbers(
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get all available Anosim numbers (purchased numbers from Anosim API)
    Also returns which numbers are already assigned to employees
    """
    verify_admin_token(authorization)
    
    # Get purchased numbers from Anosim
    result = await get_purchased_numbers()
    
    if result["status"] != "success":
        raise HTTPException(status_code=500, detail=result.get("message", "Fehler beim Abrufen der Nummern"))
    
    # Get all current assignments from both collections
    emp_assignments = await db.employees.find(
        {"anosim_number": {"$exists": True, "$ne": ""}},
        {"_id": 0, "id": 1, "name": 1, "email": 1, "anosim_number": 1}
    ).to_list(100)
    app_assignments = await db.applications.find(
        {"anosim_number": {"$exists": True, "$ne": ""}},
        {"_id": 0, "id": 1, "name": 1, "email": 1, "anosim_number": 1}
    ).to_list(100)
    assignments = emp_assignments + app_assignments
    
    # Create a map of assigned numbers
    assigned_map = {a["anosim_number"]: a for a in assignments}
    
    # Mark which numbers are assigned
    numbers = result.get("numbers", [])
    for num in numbers:
        phone = num.get("phone", "")
        if phone in assigned_map:
            num["assigned_to"] = assigned_map[phone]
        else:
            num["assigned_to"] = None
    
    return {
        "status": "success",
        "numbers": numbers,
        "total_purchased": len(numbers),
        "total_assigned": len(assignments)
    }


@router.post("/assign")
async def admin_assign_number(
    request: AssignNumberRequest,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Assign an Anosim number to an employee (Admin only)
    """
    verify_admin_token(authorization)
    
    # Check if employee exists (in employees or applications collection)
    employee = await db.employees.find_one({"id": request.employee_id})
    if not employee:
        employee = await db.applications.find_one({"id": request.employee_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Mitarbeiter nicht gefunden")
    
    # Check if number is already assigned to another employee
    existing_assignment = await db.employees.find_one({
        "anosim_number": request.anosim_number,
        "id": {"$ne": request.employee_id}
    })
    if not existing_assignment:
        existing_assignment = await db.applications.find_one({
            "anosim_number": request.anosim_number,
            "id": {"$ne": request.employee_id}
        })
    if existing_assignment:
        raise HTTPException(
            status_code=400, 
            detail=f"Diese Nummer ist bereits {existing_assignment.get('name', 'einem anderen Mitarbeiter')} zugewiesen"
        )
    
    # Assign the number (update in the collection where the employee was found)
    from datetime import datetime, timezone
    update_data = {
        "anosim_number": request.anosim_number,
        "anosim_assigned_at": datetime.now(timezone.utc).isoformat()
    }
    if request.anosim_booking_id:
        update_data["anosim_booking_id"] = request.anosim_booking_id
    
    # Try employees first, then applications
    result = await db.employees.update_one(
        {"id": request.employee_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        await db.applications.update_one(
            {"id": request.employee_id},
            {"$set": update_data}
        )
    
    logger.info(f"Anosim number {request.anosim_number[:8]}*** assigned to employee {request.employee_id}")
    
    return {
        "message": "Nummer erfolgreich zugewiesen",
        "employee_id": request.employee_id,
        "employee_name": employee.get("name"),
        "anosim_number": request.anosim_number
    }


@router.post("/unassign")
async def admin_unassign_number(
    request: RemoveNumberRequest,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Remove Anosim number from an employee (Admin only)
    """
    verify_admin_token(authorization)
    
    # Check if employee exists
    employee = await db.employees.find_one({"id": request.employee_id})
    if not employee:
        employee = await db.applications.find_one({"id": request.employee_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Mitarbeiter nicht gefunden")
    
    # Remove the number from both collections
    await db.employees.update_one(
        {"id": request.employee_id},
        {"$unset": {"anosim_number": "", "anosim_booking_id": "", "anosim_assigned_at": ""}}
    )
    await db.applications.update_one(
        {"id": request.employee_id},
        {"$unset": {"anosim_number": "", "anosim_booking_id": "", "anosim_assigned_at": ""}}
    )
    
    logger.info(f"Anosim number removed from employee {request.employee_id}")
    
    return {
        "message": "Nummer erfolgreich entfernt",
        "employee_id": request.employee_id,
        "employee_name": employee.get("name")
    }


@router.get("/assignments")
async def admin_get_assignments(
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get all employees with assigned Anosim numbers (Admin only)
    """
    verify_admin_token(authorization)
    
    # Get all employees with anosim_number field from both collections
    emp_list = await db.employees.find(
        {"anosim_number": {"$exists": True, "$ne": ""}},
        {"_id": 0, "id": 1, "name": 1, "email": 1, "anosim_number": 1}
    ).to_list(100)
    app_list = await db.applications.find(
        {"anosim_number": {"$exists": True, "$ne": ""}},
        {"_id": 0, "id": 1, "name": 1, "email": 1, "anosim_number": 1}
    ).to_list(100)
    employees = emp_list + app_list
    
    return {"assignments": employees}


# ==================== EMPLOYEE ENDPOINTS ====================

@router.get("/my-number")
async def employee_get_my_number(
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get the employee's assigned Anosim number
    """
    payload = verify_employee_token(authorization)
    employee_id = payload.get("id")
    
    employee = await db.employees.find_one(
        {"id": employee_id},
        {"_id": 0, "anosim_number": 1}
    )
    if not employee:
        employee = await db.applications.find_one(
            {"id": employee_id},
            {"_id": 0, "anosim_number": 1}
        )
    
    if not employee or not employee.get("anosim_number"):
        return {"has_number": False, "anosim_number": None}
    
    return {
        "has_number": True,
        "anosim_number": employee.get("anosim_number")
    }


@router.get("/my-sms")
async def employee_get_my_sms(
    limit: int = 20,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get SMS messages for the employee's assigned number
    Only returns messages received AFTER the number was assigned
    """
    from datetime import datetime
    
    payload = verify_employee_token(authorization)
    employee_id = payload.get("id")
    
    # Get employee's assigned number, booking_id, and assignment timestamp
    employee = await db.employees.find_one(
        {"id": employee_id},
        {"_id": 0, "anosim_number": 1, "anosim_booking_id": 1, "anosim_assigned_at": 1}
    )
    if not employee or not employee.get("anosim_number"):
        employee = await db.applications.find_one(
            {"id": employee_id},
            {"_id": 0, "anosim_number": 1, "anosim_booking_id": 1, "anosim_assigned_at": 1}
        )
    
    if not employee or not employee.get("anosim_number"):
        raise HTTPException(
            status_code=404, 
            detail="Keine Anosim-Nummer zugewiesen. Bitte wenden Sie sich an Ihren Administrator."
        )
    
    phone_number = employee.get("anosim_number")
    booking_id = employee.get("anosim_booking_id")
    assigned_at_str = employee.get("anosim_assigned_at")
    
    # Parse assignment timestamp
    assigned_at = None
    if assigned_at_str:
        try:
            assigned_at = datetime.fromisoformat(assigned_at_str.replace('Z', '+00:00'))
        except:
            pass
    
    # Fetch SMS - use booking_id if available (faster, avoids rate limits)
    if booking_id:
        result = await get_sms_for_booking(booking_id)
        result["phone_number"] = phone_number
    else:
        result = await get_sms_for_number(phone_number, limit=limit)
    
    if result["status"] != "success":
        raise HTTPException(status_code=500, detail=result.get("message", "Fehler beim Abrufen der SMS"))
    
    # Filter messages to only show those received AFTER assignment
    messages = result.get("messages", [])
    filtered_messages = []
    
    for msg in messages:
        # Get message timestamp
        msg_date_str = msg.get("messageDate") or msg.get("received_at") or msg.get("timestamp") or msg.get("date")
        
        if assigned_at and msg_date_str:
            try:
                msg_date = datetime.fromisoformat(msg_date_str.replace('Z', '+00:00'))
                # Only include messages received after assignment
                if msg_date <= assigned_at:
                    continue
            except:
                pass
        
        # Extract verification code
        text = msg.get("messageText", msg.get("text", msg.get("message", msg.get("body", ""))))
        if text:
            code = extract_verification_code(text)
            if code:
                msg["extracted_code"] = code
        
        filtered_messages.append(msg)
    
    return {
        "phone_number": phone_number,
        "messages": filtered_messages[:limit],
        "assigned_at": assigned_at_str
    }


@router.get("/latest-code")
async def employee_get_latest_code(
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get the latest verification code for the employee
    """
    payload = verify_employee_token(authorization)
    employee_id = payload.get("id")
    
    # Get employee's assigned number
    employee = await db.employees.find_one(
        {"id": employee_id},
        {"_id": 0, "anosim_number": 1}
    )
    if not employee or not employee.get("anosim_number"):
        employee = await db.applications.find_one(
            {"id": employee_id},
            {"_id": 0, "anosim_number": 1}
        )
    
    if not employee or not employee.get("anosim_number"):
        raise HTTPException(
            status_code=404, 
            detail="Keine Anosim-Nummer zugewiesen"
        )
    
    phone_number = employee.get("anosim_number")
    
    # Fetch latest SMS
    result = await get_latest_sms(phone_number)
    
    if result["status"] != "success":
        raise HTTPException(status_code=500, detail=result.get("message", "Fehler"))
    
    sms = result.get("sms")
    if not sms:
        return {"phone_number": phone_number, "code": None, "message": "Keine SMS vorhanden"}
    
    # Extract code
    text = sms.get("text", sms.get("message", sms.get("body", "")))
    code = extract_verification_code(text) if text else None
    
    return {
        "phone_number": phone_number,
        "code": code,
        "sms": sms
    }
