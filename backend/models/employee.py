from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
import uuid

class Employee(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    name: str
    position: str
    department: str = "Testing"
    employee_number: str
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    is_active: bool = True

class EmployeeLogin(BaseModel):
    email: EmailStr
    password: str

class EmployeeResponse(BaseModel):
    id: str
    email: str
    name: str
    position: str
    department: str
    employee_number: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    employee: EmployeeResponse

class TaskAssignment(BaseModel):
    """Individual assignment for a task - one per assigned employee"""
    employee_id: str
    employee_name: str
    employee_email: Optional[str] = None
    test_ident_link: Optional[str] = None
    test_login_email: Optional[str] = None
    test_login_password: Optional[str] = None
    test_phone_number: Optional[str] = None
    assigned_at: datetime = Field(default_factory=datetime.utcnow)
    due_date: Optional[str] = None
    status: str = "Offen"  # Offen, In Bearbeitung, Abgeschlossen

class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: Optional[str] = None  # 'bd' (Finanz/KYC) or 'app' (App Tests) - admin panel only
    ai_app_name: Optional[str] = None  # normalized app/exchange name if generated/tracked via AI
    provision: Optional[float] = 0  # commission in EUR shown to the employee
    website: Optional[str] = None
    einleitung: Optional[str] = None
    schritt1: Optional[str] = None
    schritt2: Optional[str] = None
    schritt3: Optional[str] = None
    # Legacy single assignment fields (kept for backward compatibility)
    assigned_to: str = ""  # employee_id
    assigned_to_name: Optional[str] = None  # employee name for display
    assigned_by: str = ""  # admin_id
    status: str = "Offen"  # Offen, In Bearbeitung, Abgeschlossen
    priority: str = "Normal"  # Niedrig, Normal, Hoch
    due_date: Optional[str] = None
    # Legacy single credential fields
    test_ident_link: Optional[str] = None
    test_login_email: Optional[str] = None
    test_login_password: Optional[str] = None
    test_phone_number: Optional[str] = None
    # NEW: Multiple assignments support
    assignments: List[TaskAssignment] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

class TaskCreate(BaseModel):
    title: str
    category: Optional[str] = None  # 'bd' or 'app'
    ai_app_name: Optional[str] = None
    provision: Optional[float] = 0
    website: Optional[str] = None
    einleitung: Optional[str] = None
    schritt1: Optional[str] = None
    schritt2: Optional[str] = None
    schritt3: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: str = "Normal"
    due_date: Optional[str] = None
    # New fields for test credentials
    test_ident_link: Optional[str] = None
    test_login_email: Optional[str] = None
    test_login_password: Optional[str] = None

class TaskUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None
    category: Optional[str] = None

class MultiAssignmentItem(BaseModel):
    """Single item in multi-assignment request"""
    employee_id: str
    test_ident_link: Optional[str] = None
    test_login_email: Optional[str] = None
    test_login_password: Optional[str] = None

class MultiAssignmentRequest(BaseModel):
    """Request body for assigning task to multiple employees"""
    assignments: List[MultiAssignmentItem]
