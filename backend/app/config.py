import os
from pathlib import Path
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent.parent


load_dotenv(BASE_DIR / ".env")


MODEL_PATH = BASE_DIR / "backend" / "models" / "price_model.pkl"
METRICS_PATH = BASE_DIR / "backend" / "models" / "model_metrics.json"
# Τα δεδομένα αγγελιών μένουν μόνο στον server (όχι στο git, όχι στο frontend/public).
DATA_PATH = Path(os.getenv("DATA_PATH", BASE_DIR / "backend" / "data" / "cleaned_properties.csv"))


OPENAI_API_KEY = (os.getenv("OPENAI_API_KEY") or "").strip() or None
VISION_MODEL = os.getenv("VISION_MODEL", "gpt-4o")


# CORS: λίστα origins χωρισμένη με κόμμα, π.χ. "https://app.example.gr,https://www.example.gr".
# Η προεπιλογή καλύπτει μόνο τον dev server του React.
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if o.strip()
]


# Πολιτική κλήσεων AI.
# Κάθε προσπάθεια έχει όριο AI_ATTEMPT_TIMEOUT_S. Ο SDK επαναλαμβάνει έως AI_MAX_RETRIES φορές
# σε σφάλματα δικτύου, timeouts, 408/409/429 και 5xx (με exponential backoff).
# Το AI_TOTAL_DEADLINE_S είναι το απόλυτο όριο αναμονής του χρήστη, μαζί με τις επαναλήψεις.
AI_ATTEMPT_TIMEOUT_S = float(os.getenv("AI_ATTEMPT_TIMEOUT_S", "30"))
AI_CONNECT_TIMEOUT_S = 5.0
AI_MAX_RETRIES = int(os.getenv("AI_MAX_RETRIES", "1"))
AI_TOTAL_DEADLINE_S = float(os.getenv("AI_TOTAL_DEADLINE_S", "60"))

# Όρια χρήσης AI (βλ. rate_limit.py): ανά IP και συνολικά ανά ημέρα.
AI_PER_IP_LIMIT = int(os.getenv("AI_PER_IP_LIMIT", "5"))
AI_PER_IP_WINDOW_S = int(os.getenv("AI_PER_IP_WINDOW_S", "600"))
AI_DAILY_LIMIT = int(os.getenv("AI_DAILY_LIMIT", "200"))


# Όρια φωτογραφιών. Ελέγχονται πριν από οποιαδήποτε κλήση AI.
MAX_IMAGES = 6
MAX_IMAGE_BYTES = 8 * 1024 * 1024
MAX_TOTAL_IMAGE_BYTES = 25 * 1024 * 1024
MIN_IMAGE_SIDE_PX = 64
MAX_IMAGE_SIDE_PX = 8000
# Όριο για όλο το request body (εικόνες + πεδία φόρμας + multipart overhead).
MAX_REQUEST_BYTES = MAX_TOTAL_IMAGE_BYTES + 1024 * 1024
