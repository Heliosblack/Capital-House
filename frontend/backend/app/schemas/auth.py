from pydantic import BaseModel, field_validator
from typing import Optional
import phonenumbers
from app.schemas.user import UserOut

def normalize_phone(v: str) -> str:
    try:
        parsed = phonenumbers.parse(v, "JO")
        if not phonenumbers.is_valid_number(parsed):
            raise ValueError("Invalid phone number")
        return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
    except phonenumbers.NumberParseException:
        raise ValueError("Invalid phone number format")

class SendOTPRequest(BaseModel):
    phone: str
    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v): return normalize_phone(v)

class VerifyOTPRequest(BaseModel):
    phone: str
    code: str
    full_name: Optional[str] = None
    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v): return normalize_phone(v)

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Optional[UserOut] = None

class RefreshRequest(BaseModel):
    refresh_token: str
