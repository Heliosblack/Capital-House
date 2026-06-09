from fastapi import APIRouter
from app.api.v1 import auth, listings, leads, qrcodes, images

router = APIRouter(prefix="/api/v1")
router.include_router(auth.router)
router.include_router(listings.router)
router.include_router(images.router)
router.include_router(leads.router)
router.include_router(qrcodes.router)
