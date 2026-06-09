from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Optional
from uuid import UUID

from app.api.deps import DBSession, get_current_user
from app.models.lead import Lead, LeadStatus
from app.models.listing import Listing
from app.models.user import UserRole
from app.schemas.lead import LeadCreate, LeadUpdate, LeadOut, PaginatedLeads

router = APIRouter(prefix="/leads", tags=["leads"])


@router.post("", response_model=LeadOut, status_code=201)
async def submit_lead(data: LeadCreate, db: DBSession):
    """Public endpoint — buyer submits inquiry about a listing."""
    listing_res = await db.execute(select(Listing).where(Listing.id == data.listing_id))
    listing = listing_res.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.status != "active":
        raise HTTPException(status_code=400, detail="Listing is not active")

    lead = Lead(
        listing_id=data.listing_id,
        agent_id=listing.agent_id,
        buyer_name=data.buyer_name,
        buyer_phone=data.buyer_phone,
        buyer_email=data.buyer_email,
        message=data.message,
        source=data.source,
        status=LeadStatus.NEW,
    )
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return lead


@router.get("/my", response_model=PaginatedLeads)
async def get_my_leads(
    db: DBSession,
    current_user=Depends(get_current_user),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=50),
    status: Optional[str] = None,
    listing_id: Optional[UUID] = None,
):
    """Agent-only: get their lead inbox."""
    conditions = [Lead.agent_id == current_user.id]
    if status:
        conditions.append(Lead.status == status)
    if listing_id:
        conditions.append(Lead.listing_id == listing_id)

    count_q = select(func.count()).select_from(Lead).where(and_(*conditions))
    total = (await db.execute(count_q)).scalar_one()

    items_q = (
        select(Lead)
        .where(and_(*conditions))
        .order_by(Lead.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    leads = (await db.execute(items_q)).scalars().all()

    return PaginatedLeads(
        items=leads, total=total, page=page, size=size,
        pages=(total + size - 1) // size if total > 0 else 0,
    )


@router.patch("/{lead_id}", response_model=LeadOut)
async def update_lead(
    lead_id: UUID,
    data: LeadUpdate,
    db: DBSession,
    current_user=Depends(get_current_user),
):
    lead_res = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = lead_res.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if lead.agent_id != current_user.id and current_user.role not in (UserRole.PLATFORM_ADMIN, UserRole.SUPERADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(lead, field, value)

    await db.commit()
    await db.refresh(lead)
    return lead
