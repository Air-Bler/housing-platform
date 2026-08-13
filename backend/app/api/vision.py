from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.app.services.vision_service import analyze_property_photos

router = APIRouter()

@router.post("/analyze-images")
async def analyze_images_endpoint(
    suburb: str = Form(...),
    sqm: float = Form(...),
    estimated_price: float = Form(...),
    images: list[UploadFile] = File(...)
):
    try:
        analysis = await analyze_property_photos(suburb, sqm, estimated_price, images)
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))