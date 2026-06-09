from datetime import datetime, timedelta, timezone
import redis.asyncio as aioredis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.security import generate_otp
from app.models.otp import OTPCode

OTP_TTL_MINUTES = 10
OTP_RATE_LIMIT_MAX = 5
OTP_RATE_LIMIT_WINDOW = 3600

async def send_otp(phone: str, db: AsyncSession, redis: aioredis.Redis) -> bool:
    rate_key = f"otp_rate:{phone}"
    count = await redis.incr(rate_key)
    if count == 1:
        await redis.expire(rate_key, OTP_RATE_LIMIT_WINDOW)
    if count > OTP_RATE_LIMIT_MAX:
        return False
    code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MINUTES)
    otp = OTPCode(phone=phone, code=code, expires_at=expires_at)
    db.add(otp)
    await db.flush()
    if settings.APP_ENV == "development":
        print(f"[DEV OTP] {phone} -> {code}")
    else:
        _send_sms(phone, code)
    return True

def _send_sms(phone: str, code: str) -> None:
    from twilio.rest import Client
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    client.messages.create(
        body=f"كود التحقق من Capital House: {code}\nصالح لمدة {OTP_TTL_MINUTES} دقائق.",
        from_=settings.TWILIO_PHONE_NUMBER,
        to=phone,
    )

async def verify_otp(phone: str, code: str, db: AsyncSession) -> bool:
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(OTPCode).where(
            OTPCode.phone == phone,
            OTPCode.code == code,
            OTPCode.is_used == False,
            OTPCode.expires_at > now,
        ).order_by(OTPCode.created_at.desc()).limit(1)
    )
    otp = result.scalar_one_or_none()
    if not otp:
        return False
    otp.is_used = True
    await db.flush()
    return True
