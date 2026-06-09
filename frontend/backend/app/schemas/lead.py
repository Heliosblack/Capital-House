from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.models.lead import LeadStatus


class LeadCreate(BaseModel):
    listing_id: UUID
    buyer_name: str = Field(min_length=2, max_length=255)
    buyer_phone: str = Field(min_length=8, max_length=20)
    buyer_email: Optional[str] = None
    message: Optional[str] = None
    source: str = "direct"


class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[str] = None


class LeadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    listing_id: UUID
    agent_id: UUID
    buyer_name: str
    buyer_phone: str
    buyer_email: Optional[str] = None
    message: Optional[str] = None
    status: str
    source: str
    notes: Optional[str] = None
    tags: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class PaginatedLeads(BaseModel):
    items: List[LeadOut]
    total: int
    page: int
    size: int
    pages: int
