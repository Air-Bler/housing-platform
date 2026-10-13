import logging
from typing import Annotated, Optional

from fastapi import APIRouter, File, Form, Request, UploadFile

from backend.app.api.fields import (
    Bathrooms, Bedrooms, Budget, Condition, Floor, MetroWalkTime, Sqm, Suburb, TaxRate, YearBuilt, YearsVacant,
)
from backend.app.errors import AppError
from backend.app.rate_limit import reserve_ai_call
from backend.app.services.image_validation import validate_images
from backend.app.services.renovation_service import compute_renovation_roi, analyze_renovation_photos

router = APIRouter()
logger = logging.getLogger("housing.api")


@router.post("/renovation-roi")
async def renovation_roi_endpoint(
    request: Request,
    suburb: Annotated[Suburb, Form()],
    sqm: Annotated[Sqm, Form()],
    bedrooms: Annotated[Bedrooms, Form()],
    bathrooms: Annotated[Bathrooms, Form()],
    floor: Annotated[Floor, Form()],
    year_built: Annotated[YearBuilt, Form()],
    condition: Annotated[Condition, Form()] = "medium",
    metro_walk_time: Annotated[MetroWalkTime, Form()] = "auto",
    elevator: Annotated[bool, Form()] = False,
    parking: Annotated[bool, Form()] = False,
    budget: Annotated[Optional[Budget], Form()] = None,
    years_vacant: Annotated[Optional[YearsVacant], Form()] = None,
    tax_rate: Annotated[TaxRate, Form()] = 0.15,
    use_subsidy: Annotated[bool, Form()] = False,
    images: Annotated[Optional[list[UploadFile]], File()] = None,
):
    """Το πεδίο `vision` της απάντησης:
    - null: δεν στάλθηκαν φωτογραφίες
    - {"status": "completed", "analysis": {...}}: η εκτίμηση βασίζεται στις φωτογραφίες
    - {"status": "failed", "error": {"code", "message"}}: η ανάλυση δεν ολοκληρώθηκε και
      η εκτίμηση βασίζεται στην κατάσταση που δήλωσε ο χρήστης
    Μη αποδεκτές φωτογραφίες απορρίπτουν όλο το request με 4xx, ώστε ο χρήστης να τις διορθώσει.
    """
    uploads = [img for img in (images or []) if img.filename]
    validated = await validate_images(uploads) if uploads else []

    analysis = None
    vision = None
    if validated:
        try:
            reserve_ai_call(request)
            analysis = await analyze_renovation_photos(suburb, sqm, year_built, validated)
            condition = analysis.condition_level
            vision = {"status": "completed", "analysis": analysis.model_dump()}
        except AppError as e:
            logger.warning("Renovation vision failed (%s); falling back to declared condition", e.code)
            vision = {"status": "failed", "error": {"code": e.code, "message": e.message}}

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
    }, analysis)
    result["vision"] = vision
    return result
