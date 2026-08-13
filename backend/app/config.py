import os
from pathlib import Path
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent.parent


load_dotenv(BASE_DIR / ".env")


MODEL_PATH = BASE_DIR / "backend" / "models" / "price_model.pkl"
DATA_PATH = BASE_DIR / "frontend" / "public" / "data" / "cleaned_properties.csv"


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")