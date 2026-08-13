from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.services.ml_service import get_all_suburbs, predict_rent_price

router = APIRouter()

class PropertyInput(BaseModel):
    sqm: float = 75.0
    bedrooms: int = 2
    bathrooms: int = 1
    floor: int = 2
    year_built: int = 2010
    suburb: str
    elevator: bool = True
    renovated: bool = False
    furnished: bool = False
    parking: bool = False
    user_asking_price: float = None

@router.get("/suburbs")
def get_suburbs_endpoint():
    return {"suburbs": get_all_suburbs()}

@router.post("/predict")
def predict_endpoint(data: PropertyInput):
    try:
        return predict_rent_price(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))