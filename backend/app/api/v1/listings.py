from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from typing import Optional
from uuid import UUID
import shortuuid

from app.api.deps import DBSession, CurrentUser, get_current_user, require_role
from app.models.listing import Listing, ListingImage, ListingStatus, ListingType, PropertyType
from app.models.user import UserRole
from app.schemas.listing import ListingOut, ListingCreate, ListingUpdate, PaginatedListings

router = APIRouter(prefix="/listings", tags=["listings"])


def eager_listing():
    """Selectin-load images and agent to avoid async lazy loading."""
    return [selectinload(Listing.images), selectinload(Listing.agent)]


def build_filters(
    listing_type, property_type, governorate, status,
    is_featured, is_verified, min_price, max_price, bedrooms, q, agent_id,
):
    conditions = []
    if listing_type:
        conditions.append(Listing.listing_type == listing_type)
    if property_type:
        conditions.append(Listing.property_type == property_type)
    if governorate:
        conditions.append(Listing.governorate == governorate)
    if status:
        conditions.append(Listing.status == status)
    if is_featured is not None:
        conditions.append(Listing.is_featured == is_featured)
    if is_verified is not None:
        conditions.append(Listing.is_verified == is_verified)
    if min_price is not None:
        conditions.append(Listing.price >= min_price)
    if max_price is not None:
        conditions.append(Listing.price <= max_price)
    if bedrooms is not None:
        conditions.append(Listing.bedrooms >= bedrooms)
    if agent_id:
        conditions.append(Listing.agent_id == agent_id)
    if q:
        like = f"%{q}%"
        conditions.append(
            or_(
                Listing.title.ilike(like),
                Listing.title_ar.ilike(like),
                Listing.area.ilike(like),
                Listing.governorate.ilike(like),
                Listing.address.ilike(like),
            )
        )
    return conditions


@router.get("", response_model=PaginatedListings)
async def list_listings(
    db: DBSession,
    page: int = Query(1, ge=1),
    size: int = Query(12, ge=1, le=50),
    q: Optional[str] = None,
    listing_type: Optional[str] = None,
    property_type: Optional[str] = None,
    governorate: Optional[str] = None,
    status: Optional[str] = None,
    is_featured: Optional[bool] = None,
    is_verified: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    agent_id: Optional[UUID] = None,
):
    conditions = build_filters(
        listing_type, property_type, governorate,
        status if (agent_id is not None and status is None) else (status or ListingStatus.ACTIVE),
        is_featured, is_verified,
        min_price, max_price, bedrooms, q, agent_id,
    )

    count_q = select(func.count()).select_from(Listing).where(and_(*conditions))
    total_res = await db.execute(count_q)
    total = total_res.scalar_one()

    items_q = (
        select(Listing)
        .options(*eager_listing())
        .where(and_(*conditions))
        .order_by(Listing.is_featured.desc(), Listing.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    result = await db.execute(items_q)
    listings = result.scalars().all()

    return PaginatedListings(
        items=listings,
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size if total > 0 else 0,
    )


@router.get("/{short_id}", response_model=ListingOut)
async def get_listing(short_id: str, db: DBSession):
    result = await db.execute(
        select(Listing).options(*eager_listing()).where(Listing.short_id == short_id)
    )
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing.view_count += 1
    await db.commit()
    await db.refresh(listing)
    # Reload with relationships after refresh
    result2 = await db.execute(
        select(Listing).options(*eager_listing()).where(Listing.id == listing.id)
    )
    return result2.scalar_one()


@router.post("", response_model=ListingOut, status_code=201)
async def create_listing(
    data: ListingCreate,
    db: DBSession,
    current_user=Depends(get_current_user),
):
    if current_user.role not in (UserRole.AGENT, UserRole.AGENCY_ADMIN, UserRole.PLATFORM_ADMIN, UserRole.SUPERADMIN):
        raise HTTPException(status_code=403, detail="Only agents can create listings")

    listing = Listing(
        short_id=shortuuid.ShortUUID().random(length=12),
        agent_id=current_user.id,
        status=ListingStatus.PENDING_REVIEW,
        **data.model_dump(),
    )
    db.add(listing)
    await db.commit()

    result = await db.execute(
        select(Listing).options(*eager_listing()).where(Listing.id == listing.id)
    )
    return result.scalar_one()


@router.patch("/{short_id}", response_model=ListingOut)
async def update_listing(
    short_id: str,
    data: ListingUpdate,
    db: DBSession,
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Listing).options(*eager_listing()).where(Listing.short_id == short_id)
    )
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Not found")
    if listing.agent_id != current_user.id and current_user.role not in (UserRole.PLATFORM_ADMIN, UserRole.SUPERADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(listing, field, value)

    await db.commit()
    result2 = await db.execute(
        select(Listing).options(*eager_listing()).where(Listing.short_id == short_id)
    )
    return result2.scalar_one()


@router.delete("/{short_id}", status_code=204)
async def delete_listing(
    short_id: str,
    db: DBSession,
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Listing).where(Listing.short_id == short_id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Not found")
    if listing.agent_id != current_user.id and current_user.role not in (UserRole.PLATFORM_ADMIN, UserRole.SUPERADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    await db.delete(listing)
    await db.commit()
