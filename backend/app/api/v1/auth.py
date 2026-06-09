import uuid
from fastapi import APIRouter, HTTPException, status
from jose import JWTError
from sqlalchemy import select
from app.api.deps import CurrentUser, DBSession, RedisClient
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.models.user import User
from app.schemas.auth import RefreshRequest, SendOTPRequest, TokenResponse, VerifyOTPRequest
from app.schemas.user import UserOut
from app.services.otp_service import send_otp, verify_otp

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/otp/send", status_code=status.HTTP_204_NO_CONTENT)
async def request_otp(body: SendOTPRequest, db: DBSession, redis: RedisClient):
    sent = await send_otp(body.phone, db, redis)
    if not sent:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many OTP requests.")


@router.post("/otp/verify", response_model=TokenResponse)
async def verify_otp_and_login(body: VerifyOTPRequest, db: DBSession, redis: RedisClient):
    valid = await verify_otp(body.phone, body.code, db)
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP.")

    result = await db.execute(select(User).where(User.phone == body.phone))
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            phone=body.phone,
            full_name=body.full_name or body.phone,
            is_phone_verified=True,
        )
        db.add(user)
    else:
        user.is_phone_verified = True
        if body.full_name and user.full_name == user.phone:
            user.full_name = body.full_name

    await db.commit()
    await db.refresh(user)

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=UserOut.model_validate(user),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(body: RefreshRequest, db: DBSession):
    exc = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    try:
        payload = decode_token(body.refresh_token)
        if payload.get("type") != "refresh":
            raise exc
        user_id = payload.get("sub")
    except JWTError:
        raise exc

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise exc

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=UserOut.model_validate(user),
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: CurrentUser):
    return current_user
