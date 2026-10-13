"""Έλεγχοι φωτογραφιών πριν από οποιαδήποτε κλήση AI.

Όλοι οι έλεγχοι γίνονται εδώ, ώστε ένα μη αποδεκτό upload να απορρίπτεται με 4xx
και σαφές μήνυμα, χωρίς να έχει ξοδευτεί χρόνος ή κόστος στον provider.
"""

import base64
import io
import warnings

from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError

from backend.app import config
from backend.app.errors import AppError

# Μορφές που δέχεται το vision μοντέλο. Το MIME προκύπτει από το περιεχόμενο, όχι από τον client.
ALLOWED_FORMATS = {"JPEG": "image/jpeg", "PNG": "image/png", "WEBP": "image/webp"}
_CHUNK = 1024 * 1024


def _reject(code: str, message: str, filename: str | None = None, status: int = 422):
    details = [{"field": "images", "file": filename, "message": message}] if filename else None
    raise AppError(status, code, message, details)


async def _read_limited(upload: UploadFile, limit: int) -> bytes:
    buf = bytearray()
    while chunk := await upload.read(_CHUNK):
        buf.extend(chunk)
        if len(buf) > limit:
            mb = config.MAX_IMAGE_BYTES // (1024 * 1024)
            _reject("IMAGE_TOO_LARGE", f"Η φωτογραφία «{upload.filename}» ξεπερνά τα {mb} MB.",
                    upload.filename, status=413)
    return bytes(buf)


def _inspect(data: bytes, filename: str) -> str:
    """Επιστρέφει το MIME type αν το περιεχόμενο είναι έγκυρη, αποδεκτή εικόνα."""
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(data)) as img:
                fmt = img.format
                width, height = img.size
                frames = getattr(img, "n_frames", 1)
            # Το open() διαβάζει μόνο την κεφαλίδα· το verify() ελέγχει ότι το αρχείο δεν είναι κατεστραμμένο.
            with Image.open(io.BytesIO(data)) as img:
                img.verify()
    except (UnidentifiedImageError, Image.DecompressionBombError, Image.DecompressionBombWarning, OSError,
            SyntaxError, ValueError):
        _reject("IMAGE_INVALID", f"Το αρχείο «{filename}» δεν είναι έγκυρη εικόνα.", filename)

    if fmt not in ALLOWED_FORMATS:
        _reject("IMAGE_UNSUPPORTED_FORMAT",
                f"Η μορφή του «{filename}» δεν υποστηρίζεται. Χρησιμοποιήστε JPEG, PNG ή WEBP.", filename)
    if frames > 1:
        _reject("IMAGE_UNSUPPORTED_FORMAT", f"Η εικόνα «{filename}» είναι κινούμενη· ανεβάστε στατική φωτογραφία.",
                filename)
    if min(width, height) < config.MIN_IMAGE_SIDE_PX:
        _reject("IMAGE_TOO_SMALL", f"Η φωτογραφία «{filename}» είναι πολύ μικρή ({width}×{height}).", filename)
    if max(width, height) > config.MAX_IMAGE_SIDE_PX:
        _reject("IMAGE_DIMENSIONS_TOO_LARGE",
                f"Η φωτογραφία «{filename}» ξεπερνά τα {config.MAX_IMAGE_SIDE_PX} pixels σε μία διάσταση.", filename)
    return ALLOWED_FORMATS[fmt]


async def validate_images(uploads: list[UploadFile]) -> list[tuple[str, str]]:
    """Ελέγχει τα uploads και επιστρέφει λίστα (mime_type, base64) έτοιμη για το μοντέλο."""
    uploads = [u for u in uploads if u.filename]
    if not uploads:
        _reject("IMAGES_REQUIRED", "Ανεβάστε τουλάχιστον μία φωτογραφία.")
    if len(uploads) > config.MAX_IMAGES:
        _reject("TOO_MANY_IMAGES", f"Μπορείτε να ανεβάσετε έως {config.MAX_IMAGES} φωτογραφίες.")

    # Ο έλεγχος μεγέθους από τα headers του multipart αποφεύγει την ανάγνωση αρχείων που ήδη ξέρουμε ότι απορρίπτονται.
    for u in uploads:
        if u.size is not None and u.size > config.MAX_IMAGE_BYTES:
            mb = config.MAX_IMAGE_BYTES // (1024 * 1024)
            _reject("IMAGE_TOO_LARGE", f"Η φωτογραφία «{u.filename}» ξεπερνά τα {mb} MB.", u.filename, status=413)

    result, total = [], 0
    for u in uploads:
        data = await _read_limited(u, config.MAX_IMAGE_BYTES)
        total += len(data)
        if total > config.MAX_TOTAL_IMAGE_BYTES:
            mb = config.MAX_TOTAL_IMAGE_BYTES // (1024 * 1024)
            _reject("IMAGES_TOTAL_TOO_LARGE", f"Το συνολικό μέγεθος των φωτογραφιών ξεπερνά τα {mb} MB.", status=413)
        mime = _inspect(data, u.filename)
        result.append((mime, base64.b64encode(data).decode("ascii")))
    return result
