from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.app.services.renovation_service import compute_renovation_roi, analyze_renovation_photos

router = APIRouter()

MAX_IMAGES = 10


@router.post("/renovation-roi")
async def renovation_roi_endpoint(
    suburb: str = Form(...),
    sqm: float = Form(...),
    bedrooms: int = Form(...),
    bathrooms: int = Form(...),
    floor: int = Form(...),
    year_built: int = Form(...),
    condition: str = Form("medium"),
    metro_walk_time: str = Form("auto"),
    elevator: bool = Form(False),
    parking: bool = Form(False),
    budget: Optional[float] = Form(None),
    years_vacant: Optional[float] = Form(None),
    tax_rate: float = Form(0.15),
    use_subsidy: bool = Form(False),
    images: Optional[list[UploadFile]] = File(None),
):
    images = [img for img in (images or []) if img.filename][:MAX_IMAGES]

    vision = None
    if images:
        vision = await analyze_renovation_photos(suburb, sqm, year_built, images)
    
        if vision and not vision.get("error") and vision.get("condition_level"):
            condition = vision["condition_level"]

    try:
        result = compute_renovation_roi({
            "suburb": suburb,
            "sqm": sqm,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "floor": floor,
            "year_built": year_built,
            "condition": condition,
            "metro_walk_time": metro_walk_time,
            "elevator": elevator,
            "parking": parking,
            "budget": budget,
            "years_vacant": years_vacant,
            "tax_rate": tax_rate,
            "use_subsidy": use_subsidy,
        }, vision)
        result["vision"] = vision
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
