from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID

from app.api.deps import DBSession, get_current_user
from app.models.listing import Listing, ListingImage
from app.models.user import UserRole
from app.schemas.listing import ListingImageOut
from app.services.storage_service import upload_image, delete_image_file
from app.core.config import get_settings

router = APIRouter(prefix="/listings", tags=["images"])


def _owns(listing: Listing, user) -> bool:
    return listing.agent_id == user.id or user.role in (
        UserRole.PLATFORM_ADMIN, UserRole.SUPERADMIN
    )


@router.post("/{short_id}/images", response_model=List[ListingImageOut], status_code=201)
async def upload_listing_images(
    short_id: str,
    db: DBSession,
    files: List[UploadFile] = File(...),
    current_user=Depends(get_current_user),
):
    """Upload up to 10 images for a listing (multipart/form-data, field name: files)."""
    settings = get_settings()
    res = await db.execute(
        select(Listing).options(selectinload(Listing.images)).where(Listing.short_id == short_id)
    )
    listing = res.scalar_one_or_none()
    if not listing:
        raise HTTPException(404, "Listing not found")
    if not _owns(listing, current_user):
        raise HTTPException(403, "Not authorized")

    existing_count = len(listing.images)
    if existing_count + len(files) > 10:
        raise HTTPException(400, f"Max 10 images per listing (already have {existing_count})")

    created = []
    for i, file in enumerate(files):
        url, key = await upload_image(file, settings)
        img = ListingImage(
            listing_id=listing.id,
            url=url,
            r2_key=key,
            is_primary=(existing_count == 0 and i == 0),
            sort_order=existing_count + i,
        )
        db.add(img)
        created.append(img)

    await db.commit()
    for img in created:
        await db.refresh(img)

    return created


@router.delete("/{short_id}/images/{image_id}", status_code=204)
async def delete_listing_image(
    short_id: str,
    image_id: UUID,
    db: DBSession,
    current_user=Depends(get_current_user),
):
    settings = get_settings()
    res = await db.execute(select(Listing).where(Listing.short_id == short_id))
    listing = res.scalar_one_or_none()
    if not listing:
        raise HTTPException(404, "Listing not found")
    if not _owns(listing, current_user):
        raise HTTPException(403, "Not authorized")

    img_res = await db.execute(
        select(ListingImage).where(
            ListingImage.id == image_id,
            ListingImage.listing_id == listing.id,
        )
    )
    img = img_res.scalar_one_or_none()
    if not img:
        raise HTTPException(404, "Image not found")

    was_primary = img.is_primary
    r2_key = img.r2_key
    await db.delete(img)
    await db.commit()

    if was_primary:
        next_res = await db.execute(
            select(ListingImage)
            .where(ListingImage.listing_id == listing.id)
            .order_by(ListingImage.sort_order)
            .limit(1)
        )
        next_img = next_res.scalar_one_or_none()
        if next_img:
            next_img.is_primary = True
            await db.commit()

    await delete_image_file(r2_key, settings)


@router.patch("/{short_id}/images/{image_id}/primary", response_model=ListingImageOut)
async def set_primary_image(
    short_id: str,
    image_id: UUID,
    db: DBSession,
    current_user=Depends(get_current_user),
):
    res = await db.execute(select(Listing).where(Listing.short_id == short_id))
    listing = res.scalar_one_or_none()
    if not listing:
        raise HTTPException(404, "Listing not found")
    if not _owns(listing, current_user):
        raise HTTPException(403, "Not authorized")

    all_res = await db.execute(
        select(ListingImage).where(ListingImage.listing_id == listing.id)
    )
    for img in all_res.scalars().all():
        img.is_primary = img.id == image_id

    await db.commit()

    target_res = await db.execute(select(ListingImage).where(ListingImage.id == image_id))
    return target_res.scalar_one()
