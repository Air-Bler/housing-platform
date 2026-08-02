from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib

app = FastAPI(title="Real Estate Rent Estimator API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


model = joblib.load("models/price_model.pkl")
df = pd.read_csv("data/processed/cleaned_properties.csv")

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

@app.get("/api/suburbs")
def get_suburbs():
    suburbs = sorted(df['suburb'].dropna().unique().tolist())
    return {"suburbs": suburbs}

@app.post("/api/predict")
def predict_price(data: PropertyInput):
    try:
        current_year = 2026
        property_age = current_year - data.year_built

        
        suburb_df = df[df['suburb'] == data.suburb]
        
        if not suburb_df.empty:
            suburb_lat = suburb_df['latitude'].mean()
            suburb_lon = suburb_df['longitude'].mean()
            suburb_metro_dist = suburb_df['metro_distance_m'].mean()
            suburb_uni_dist = suburb_df['uni_distance_m'].mean()
            suburb_hospital_dist = suburb_df['hospital_distance_m'].mean()
            suburb_park_dist = suburb_df['park_distance_m'].mean()
            suburb_avg_price = suburb_df['price'].mean()
            suburb_avg_sqm_price = suburb_df['price_per_sqm'].mean()
        else:
            suburb_lat = df['latitude'].mean()
            suburb_lon = df['longitude'].mean()
            suburb_metro_dist = df['metro_distance_m'].mean()
            suburb_uni_dist = df['uni_distance_m'].mean()
            suburb_hospital_dist = df['hospital_distance_m'].mean()
            suburb_park_dist = df['park_distance_m'].mean()
            suburb_avg_price = df['price'].mean()
            suburb_avg_sqm_price = df['price_per_sqm'].mean()

        
        feature_cols = [col for col in df.columns if col not in ['price', 'price_per_sqm', 'id']]

        sample_row = {}
        for col in feature_cols:
            if pd.api.types.is_numeric_dtype(df[col]):
                sample_row[col] = [df[col].median() if not df[col].empty else 0]
            else:
                mode_val = df[col].mode()
                sample_row[col] = [mode_val[0] if not mode_val.empty else '']

        input_df = pd.DataFrame(sample_row)

        # Ενημέρωση με τα στοιχεία χρήστη 
        input_df['sqm'] = float(data.sqm)
        input_df['bedrooms'] = int(data.bedrooms)
        input_df['bathrooms'] = int(data.bathrooms)
        input_df['floor'] = int(data.floor)
        input_df['year_built'] = int(data.year_built)
        input_df['property_age'] = int(property_age)
        input_df['suburb'] = str(data.suburb)
        input_df['latitude'] = float(suburb_lat)
        input_df['longitude'] = float(suburb_lon)
        
        # Αποστάσεις 
        input_df['metro_distance_m'] = float(suburb_metro_dist)
        input_df['uni_distance_m'] = float(suburb_uni_dist)
        input_df['hospital_distance_m'] = float(suburb_hospital_dist)
        input_df['park_distance_m'] = float(suburb_park_dist)

        for col, val in [('elevator', data.elevator), ('renovated', data.renovated), 
                         ('furnished', data.furnished), ('parking', data.parking)]:
            if col in input_df.columns:
                input_df[col] = 1 if val else 0

        
        predicted_price = float(model.predict(input_df)[0])

     #  Fair Rent Logic & Explainability
        reasons = []
        
        # Μετρό / ΗΣΑΠ
        if suburb_metro_dist <= 800:
            reasons.append({"type": "positive", "text": f"Άμεση πρόσβαση σε Μετρό/ΗΣΑΠ ({int(suburb_metro_dist)}m)"})
        elif suburb_metro_dist > 1200:
            reasons.append({"type": "negative", "text": f"Σχετική απόσταση από Μετρό ({round(suburb_metro_dist/1000, 1)}km)"})

        # Πανεπιστήμια
        if suburb_uni_dist <= 1200:
            reasons.append({"type": "positive", "text": f"Εγγύτητα σε Πανεπιστήμιο/Σχολή ({int(suburb_uni_dist)}m) - Φοιτητική ζήτηση"})

        # Πάρκα
        if suburb_park_dist <= 1200:
            reasons.append({"type": "positive", "text": f"Πρόσβαση σε Πάρκο/Πράσινο ({int(suburb_park_dist)}m)"})
        elif suburb_park_dist > 2500:
            reasons.append({"type": "negative", "text": f"Μεγάλη απόσταση από κεντρικά πάρκα ({round(suburb_park_dist/1000, 1)}km)"})

        # Νοσοκομεία
        if suburb_hospital_dist <= 1500:
            reasons.append({"type": "positive", "text": f"Πρόσβαση σε Νοσοκομείο/Ιατρικές υποδομές ({round(suburb_hospital_dist/1000, 1)}km)"})
        elif suburb_hospital_dist > 2500:
            reasons.append({"type": "negative", "text": f"Απόσταση από κεντρικά νοσοκομεία ({round(suburb_hospital_dist/1000, 1)}km)"})

        # Χαρακτηριστικά Ακινήτου
        if data.renovated:
            reasons.append({"type": "positive", "text": "Πρόσφατη ανακαίνιση (+Αύξηση αξίας)"})
        if data.parking:
            reasons.append({"type": "positive", "text": "Ύπαρξη θέσης Parking"})
        if data.elevator and data.floor > 1:
            reasons.append({"type": "positive", "text": "Ύπαρξη ανελκυστήρα σε όροφο"})
        elif not data.elevator and data.floor >= 2:
            reasons.append({"type": "negative", "text": f"Χωρίς ανελκυστήρα στον {data.floor}ο όροφο"})

        if property_age <= 10:
            reasons.append({"type": "positive", "text": f"Νεόδμητο ακίνητο ({data.year_built})"})
        elif property_age > 40:
            reasons.append({"type": "negative", "text": f"Παλαιότητα κτιρίου ({data.year_built})"})
        #  Value Score (1 - 10)
        mae = 138.76
        value_score = 7.5
        if data.user_asking_price and data.user_asking_price > 0:
            diff_percent = ((predicted_price - data.user_asking_price) / predicted_price) * 100
            if diff_percent > 12:
                value_score = 9.3
                deal_type = "Εξαιρετική Ευκαιρία (Underpriced)"
            elif diff_percent >= -5:
                value_score = 7.8
                deal_type = "Δίκαιη Τιμή Αγοράς (Fair Value)"
            else:
                value_score = 5.0
                deal_type = "Υπερτιμημένο (Overpriced)"
        else:
            deal_type = "Υπολογισμός βάσει ML εκτίμησης"

        return {
            "estimated_price": round(predicted_price, 2),
            "price_min": max(0, round(predicted_price - mae, 2)),
            "price_max": round(predicted_price + mae, 2),
            "price_per_sqm": round(predicted_price / data.sqm, 2),
            "poi_distances": {
                "metro_m": int(suburb_metro_dist),
                "uni_m": int(suburb_uni_dist),
                "hospital_m": int(suburb_hospital_dist),
                "park_m": int(suburb_park_dist)
            },
            "reasons": reasons,
            "value_score": round(value_score, 1),
            "deal_type": deal_type,
            "suburb_stats": {
                "avg_price": round(suburb_avg_price, 2),
                "avg_price_per_sqm": round(suburb_avg_sqm_price, 2)
            }
        }
    except Exception as e:
        print(f"Error during prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))