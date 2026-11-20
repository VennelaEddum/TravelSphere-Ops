from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
import re

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"

class RegisterRequest(BaseModel):
    fullName: str = Field(..., min_length=3, description="Full Name of applicant")
    email: str = Field(..., min_length=5, description="Corporate or personal business email")
    phone: str = Field(..., min_length=10, description="10-digit Indian mobile number")
    accountType: str = Field(..., description="'Franchise Owner' or 'Branch Manager'")
    orgName: Optional[str] = Field(None, description="Business legal entity or firm name")
    branchName: Optional[str] = Field(None, description="Branch or territory name")
    location: Optional[str] = Field(None, description="City / state location")
    licenseType: Optional[str] = Field(None, description="License category e.g. Standard Unit Franchise")
    authCode: Optional[str] = Field(None, description="Invitation or authorization code for managers")
    password: str = Field(..., min_length=8, description="Account password (min 8 chars)")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", clean):
            raise ValueError("Invalid email format")
        return clean

class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", clean):
            raise ValueError("Invalid email format")
        return clean

class ApproveRequest(BaseModel):
    reviewed_by: Optional[str] = "Super Admin"
    notes: Optional[str] = None

class RejectRequest(BaseModel):
    reason: Optional[str] = "Application does not meet franchise qualification criteria"
    reviewed_by: Optional[str] = "Super Admin"

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    title: Optional[str] = None
    franchiseId: Optional[int] = None
    franchiseName: Optional[str] = None
    branchId: Optional[int] = None
    branchName: Optional[str] = None
    city: Optional[str] = None
    assignedModules: Optional[List[str]] = None

class LoginResponse(BaseModel):
    success: bool
    token: str
    user: UserResponse
    isDemo: bool = False

class RegistrationResponse(BaseModel):
    success: bool
    status: str
    referenceId: str
    submittedAt: str
    message: str

class CreateStaffRequest(BaseModel):
    fullName: str
    email: str
    phone: str
    role: str = "Staff"
    title: str = "Travel Consultant"
    branchId: int
    password: str = "Staff@123"

class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None

class ChatResponse(BaseModel):
    reply: str
    data_scope: str
    authorized_role: str
    records_accessed: Optional[int] = 0
    is_demo: bool = True
