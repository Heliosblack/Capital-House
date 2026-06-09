import io
import base64
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer


def generate_qr_png(url: str) -> bytes:
    """Generate a styled QR code PNG and return as bytes."""
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=3,
    )
    qr.add_data(url)
    qr.make(fit=True)

    try:
        img = qr.make_image(
            image_factory=StyledPilImage,
            module_drawer=RoundedModuleDrawer(),
        )
    except Exception:
        img = qr.make_image(fill_color="black", back_color="white")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def generate_qr_data_url(url: str) -> str:
    """Return base64 data URL for embedding in HTML."""
    png_bytes = generate_qr_png(url)
    b64 = base64.b64encode(png_bytes).decode()
    return f"data:image/png;base64,{b64}"
