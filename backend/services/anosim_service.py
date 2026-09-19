"""
Anosim.net Service - Virtual Phone Numbers & SMS Codes
https://anosim.net
"""
import os
import httpx
from typing import Optional, List, Dict
import logging

logger = logging.getLogger(__name__)

ANOSIM_BASE_URL = "https://anosim.net/api/v1"


def get_anosim_key():
    return os.environ.get("ANOSIM_API_KEY", "")


def get_api_url(endpoint: str) -> str:
    """Build API URL with apikey parameter"""
    return f"{ANOSIM_BASE_URL}/{endpoint}?apikey={get_anosim_key()}"


async def get_purchased_numbers() -> dict:
    """
    Get list of all purchased/active phone numbers from Anosim
    Uses OrderBookingsCurrent to get active numbers
    
    Returns:
        dict with status and list of numbers
    """
    if not get_anosim_key():
        logger.error("ANOSIM_API_KEY not configured")
        return {"status": "error", "message": "Anosim service not configured"}
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Get current order bookings (active numbers)
            response = await client.get(get_api_url("OrderBookingsCurrent"))
            
            if response.status_code == 200:
                data = response.json()
                # Extract phone numbers from bookings
                numbers = []
                bookings = data if isinstance(data, list) else data.get("data", data.get("bookings", []))
                
                for booking in bookings:
                    # API returns "number" field, not "phoneNumber"
                    phone = booking.get("number") or booking.get("phoneNumber") or booking.get("phone")
                    if phone:
                        numbers.append({
                            "id": booking.get("id"),
                            "phone": phone,
                            "country": booking.get("country", ""),
                            "product": booking.get("service") or booking.get("productName", ""),
                            "status": booking.get("state", "active").lower(),
                            "expires_at": booking.get("endDate") or booking.get("expiresAt"),
                            "rental_type": booking.get("rentalType", "")
                        })
                
                logger.info(f"Fetched {len(numbers)} active numbers from Anosim")
                return {"status": "success", "numbers": numbers}
            else:
                logger.warning(f"Anosim API returned {response.status_code}")
                return {"status": "success", "numbers": []}
                
    except Exception as e:
        logger.error(f"Anosim get_purchased_numbers exception: {str(e)}")
        return {"status": "error", "message": str(e)}


async def get_sms_for_booking(booking_id: str) -> dict:
    """
    Get SMS messages for a specific order booking ID
    
    Args:
        booking_id: The Anosim order booking ID
    
    Returns:
        dict with status and list of SMS messages
    """
    if not get_anosim_key():
        logger.error("ANOSIM_API_KEY not configured")
        return {"status": "error", "message": "Anosim service not configured"}
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(get_api_url(f"Sms/{booking_id}"))
            
            if response.status_code == 200:
                data = response.json()
                messages = data if isinstance(data, list) else data.get("data", data.get("sms", []))
                logger.info(f"Fetched {len(messages)} SMS for booking {booking_id}")
                return {"status": "success", "messages": messages}
            else:
                logger.warning(f"Anosim SMS API returned {response.status_code} for booking {booking_id}: {response.text[:200]}")
                return {"status": "success", "messages": []}
                
    except Exception as e:
        logger.error(f"Anosim get_sms_for_booking exception for booking {booking_id}: {str(e)}")
        return {"status": "success", "messages": []}


async def get_sms_for_number(phone_number: str, limit: int = 20) -> dict:
    """
    Get SMS messages received on a specific number
    First finds the booking ID for the number, then fetches SMS
    
    Args:
        phone_number: The phone number to get SMS for (e.g., +491234567890)
        limit: Maximum number of messages to return
    
    Returns:
        dict with status and list of SMS messages
    """
    if not get_anosim_key():
        logger.error("ANOSIM_API_KEY not configured")
        return {"status": "error", "message": "Anosim service not configured"}
    
    # Clean phone number - remove any formatting
    clean_number = phone_number.replace(" ", "").replace("-", "")
    if not clean_number.startswith("+"):
        clean_number = f"+{clean_number}"
    
    try:
        # First get the booking ID for this number
        numbers_result = await get_purchased_numbers()
        if numbers_result["status"] != "success":
            return {"status": "success", "messages": [], "phone_number": clean_number}
        
        # Find the booking for this number
        booking_id = None
        for num in numbers_result.get("numbers", []):
            num_phone = num.get("phone", "").replace(" ", "").replace("-", "")
            if not num_phone.startswith("+"):
                num_phone = f"+{num_phone}"
            if num_phone == clean_number:
                booking_id = num.get("id")
                break
        
        if not booking_id:
            logger.info(f"No booking found for {clean_number[:8]}***")
            return {"status": "success", "messages": [], "phone_number": clean_number}
        
        # Get SMS for this booking
        sms_result = await get_sms_for_booking(str(booking_id))
        messages = sms_result.get("messages", [])[:limit]
        
        return {"status": "success", "messages": messages, "phone_number": clean_number}
                
    except Exception as e:
        logger.error(f"Anosim get_sms exception: {str(e)}")
        return {"status": "success", "messages": [], "phone_number": clean_number}


async def get_latest_sms(phone_number: str) -> dict:
    """
    Get the latest/most recent SMS for a number
    
    Args:
        phone_number: The phone number to check
    
    Returns:
        dict with the latest SMS or error
    """
    result = await get_sms_for_number(phone_number, limit=1)
    
    if result["status"] == "success" and result.get("messages"):
        return {"status": "success", "sms": result["messages"][0]}
    elif result["status"] == "success":
        return {"status": "success", "sms": None, "message": "Keine SMS vorhanden"}
    
    return result


async def get_balance() -> dict:
    """
    Get current Anosim account balance
    
    Returns:
        dict with balance information
    """
    if not get_anosim_key():
        return {"status": "error", "message": "Anosim service not configured"}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                get_api_url("balance")
            )
            return response.json()
    except Exception as e:
        logger.error(f"Anosim balance check failed: {str(e)}")
        return {"status": "error", "message": str(e)}


async def rent_number(country: str = "DE") -> dict:
    """
    Rent a new phone number
    
    Args:
        country: Country code (e.g., DE, AT, CH)
    
    Returns:
        dict with the rented number details
    """
    if not get_anosim_key():
        return {"status": "error", "message": "Anosim service not configured"}
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                get_api_url("numbers/rent"),
                json={"country": country}
            )
            
            data = response.json()
            
            if response.status_code == 200:
                logger.info(f"Rented new number: {data.get('number', 'unknown')}")
                return {"status": "success", **data}
            else:
                logger.error(f"Anosim rent_number failed: {data}")
                return {"status": "error", "message": data.get("message", "Unknown error")}
                
    except Exception as e:
        logger.error(f"Anosim rent_number exception: {str(e)}")
        return {"status": "error", "message": str(e)}


# Helper function to extract verification codes from SMS
def extract_verification_code(sms_text: str) -> Optional[str]:
    """
    Try to extract a verification code from SMS text
    
    Args:
        sms_text: The SMS message text
    
    Returns:
        The extracted code or None
    """
    import re
    
    # Common patterns for verification codes
    patterns = [
        r'\b(\d{4,8})\b',  # 4-8 digit numbers
        r'code[:\s]+(\d{4,8})',  # "code: 123456"
        r'Code[:\s]+(\d{4,8})',
        r'CODE[:\s]+(\d{4,8})',
        r'(\d{4,8})\s*ist\s*Ihr',  # German: "123456 ist Ihr Code"
        r'lautet[:\s]+(\d{4,8})',  # German: "lautet: 123456"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, sms_text)
        if match:
            return match.group(1)
    
    return None
