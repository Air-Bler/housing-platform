from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api import predict, vision

app = FastAPI(
    title="Real Estate Valuation & Explainability Platform API",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Σύνδεση των Routers
app.include_router(predict.router, prefix="/api", tags=["Machine Learning"])
app.include_router(vision.router, prefix="/api", tags=["AI Vision Engine"])

@app.get("/")
def root():
    return {"message": "Real Estate Valuation API is running smoothly!"}