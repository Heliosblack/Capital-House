from fastapi import APIRouter
from app.api.v1 import auth, listings

router = APIRouter(prefix="/api/v1")
router.include_router(auth.router)
router.include_router(listings.router)

from app.api.v1 import leads
router.include_router(leads.router)

from app.api.v1 import qrcodes
router.include_router(qrcodes.router)
