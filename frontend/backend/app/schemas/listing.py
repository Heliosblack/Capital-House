from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from app.models.listing import ListingType, PropertyType, ListingStatus


class ListingImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    url: str
    is_primary: bool
    sort_order: int


class AgentSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    full_name: str
    full_name_ar: Optional[str] = None
    avatar_url: Optional[str] = None
    whatsapp_number: Optional[str] = None
    is_trusted_agent: bool


class ListingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    short_id: str
    title: str
    title_ar: Optional[str] = None
    description: Optional[str] = None
    description_ar: Optional[str] = None
    listing_type: str
    property_type: str
    status: str
    price: Decimal
    price_negotiable: bool
    governorate: str
    area: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area_sqm: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    floor_number: Optional[int] = None
    total_floors: Optional[int] = None
    furnished: Optional[bool] = None
    extra_attributes: Optional[Any] = None
    is_verified: bool
    is_featured: bool
    view_count: int
    whatsapp_clicks: int
    images: List[ListingImageOut] = []
    agent: AgentSummary
    created_at: datetime
    updated_at: datetime


class ListingCreate(BaseModel):
    title: str = Field(min_length=5, max_length=255)
    title_ar: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    description_ar: Optional[str] = None
    listing_type: ListingType
    property_type: PropertyType
    price: Decimal = Field(gt=0)
    price_negotiable: bool = False
    governorate: str = Field(min_length=2, max_length=100)
    area: str = Field(min_length=2, max_length=100)
    address: Optional[str] = Field(None, max_length=500)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area_sqm: Optional[float] = None
    bedrooms: Optional[int] = Field(None, ge=0, le=50)
    bathrooms: Optional[int] = Field(None, ge=0, le=20)
    floor_number: Optional[int] = None
    total_floors: Optional[int] = None
    furnished: Optional[bool] = None
    extra_attributes: Optional[Any] = None


class ListingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=255)
    title_ar: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    description_ar: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    price_negotiable: Optional[bool] = None
    governorate: Optional[str] = None
    area: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area_sqm: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    floor_number: Optional[int] = None
    total_floors: Optional[int] = None
    furnished: Optional[bool] = None
    extra_attributes: Optional[Any] = None
    status: Optional[ListingStatus] = None


class PaginatedListings(BaseModel):
    items: List[ListingOut]
    total: int
    page: int
    size: int
    pages: int
