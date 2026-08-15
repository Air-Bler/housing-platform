from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.app.services.ml_service import predict_rent_price, get_all_suburbs, get_model_metadata

router = APIRouter()

class PredictRequest(BaseModel):
    suburb: str
    sqm: float
    bedrooms: int
    bathrooms: int
    floor: int
    year_built: int
    elevator: bool = False
    renovated: bool = False
    furnished: bool = False
    parking: bool = False
    user_asking_price: Optional[float] = None

@router.get("/suburbs")
def get_suburbs():
    return {"suburbs": get_all_suburbs()}

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