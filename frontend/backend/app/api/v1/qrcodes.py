from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import io
import shortuuid

from app.api.deps import DBSession, get_current_user
from app.models.listing import Listing
from app.models.qr_code import QRCode
from app.models.user import UserRole
from app.services.qr_service import generate_qr_png
from app.core.config import get_settings

router = APIRouter(prefix="/qr", tags=["qr-codes"])

settings = get_settings()


def listing_url(short_id: str) -> str:
    base = settings.FRONTEND_URL
    return f"{base}/ar/listings/{short_id}"


@router.post("/listings/{short_id}", status_code=201)
async def create_qr_code(
    short_id: str,
    db: DBSession,
    current_user=Depends(get_current_user),
):
    """Generate or return existing QR code for a listing."""
    listing_res = await db.execute(select(Listing).where(Listing.short_id == short_id))
    listing = listing_res.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if listing.agent_id != current_user.id and current_user.role not in (
        UserRole.PLATFORM_ADMIN, UserRole.SUPERADMIN
    ):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if QR already exists
    existing_res = await db.execute(select(QRCode).where(QRCode.listing_id == listing.id))
    existing = existing_res.scalar_one_or_none()
    if existing:
        return {"short_code": existing.short_code, "qr_url": f"/api/v1/qr/{existing.short_code}/image"}

    # Create new QR
    short_code = shortuuid.ShortUUID().random(length=12)
    qr = QRCode(
        listing_id=listing.id,
        short_code=short_code,
    )
    db.add(qr)
    await db.commit()
    await db.refresh(qr)

    return {"short_code": short_code, "qr_url": f"/api/v1/qr/{short_code}/image"}


@router.get("/{short_code}/image")
async def get_qr_image(short_code: str, db: DBSession):
    """Return QR code PNG image."""
    qr_res = await db.execute(select(QRCode).where(QRCode.short_code == short_code))
    qr = qr_res.scalar_one_or_none()
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")

    listing_res = await db.execute(select(Listing).where(Listing.id == qr.listing_id))
    listing = listing_res.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    url = listing_url(listing.short_id)
    png_bytes = generate_qr_png(url)

    return Response(
        content=png_bytes,
        media_type="image/png",
        headers={"Content-Disposition": f"inline; filename=qr-{short_code}.png"},
    )


@router.get("/{short_code}/scan")
async def scan_qr(short_code: str, db: DBSession):
    """Track QR scan and redirect to listing."""
    from fastapi.responses import RedirectResponse
    from sqlalchemy import text

    qr_res = await db.execute(select(QRCode).where(QRCode.short_code == short_code))
    qr = qr_res.scalar_one_or_none()
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")

    listing_res = await db.execute(select(Listing).where(Listing.id == qr.listing_id))
    listing = listing_res.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    qr.scan_count += 1
    await db.commit()

    return RedirectResponse(url=listing_url(listing.short_id), status_code=302)
