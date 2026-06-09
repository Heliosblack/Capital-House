import uuid
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import Boolean, DateTime, Float, Integer, Numeric, String, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class ListingType(str, Enum):
    SALE = "sale"
    RENT = "rent"

class PropertyType(str, Enum):
    APARTMENT = "apartment"
    VILLA = "villa"
    HOME = "home"
    LAND = "land"
    FARM = "farm"
    COMMERCIAL = "commercial"

class ListingStatus(str, Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    ACTIVE = "active"
    SOLD = "sold"
    RENTED = "rented"
    OFF_MARKET = "off_market"
    REJECTED = "rejected"

class Listing(Base):
    __tablename__ = "listings"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    short_id: Mapped[str] = mapped_column(String(12), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    title_ar: Mapped[str | None] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    description_ar: Mapped[str | None] = mapped_column(Text)
    listing_type: Mapped[str] = mapped_column(String(10), index=True)
    property_type: Mapped[str] = mapped_column(String(20), index=True)
    status: Mapped[str] = mapped_column(String(20), default=ListingStatus.DRAFT, index=True)
    price: Mapped[float] = mapped_column(Numeric(12, 2))
    price_negotiable: Mapped[bool] = mapped_column(Boolean, default=False)
    governorate: Mapped[str] = mapped_column(String(100), index=True)
    area: Mapped[str] = mapped_column(String(100))
    address: Mapped[str | None] = mapped_column(String(500))
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    area_sqm: Mapped[float | None] = mapped_column(Float)
    bedrooms: Mapped[int | None] = mapped_column(Integer)
    bathrooms: Mapped[int | None] = mapped_column(Integer)
    floor_number: Mapped[int | None] = mapped_column(Integer)
    total_floors: Mapped[int | None] = mapped_column(Integer)
    furnished: Mapped[bool | None] = mapped_column(Boolean)
    extra_attributes: Mapped[dict | None] = mapped_column(JSON, default=dict)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    featured_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    whatsapp_clicks: Mapped[int] = mapped_column(Integer, default=0)
    agent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    agent: Mapped["User"] = relationship("User", back_populates="listings")
    images: Mapped[list["ListingImage"]] = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan")
    qr_code: Mapped["QRCode"] = relationship("QRCode", back_populates="listing", uselist=False, cascade="all, delete-orphan")
    leads: Mapped[list["Lead"]] = relationship("Lead", back_populates="listing", cascade="all, delete-orphan")

class ListingImage(Base):
    __tablename__ = "listing_images"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    listing_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), index=True)
    url: Mapped[str] = mapped_column(Text)
    r2_key: Mapped[str] = mapped_column(Text)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    listing: Mapped["Listing"] = relationship("Listing", back_populates="images")
