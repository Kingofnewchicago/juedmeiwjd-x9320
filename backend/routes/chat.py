from fastapi import APIRouter, HTTPException, Depends, Header, UploadFile, File, Form
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from utils.auth import decode_token
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional
import os
import uuid

router = APIRouter(prefix="/api/chat", tags=["chat"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "chat")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_db():
    from server import db
    return db


class SendMessage(BaseModel):
    recipient_id: str
    message: str


# Send a message (admin or employee)
@router.post("/send")
async def send_message(
    data: SendMessage,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger Token")

    sender_id = payload.get("id")
    sender_role = payload.get("role", "employee")

    # Get sender name
    if sender_role == "admin":
        admin = await db.admins.find_one({"id": sender_id}, {"_id": 0, "name": 1})
        sender_name = admin.get("name", "Admin") if admin else "Admin"
    else:
        emp = await db.employees.find_one({"id": sender_id}, {"_id": 0, "name": 1})
        if not emp:
            emp = await db.applications.find_one({"id": sender_id}, {"_id": 0, "name": 1})
        sender_name = emp.get("name", "Mitarbeiter") if emp else "Mitarbeiter"

    # Build conversation_id (always sorted so both sides find same conversation)
    participants = sorted([sender_id, data.recipient_id])
    conversation_id = f"{participants[0]}_{participants[1]}"

    msg_doc = {
        "conversation_id": conversation_id,
        "sender_id": sender_id,
        "sender_name": sender_name,
        "sender_role": sender_role,
        "recipient_id": data.recipient_id,
        "message": data.message,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    await db.messages.insert_one(msg_doc)

    return {"message": "Nachricht gesendet", "conversation_id": conversation_id}


# Get conversations list (admin sees all employee chats, employee sees their chat with admin)
@router.get("/conversations")
async def get_conversations(
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger Token")

    user_id = payload.get("id")
    role = payload.get("role", "employee")

    if role == "admin":
        # Admin: get all employees that have messages or are available to chat
        # First get all unique conversation partners
        pipeline = [
            {"$match": {"$or": [{"sender_id": user_id}, {"recipient_id": user_id}]}},
            {"$sort": {"created_at": -1}},
            {"$group": {
                "_id": "$conversation_id",
                "last_message": {"$first": "$message"},
                "last_sender": {"$first": "$sender_name"},
                "last_sender_role": {"$first": "$sender_role"},
                "last_time": {"$first": "$created_at"},
                "participants": {"$first": {"$cond": [
                    {"$eq": ["$sender_id", user_id]},
                    "$recipient_id",
                    "$sender_id"
                ]}}
            }}
        ]
        convos = await db.messages.aggregate(pipeline).to_list(100)

        # Get employee details for each conversation
        conversations = []
        for c in convos:
            partner_id = c["participants"]
            emp = await db.employees.find_one({"id": partner_id}, {"_id": 0, "id": 1, "name": 1, "email": 1, "position": 1})
            if not emp:
                emp = await db.applications.find_one({"id": partner_id}, {"_id": 0, "id": 1, "name": 1, "email": 1, "position": 1})
            if not emp:
                continue

            # Count unread
            unread = await db.messages.count_documents({
                "conversation_id": c["_id"],
                "recipient_id": user_id,
                "read": False
            })

            conversations.append({
                "conversation_id": c["_id"],
                "partner": emp,
                "last_message": c["last_message"][:50],
                "last_sender_role": c["last_sender_role"],
                "last_time": c["last_time"],
                "unread": unread
            })

        # Sort by last message time
        conversations.sort(key=lambda x: x["last_time"], reverse=True)
        return {"conversations": conversations}

    else:
        # Employee: find conversations with any admin
        pipeline = [
            {"$match": {"$or": [{"sender_id": user_id}, {"recipient_id": user_id}]}},
            {"$sort": {"created_at": -1}},
            {"$limit": 1}
        ]
        last_msg = await db.messages.aggregate(pipeline).to_list(1)
        
        if last_msg:
            convo_id = last_msg[0]["conversation_id"]
            unread = await db.messages.count_documents({
                "conversation_id": convo_id,
                "recipient_id": user_id,
                "read": False
            })
            return {"conversations": [{
                "conversation_id": convo_id,
                "partner": {"name": "Admin", "position": "Administrator"},
                "last_message": last_msg[0]["message"][:50],
                "last_time": last_msg[0]["created_at"],
                "unread": unread
            }]}
        
        return {"conversations": []}


# Get messages for a specific conversation
@router.get("/messages/{partner_id}")
async def get_messages(
    partner_id: str,
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger Token")

    user_id = payload.get("id")
    participants = sorted([user_id, partner_id])
    conversation_id = f"{participants[0]}_{participants[1]}"

    # Get messages
    messages = await db.messages.find(
        {"conversation_id": conversation_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(200)

    # Mark as read
    await db.messages.update_many(
        {"conversation_id": conversation_id, "recipient_id": user_id, "read": False},
        {"$set": {"read": True}}
    )

    return {"messages": messages, "conversation_id": conversation_id}


# Get unread count
@router.get("/unread")
async def get_unread_count(
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger Token")

    user_id = payload.get("id")
    count = await db.messages.count_documents({"recipient_id": user_id, "read": False})
    
    return {"unread": count}


# Upload image and send as message
@router.post("/send-image")
async def send_image(
    recipient_id: str = Form(...),
    file: UploadFile = File(...),
    authorization: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Keine Autorisierung")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger Token")

    # Validate file type
    allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Nur Bilder erlaubt (jpg, png, gif, webp)")

    # Save file
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    sender_id = payload.get("id")
    sender_role = payload.get("role", "employee")

    # Get sender name
    if sender_role == "admin":
        admin = await db.admins.find_one({"id": sender_id}, {"_id": 0, "name": 1})
        sender_name = admin.get("name", "Admin") if admin else "Admin"
    else:
        emp = await db.employees.find_one({"id": sender_id}, {"_id": 0, "name": 1})
        if not emp:
            emp = await db.applications.find_one({"id": sender_id}, {"_id": 0, "name": 1})
        sender_name = emp.get("name", "Mitarbeiter") if emp else "Mitarbeiter"

    participants = sorted([sender_id, recipient_id])
    conversation_id = f"{participants[0]}_{participants[1]}"

    msg_doc = {
        "conversation_id": conversation_id,
        "sender_id": sender_id,
        "sender_name": sender_name,
        "sender_role": sender_role,
        "recipient_id": recipient_id,
        "message": "",
        "image": filename,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    await db.messages.insert_one(msg_doc)

    return {"message": "Bild gesendet", "image": filename}


# Serve chat images
@router.get("/image/{filename}")
async def get_chat_image(filename: str):
    # Prevent path traversal: only allow a bare filename inside UPLOAD_DIR
    safe_name = os.path.basename(filename)
    filepath = os.path.realpath(os.path.join(UPLOAD_DIR, safe_name))
    upload_root = os.path.realpath(UPLOAD_DIR)
    if not filepath.startswith(upload_root + os.sep):
        raise HTTPException(status_code=404, detail="Bild nicht gefunden")
    if not os.path.isfile(filepath):
        raise HTTPException(status_code=404, detail="Bild nicht gefunden")
    return FileResponse(filepath)
