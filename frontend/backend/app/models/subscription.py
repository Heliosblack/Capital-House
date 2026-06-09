import uuid
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class SubscriptionPlan(str, Enum):
    FREE = "free"
    AGENT_PRO = "agent_pro"
    AGENCY = "agency"

class Subscription(Base):
    __tablename__ = "subscriptions"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, index=True)
    plan: Mapped[str] = mapped_column(String(20), default=SubscriptionPlan.FREE)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    amount_paid: Mapped[float | None] = mapped_column(Numeric(10, 2))
    currency: Mapped[str] = mapped_column(String(3), default="JOD")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    payment_reference: Mapped[str | None] = mapped_column(String(255))
    user: Mapped["User"] = relationship("User", back_populates="subscription")
