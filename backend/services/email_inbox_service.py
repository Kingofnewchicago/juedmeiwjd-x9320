"""
Email Inbox Service for Outlook IMAP integration
Connects to Outlook via IMAP to fetch verification codes from emails
"""
import imaplib
import email
from email.header import decode_header
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import ssl

class EmailInboxService:
    """Service to connect to email IMAP and extract verification codes"""
    
    # IMAP server configuration per provider
    IMAP_SERVERS = {
        "gmail.com": {"server": "imap.gmail.com", "port": 993},
        "googlemail.com": {"server": "imap.gmail.com", "port": 993},
        "gmx.de": {"server": "imap.gmx.net", "port": 993},
        "gmx.net": {"server": "imap.gmx.net", "port": 993},
        "gmx.at": {"server": "imap.gmx.net", "port": 993},
        "gmx.ch": {"server": "imap.gmx.net", "port": 993},
        "web.de": {"server": "imap.web.de", "port": 993},
    }
    
    # STRICT code patterns - code MUST appear adjacent to a verification keyword.
    # Ordered by specificity. Matched on full text in lowercase.
    # Each pattern must have exactly one capturing group = the code (4-8 digits).
    CODE_PATTERNS = [
        # "verification code: 123456", "bestätigungscode 123456", "security code - 123456"
        r'(?:verification\s+code|verifikations(?:code)?|bestätigungs(?:code)?|sicherheits(?:code)?|einmal[\-\s]?passwort|zugriffs(?:code)?|security\s+code|access\s+code|login\s+code|one[\-\s]?time\s+(?:password|code)|auth(?:entication)?\s+code|2fa\s+code|otp|pin)[\s:\-=•]{0,6}(\d{4,8})',
        # "code: 123456", "code is 123456", "code lautet 123456"
        r'\bcode\b[\s:\-=•]{0,4}(?:is|ist|lautet|:)?[\s:\-=•]{0,4}(\d{4,8})',
        # "Your/Ihr/Dein code is/lautet 123456"
        r'(?:your|ihr|dein|deinen)\s+(?:code|pin)[\s:\-=•]{0,6}(?:is|ist|lautet)?[\s:\-=•]{0,6}(\d{4,8})',
        # Reversed: "123456 is your code", "123456 ist ihr code", "123456 lautet"
        r'\b(\d{4,8})\s+(?:is\s+(?:your|the)\s+(?:verification|confirmation|security|access|login|auth(?:entication)?|one[\-\s]?time\s+)?\s*(?:code|password|pin)|ist\s+(?:dein|ihr|der)\s+(?:bestätigungs|verifizierungs|sicherheits|zugriffs)?\s*code|lautet)',
    ]

    # Numbers that look like codes but almost certainly aren't
    YEAR_RE = re.compile(r'^(19|20)\d{2}$')
    
    # Keywords that indicate verification emails
    VERIFICATION_KEYWORDS = [
        'verification', 'verify', 'code', 'bestätigung', 'verifizierung',
        'confirm', 'otp', 'pin', '2fa', 'two-factor', 'authenticat',
        'sicherheitscode', 'einmalpasswort', 'zugriffscode'
    ]
    
    def __init__(self, email_address: str, app_password: str):
        self.email_address = email_address
        self.app_password = app_password
        self.connection = None
        
        # Determine IMAP server from email domain
        domain = email_address.split("@")[-1].lower()
        config = self.IMAP_SERVERS.get(domain, {"server": "imap.gmail.com", "port": 993})
        self.imap_server = config["server"]
        self.imap_port = config["port"]
    
    def connect(self) -> bool:
        """Connect to IMAP server"""
        try:
            # Create SSL context
            context = ssl.create_default_context()
            
            # Connect to IMAP server
            self.connection = imaplib.IMAP4_SSL(
                self.imap_server, 
                self.imap_port,
                ssl_context=context
            )
            
            # Login
            self.connection.login(self.email_address, self.app_password)
            return True
        except imaplib.IMAP4.error as e:
            print(f"IMAP Login failed: {e}")
            return False
        except Exception as e:
            print(f"Connection error: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from IMAP server"""
        if self.connection:
            try:
                self.connection.logout()
            except:
                pass
            self.connection = None
    
    def _decode_header_value(self, value) -> str:
        """Decode email header value"""
        if value is None:
            return ""
        decoded_parts = decode_header(value)
        result = ""
        for part, encoding in decoded_parts:
            if isinstance(part, bytes):
                result += part.decode(encoding or 'utf-8', errors='ignore')
            else:
                result += part
        return result
    
    def _extract_body(self, msg) -> str:
        """Extract email body text"""
        body = ""
        
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition"))
                
                if content_type == "text/plain" and "attachment" not in content_disposition:
                    try:
                        payload = part.get_payload(decode=True)
                        if payload:
                            charset = part.get_content_charset() or 'utf-8'
                            body += payload.decode(charset, errors='ignore')
                    except:
                        pass
                elif content_type == "text/html" and "attachment" not in content_disposition and not body:
                    try:
                        payload = part.get_payload(decode=True)
                        if payload:
                            charset = part.get_content_charset() or 'utf-8'
                            html_body = payload.decode(charset, errors='ignore')
                            # Strip HTML tags for code extraction
                            body = re.sub(r'<[^>]+>', ' ', html_body)
                    except:
                        pass
        else:
            try:
                payload = msg.get_payload(decode=True)
                if payload:
                    charset = msg.get_content_charset() or 'utf-8'
                    body = payload.decode(charset, errors='ignore')
            except:
                pass
        
        return body
    
    def _is_verification_email(self, subject: str, body: str) -> bool:
        """Check if email is likely a verification email"""
        text = (subject + " " + body).lower()
        return any(keyword in text for keyword in self.VERIFICATION_KEYWORDS)
    
    def _is_plausible_code(self, code: str) -> bool:
        """Filter out numbers that look like codes but almost certainly aren't."""
        if not code or not code.isdigit():
            return False
        # Reject years (1900-2099) if exactly 4 digits
        if len(code) == 4 and self.YEAR_RE.match(code):
            return False
        # Reject all-same digits (00000, 11111, ...)
        if len(set(code)) == 1:
            return False
        return True

    def _extract_codes(self, text: str) -> List[str]:
        """
        Extract verification codes from text using strict context-aware patterns.
        Returns max 1 most likely code. Generic standalone numbers are NOT matched.
        """
        lowered = text.lower()
        for pattern in self.CODE_PATTERNS:
            matches = re.findall(pattern, lowered)
            for match in matches:
                if self._is_plausible_code(match):
                    return [match]
        return []
    
    def fetch_verification_emails(self, since_minutes: int = 60, limit: int = 20) -> List[Dict]:
        """Fetch recent verification emails with codes"""
        if not self.connection:
            if not self.connect():
                return []
        
        emails = []
        
        try:
            # Select inbox
            self.connection.select("INBOX")
            
            # Search for recent emails
            since_date = (datetime.now() - timedelta(minutes=since_minutes)).strftime("%d-%b-%Y")
            status, messages = self.connection.search(None, f'(SINCE "{since_date}")')
            
            if status != "OK":
                return []
            
            email_ids = messages[0].split()
            
            # Get most recent emails first
            email_ids = email_ids[-limit:] if len(email_ids) > limit else email_ids
            email_ids = list(reversed(email_ids))
            
            for email_id in email_ids:
                try:
                    status, msg_data = self.connection.fetch(email_id, "(RFC822)")
                    if status != "OK":
                        continue
                    
                    raw_email = msg_data[0][1]
                    msg = email.message_from_bytes(raw_email)
                    
                    # Get email details
                    subject = self._decode_header_value(msg.get("Subject", ""))
                    sender = self._decode_header_value(msg.get("From", ""))
                    date_str = msg.get("Date", "")
                    body = self._extract_body(msg)
                    
                    # Check if it's a verification email
                    if not self._is_verification_email(subject, body):
                        continue
                    
                    # Extract codes (regex first - fast & free)
                    codes = self._extract_codes(subject + " " + body)
                    
                    # Parse date
                    try:
                        date_tuple = email.utils.parsedate_tz(date_str)
                        if date_tuple:
                            timestamp = email.utils.mktime_tz(date_tuple)
                            received_at = datetime.fromtimestamp(timestamp)
                        else:
                            received_at = datetime.now()
                    except:
                        received_at = datetime.now()

                    emails.append({
                        "sender": sender,
                        "subject": subject[:100],  # Truncate long subjects
                        "codes": codes,
                        "received_at": received_at.isoformat(),
                        "email_id": email_id.decode() if isinstance(email_id, bytes) else str(email_id),
                    })
                
                except Exception as e:
                    print(f"Error processing email: {e}")
                    continue
            
        except Exception as e:
            print(f"Error fetching emails: {e}")
        
        return emails
    
    def test_connection(self) -> Dict:
        """Test if credentials are valid"""
        try:
            if self.connect():
                self.disconnect()
                return {"success": True, "message": "Verbindung erfolgreich"}
            else:
                return {"success": False, "message": "Login fehlgeschlagen - Prüfen Sie E-Mail und App-Passwort"}
        except Exception as e:
            return {"success": False, "message": f"Verbindungsfehler: {str(e)}"}


def get_verification_codes(email_address: str, app_password: str, since_minutes: int = 60) -> List[Dict]:
    """
    Convenience function to get verification codes from an email account
    
    Args:
        email_address: The Outlook email address
        app_password: The app password for the account
        since_minutes: How far back to search (default 60 minutes)
    
    Returns:
        List of dicts with sender, subject, codes, received_at
    """
    service = EmailInboxService(email_address, app_password)
    try:
        results = service.fetch_verification_emails(since_minutes=since_minutes)
        # Strip private field
        for r in results:
            r.pop("_body_preview", None)
        return results
    finally:
        service.disconnect()


def test_email_credentials(email_address: str, app_password: str) -> Dict:
    """
    Test if email credentials are valid
    
    Returns:
        Dict with success (bool) and message (str)
    """
    service = EmailInboxService(email_address, app_password)
    return service.test_connection()
