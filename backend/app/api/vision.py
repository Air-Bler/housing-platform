from typing import Annotated

from fastapi import APIRouter, File, Form, Request, UploadFile
from pydantic import BaseModel

from backend.app.api.fields import Sqm, Suburb
from backend.app.rate_limit import reserve_ai_call
from backend.app.services.image_validation import validate_images
from backend.app.services.vision_service import VisionAnalysis, analyze_property_photos

router = APIRouter()


class VisionResponse(BaseModel):
    analysis: VisionAnalysis


@router.post("/analyze-images", response_model=VisionResponse)
async def analyze_images_endpoint(
    request: Request,
    suburb: Annotated[Suburb, Form()],
    sqm: Annotated[Sqm, Form()],
    images: Annotated[list[UploadFile], File()],
):
    """200: {"analysis": {...}} μόνο όταν υπάρχει πραγματική, επαληθευμένη ανάλυση.
    Αλλιώς 4xx/5xx με {"error": {"code", "message"}} (βλ. errors.py)."""
    validated = await validate_images(images)
    reserve_ai_call(request)
    analysis = await analyze_property_photos(suburb, sqm, validated)
    return {"analysis": analysis}
