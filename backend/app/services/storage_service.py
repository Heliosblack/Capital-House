import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException

UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE = 5 * 1024 * 1024  # 5 MB


def _ext(content_type: str) -> str:
    return {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}.get(content_type, "jpg")


async def upload_image(file: UploadFile, settings) -> tuple[str, str]:
    """Upload a file and return (public_url, storage_key)."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"File type {file.content_type} not allowed")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(400, "File too large (max 5 MB)")

    key = f"{uuid.uuid4().hex}.{_ext(file.content_type)}"

    if settings.R2_ACCESS_KEY_ID and settings.R2_SECRET_ACCESS_KEY:
        import boto3
        from botocore.config import Config
        s3 = boto3.client(
            "s3",
            endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            config=Config(signature_version="s3v4"),
        )
        r2_key = f"listings/{key}"
        s3.put_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=r2_key,
            Body=content,
            ContentType=file.content_type,
        )
        url = f"{settings.R2_PUBLIC_URL}/{r2_key}"
        return url, r2_key
    else:
        # Local dev: save to uploads/ dir served as StaticFiles at /uploads
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        (UPLOAD_DIR / key).write_bytes(content)
        url = f"http://localhost:8001/uploads/{key}"
        return url, key


async def delete_image_file(r2_key: str, settings) -> None:
    """Delete image from R2 or local uploads dir."""
    if settings.R2_ACCESS_KEY_ID and settings.R2_SECRET_ACCESS_KEY:
        import boto3
        from botocore.config import Config
        s3 = boto3.client(
            "s3",
            endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            config=Config(signature_version="s3v4"),
        )
        s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=r2_key)
    else:
        local = UPLOAD_DIR / r2_key
        if local.exists():
            local.unlink()
