from fastapi import APIRouter, HTTPException, Depends, Header
from motor.motor_asyncio import AsyncIOMotorDatabase
from utils.auth import decode_token
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

def get_db():
    from server import db
    return db

class QuizAnswer(BaseModel):
    question_id: int
    answer: str

class QuizSubmission(BaseModel):
    answers: List[QuizAnswer]

# Submit quiz answers
@router.post("/submit")
async def submit_quiz(
    submission: QuizSubmission,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger Token")
    
    applicant_id = payload.get("id")
    application = await db.applications.find_one({"id": applicant_id})
    if not application:
        raise HTTPException(status_code=404, detail="Bewerbung nicht gefunden")

    # Store quiz results
    quiz_data = {
        "applicant_id": applicant_id,
        "applicant_name": application.get("name", ""),
        "applicant_email": application.get("email", ""),
        "answers": [a.dict() for a in submission.answers],
        "submitted_at": datetime.now(timezone.utc).isoformat(),
    }

    # Upsert - replace if already exists
    await db.quizzes.update_one(
        {"applicant_id": applicant_id},
        {"$set": quiz_data},
        upsert=True
    )

    # Update application to mark quiz as completed
    await db.applications.update_one(
        {"id": applicant_id},
        {"$set": {"quiz_completed": True, "quiz_completed_at": datetime.now(timezone.utc).isoformat()}}
    )

    return {"message": "Quiz abgeschlossen", "success": True}


# Check if quiz is completed
@router.get("/status")
async def get_quiz_status(
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger Token")
    
    applicant_id = payload.get("id")
    application = await db.applications.find_one({"id": applicant_id}, {"_id": 0})
    if not application:
        raise HTTPException(status_code=404, detail="Bewerbung nicht gefunden")

    return {
        "quiz_completed": application.get("quiz_completed", False),
        "quiz_completed_at": application.get("quiz_completed_at", None)
    }


# Admin: Get quiz answers for a specific applicant
@router.get("/admin/{applicant_id}")
async def get_quiz_answers(
    applicant_id: str,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload or payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Nur Admins")

    quiz = await db.quizzes.find_one({"applicant_id": applicant_id}, {"_id": 0})
    if not quiz:
        return {"completed": False, "answers": []}
    
    return {"completed": True, **quiz}


# Admin: Approve quiz (allow employee to proceed to contract)
@router.post("/admin/{applicant_id}/approve")
async def approve_quiz(
    applicant_id: str,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload or payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Nur Admins")

    application = await db.applications.find_one({"id": applicant_id})
    if not application:
        raise HTTPException(status_code=404, detail="Bewerbung nicht gefunden")
    
    if not application.get("quiz_completed"):
        raise HTTPException(status_code=400, detail="Quiz noch nicht abgeschlossen")

    await db.applications.update_one(
        {"id": applicant_id},
        {"$set": {"quiz_approved": True, "quiz_approved_at": datetime.now(timezone.utc).isoformat()}}
    )

    return {"message": "Quiz freigegeben, Mitarbeiter kann jetzt den Vertrag unterschreiben"}
