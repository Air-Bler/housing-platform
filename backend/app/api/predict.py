from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict

from backend.app.api.fields import (
    Bathrooms, Bedrooms, Floor, MetroWalkTime, MonthlyRent, Sqm, Suburb, VisionScore, YearBuilt,
)
from backend.app.services.ml_service import (
    predict_rent_price,
    get_all_suburbs,
    get_model_metadata,
    get_all_suburbs_stats,
    get_city_stats,
    get_heatmap_areas,
)

router = APIRouter()


class PredictRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    suburb: Suburb
    sqm: Sqm
    bedrooms: Bedrooms
    bathrooms: Bathrooms
    floor: Floor
    year_built: YearBuilt
    metro_walk_time: MetroWalkTime = "auto"
    elevator: bool = False
    renovated: bool = False
    furnished: bool = False
    parking: bool = False
    user_asking_price: Optional[MonthlyRent] = None
    vision_score: Optional[VisionScore] = None


@router.get("/suburbs")
def get_suburbs():
    return {"suburbs": get_all_suburbs()}

@router.get("/suburbs-stats")
def get_suburbs_stats():
    """Ζωντανά στατιστικά για τον Χάρτη Τιμών και τα Charts."""
    return {"suburbs": get_all_suburbs_stats()}

@router.get("/city-stats")
def city_stats():
    """Συγκεντρωτικά στοιχεία αγοράς (μόνο μέσοι όροι περιοχών με αρκετές αγγελίες)."""
    return get_city_stats()

@router.get("/heatmap-areas")
def heatmap_areas():
    return {"areas": get_heatmap_areas()}

@router.get("/model-stats")
def get_model_stats():
    return get_model_metadata()

@router.post("/predict")
def predict_rent(req: PredictRequest):
    # Απρόβλεπτα σφάλματα τα χειρίζεται κεντρικά το errors.py (500 χωρίς τεχνικές λεπτομέρειες, πλήρες log).
    return predict_rent_price(req)
