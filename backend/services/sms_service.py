"""
SMS Service using SMS Route API
https://smsroute.cc
"""
import os
import httpx
from typing import Optional
import logging

logger = logging.getLogger(__name__)

SMSROUTE_BASE_URL = "https://api.smsroute.cc"
SMSROUTE_API_KEY = os.environ.get("SMSROUTE_API_KEY", "")
SMSROUTE_SENDER_ID = os.environ.get("SMSROUTE_SENDER_ID", "PrecisionLab")


def get_headers():
    """Get authentication headers for SMS Route API"""
    return {
        "Authorization": f"Bearer {SMSROUTE_API_KEY}",
        "Content-Type": "application/json"
    }


async def send_sms(to: str, message: str, sender_id: Optional[str] = None) -> dict:
    """
    Send a single SMS message
    
    Args:
        to: Phone number in E.164 format (e.g., +491234567890)
        message: SMS message content (max 1600 chars)
        sender_id: Optional sender ID (max 11 chars alphanumeric)
    
    Returns:
        dict with status, messageId, cost, balance
    """
    if not SMSROUTE_API_KEY:
        logger.error("SMSROUTE_API_KEY not configured")
        return {"status": "error", "message": "SMS service not configured"}
    
    # Ensure phone number starts with +
    if not to.startswith("+"):
        to = f"+{to}"
    
    payload = {
        "to": to,
        "message": message,
        "sender_id": sender_id or SMSROUTE_SENDER_ID
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{SMSROUTE_BASE_URL}/sms/send",
                headers=get_headers(),
                json=payload
            )
            
            data = response.json()
            
            if response.status_code == 200 and data.get("status") == "success":
                logger.info(f"SMS sent successfully to {to[:8]}*** - ID: {data.get('messageId')}")
                return data
            else:
                logger.error(f"SMS send failed: {data}")
                return {"status": "error", "message": data.get("message", "Unknown error")}
                
    except Exception as e:
        logger.error(f"SMS send exception: {str(e)}")
        return {"status": "error", "message": str(e)}


async def send_bulk_sms(recipients: list, sender_id: Optional[str] = None) -> dict:
    """
    Send SMS to multiple recipients
    
    Args:
        recipients: List of dicts with 'to' and 'message' keys
        sender_id: Optional sender ID
    
    Returns:
        dict with batchId, totalMessages, estimatedCost
    """
    if not SMSROUTE_API_KEY:
        logger.error("SMSROUTE_API_KEY not configured")
        return {"status": "error", "message": "SMS service not configured"}
    
    # Ensure all phone numbers start with +
    for r in recipients:
        if not r["to"].startswith("+"):
            r["to"] = f"+{r['to']}"
    
    payload = {
        "recipients": recipients,
        "sender_id": sender_id or SMSROUTE_SENDER_ID
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{SMSROUTE_BASE_URL}/sms/send-bulk",
                headers=get_headers(),
                json=payload
            )
            
            data = response.json()
            
            if response.status_code == 200:
                logger.info(f"Bulk SMS sent - Batch: {data.get('batchId')}, Count: {data.get('totalMessages')}")
                return data
            else:
                logger.error(f"Bulk SMS failed: {data}")
                return {"status": "error", "message": data.get("message", "Unknown error")}
                
    except Exception as e:
        logger.error(f"Bulk SMS exception: {str(e)}")
        return {"status": "error", "message": str(e)}


async def get_balance() -> dict:
    """Get current SMS Route account balance"""
    if not SMSROUTE_API_KEY:
        return {"status": "error", "message": "SMS service not configured"}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{SMSROUTE_BASE_URL}/account/balance",
                headers=get_headers()
            )
            return response.json()
    except Exception as e:
        logger.error(f"Balance check failed: {str(e)}")
        return {"status": "error", "message": str(e)}


async def validate_phone(phone: str) -> dict:
    """
    Validate phone number using HLR lookup
    
    Args:
        phone: Phone number in E.164 format
    
    Returns:
        dict with valid, carrier, country, type
    """
    if not SMSROUTE_API_KEY:
        return {"status": "error", "message": "SMS service not configured"}
    
    if not phone.startswith("+"):
        phone = f"+{phone}"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{SMSROUTE_BASE_URL}/hlr/lookup",
                headers=get_headers(),
                json={"phone": phone}
            )
            return response.json()
    except Exception as e:
        logger.error(f"HLR lookup failed: {str(e)}")
        return {"status": "error", "message": str(e)}


# ============================================
# Pre-built notification templates
# ============================================

async def send_application_accepted_sms(phone: str, name: str) -> dict:
    """Send SMS when application is accepted"""
    message = f"Hallo {name}! Ihre Bewerbung bei Tdata Testing wurde akzeptiert. Bitte loggen Sie sich ein, um Ihren Arbeitsvertrag zu unterschreiben."
    return await send_sms(phone, message)


async def send_contract_signed_sms(phone: str, name: str) -> dict:
    """Send SMS when contract is signed"""
    message = f"Hallo {name}! Ihr Arbeitsvertrag wurde erfolgreich unterschrieben. Bitte laden Sie nun Ihre Ausweisdokumente zur Verifizierung hoch."
    return await send_sms(phone, message)


async def send_verification_complete_sms(phone: str, name: str) -> dict:
    """Send SMS when verification is complete"""
    message = f"Hallo {name}! Ihre Dokumente wurden hochgeladen. Wir pruefen diese und melden uns in Kuerze bei Ihnen."
    return await send_sms(phone, message)


async def send_account_unlocked_sms(phone: str, name: str) -> dict:
    """Send SMS when account is fully unlocked"""
    message = f"Willkommen bei Tdata Testing, {name}! Ihr Account wurde freigeschaltet. Sie koennen sich jetzt im Mitarbeiterportal einloggen."
    return await send_sms(phone, message)


async def send_task_assigned_sms(phone: str, name: str, task_title: str) -> dict:
    """Send SMS when a new task is assigned"""
    message = f"Hallo {name}! Ihnen wurde eine neue Aufgabe zugewiesen: {task_title}. Bitte loggen Sie sich ein fuer Details."
    return await send_sms(phone, message)


async def send_custom_sms(phone: str, message: str) -> dict:
    """Send a custom SMS message"""
    return await send_sms(phone, message)
