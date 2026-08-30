from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.app.services.ml_service import (
    predict_rent_price, 
    get_all_suburbs, 
    get_model_metadata,
    get_all_suburbs_stats
)

router = APIRouter()

class PredictRequest(BaseModel):
    suburb: str
    sqm: float
    bedrooms: int
    bathrooms: int
    floor: int
    year_built: int
    metro_walk_time: Optional[str] = "auto"  
    elevator: bool = False
    renovated: bool = False
    furnished: bool = False
    parking: bool = False
    user_asking_price: Optional[float] = None
    vision_score: Optional[float] = None

@router.get("/suburbs")
def get_suburbs():
    return {"suburbs": get_all_suburbs()}

@router.get("/suburbs-stats")
def get_suburbs_stats():
    """Ζωντανά στατιστικά για τον Χάρτη Τιμών και τα Charts."""
    return {"suburbs": get_all_suburbs_stats()}

@router.get("/model-stats")
def get_model_stats():
    return get_model_metadata()

@router.post("/predict")
def predict_rent(req: PredictRequest):
    try:
        result = predict_rent_price(req)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))