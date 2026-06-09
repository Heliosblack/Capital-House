import uuid
from datetime import datetime
from pydantic import BaseModel
from app.models.user import UserRole

class UserOut(BaseModel):
    id: uuid.UUID
    phone: str | None
    email: str | None
    full_name: str
    full_name_ar: str | None
    avatar_url: str | None
    role: str
    is_verified: bool
    is_phone_verified: bool
    is_trusted_agent: bool
    whatsapp_number: str | None
    bio: str | None
    created_at: datetime
    model_config = {"from_attributes": True}

class UserUpdate(BaseModel):
    full_name: str | None = None
    full_name_ar: str | None = None
    email: str | None = None
    bio: str | None = None
    whatsapp_number: str | None = None
    license_number: str | None = None
