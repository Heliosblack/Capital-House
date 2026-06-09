import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class QRCode(Base):
    __tablename__ = "qr_codes"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    listing_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), unique=True, index=True)
    short_code: Mapped[str] = mapped_column(String(12), unique=True, index=True)
    qr_image_url: Mapped[str | None] = mapped_column(Text)
    scan_count: Mapped[int] = mapped_column(Integer, default=0)
    mobile_scans: Mapped[int] = mapped_column(Integer, default=0)
    desktop_scans: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    listing: Mapped["Listing"] = relationship("Listing", back_populates="qr_code")
