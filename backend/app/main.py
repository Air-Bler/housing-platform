import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app import config
from backend.app.api import predict, vision, renovation
from backend.app.errors import UnhandledErrorMiddleware, register_error_handlers
from backend.app.middleware import BodySizeLimitMiddleware
from backend.app.services import ml_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Χωρίς μοντέλο, δεδομένα ή metrics ο server δεν ξεκινά (αντί να δείχνει επινοημένες τιμές).
    ml_service.check_ready()
    yield


app = FastAPI(
    title="Real Estate Valuation & Explainability Platform API",
    version="2.0.0",
    lifespan=lifespan,
)

register_error_handlers(app)

# Απορρίπτει πολύ μεγάλα uploads πριν διαβαστούν (413).
app.add_middleware(BodySizeLimitMiddleware, max_bytes=config.MAX_REQUEST_BYTES)

# Απρόβλεπτα σφάλματα -> 500 με γενικό μήνυμα· οι λεπτομέρειες μόνο στο log.
app.add_middleware(UnhandledErrorMiddleware)

# CORS: μόνο τα origins του frontend (CORS_ORIGINS στο .env).
# Το API δεν χρησιμοποιεί cookies ή HTTP auth, οπότε allow_credentials=False:
# ο browser δεν στέλνει credentials cross-origin και μια λάθος ρύθμιση origins δεν εκθέτει session.
# Το CORSMiddleware προστίθεται τελευταίο ώστε να είναι το εξωτερικό και να βάζει headers και στα σφάλματα.
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
    max_age=600,
)

app.include_router(predict.router, prefix="/api", tags=["Machine Learning"])
app.include_router(vision.router, prefix="/api", tags=["AI Vision Engine"])
app.include_router(renovation.router, prefix="/api", tags=["Renovation ROI"])

@app.get("/")
def root():
    return {"message": "Real Estate Valuation API is running smoothly!"}
