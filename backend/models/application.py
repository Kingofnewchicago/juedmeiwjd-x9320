from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import uuid

class Application(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    mobilnummer: str
    geburtsdatum: str
    staatsangehoerigkeit: str
    strasse: str
    postleitzahl: str
    stadt: str
    position: str
    message: Optional[str] = None
    password_hash: str = ""  # Hashed password
    cv_filename: Optional[str] = None
    status: str = "Neu"  # Neu, Akzeptiert, Verifiziert, Freigeschaltet
    contract_type: Optional[str] = "vollzeit"  # vollzeit, teilzeit, minijob
    verification_front: Optional[str] = None  # ID front image path
    verification_back: Optional[str] = None  # ID back image path
    verified_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ApplicationCreate(BaseModel):
    name: str
    email: EmailStr
    mobilnummer: str
    geburtsdatum: str
    staatsangehoerigkeit: str
    strasse: str
    postleitzahl: str
    stadt: str
    position: str
    message: Optional[str] = None
    password: str  # User-chosen password
    cv_filename: Optional[str] = None
    referral_slug: Optional[str] = None  # From referral link e.g. /bewerbungen/{slug}

class ApplicationResponse(BaseModel):
    id: str
    name: str
    email: str
    mobilnummer: str
    geburtsdatum: str
    staatsangehoerigkeit: str
    strasse: str
    postleitzahl: str
    stadt: str
    position: str
    message: Optional[str] = None
    cv_filename: Optional[str]
    status: str
    contract_type: Optional[str] = "vollzeit"
    contract_signed_at: Optional[datetime] = None
    contract_start_date: Optional[str] = None
    contract_can_skip: Optional[bool] = None
    contractor: Optional[str] = None
    verification_front: Optional[str] = None
    verification_back: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    quiz_completed: Optional[bool] = None
    quiz_completed_at: Optional[str] = None
    quiz_approved: Optional[bool] = None
    quiz_approved_at: Optional[str] = None


class ApplicantLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    applicant: dict
