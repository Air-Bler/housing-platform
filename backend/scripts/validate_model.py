import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import KFold, cross_val_score
import os

DATA_PATH = "data/processed/cleaned_properties.csv"
MODEL_PATH = "models/price_model.pkl"

def validate():
    if not os.path.exists(DATA_PATH) or not os.path.exists(MODEL_PATH):
        print("ERROR: Τα αρχεία δεδομένων ή μοντέλου δεν βρέθηκαν!")
        return

    print("--- ΕΝΑΡΞΗ ΣΧΟΛΑΣΤΙΚΟΥ ΕΛΕΓΧΟΥ (MODEL AUDIT) ---")
    
    df = pd.read_csv(DATA_PATH)
    model_pipeline = joblib.load(MODEL_PATH)

    #  Data Leakage Check
    ignore_cols = ['id', 'price', 'price_per_sqm']
    X = df.drop(columns=[col for col in ignore_cols if col in df.columns])
    y = df['price']

    if 'price' in X.columns or 'price_per_sqm' in X.columns:
        print("ALERT: Διαρροή μεταβλητής!")
        return
    else:
        print("\nDATA LEAKAGE CHECK: Καθαρό! Καμία διαρροή target μεταβλητής.")

    #  Single-Thread Cross Validation Evaluation (για αποφυγή PyArrow crash στα Windows)
    print("\nΕκτέλεση 5-Fold Cross Validation (Single Thread)...")
    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    
    
    cv_scores = cross_val_score(model_pipeline, X, y, cv=kf, scoring='r2', n_jobs=1)
    mae_scores = -cross_val_score(model_pipeline, X, y, cv=kf, scoring='neg_mean_absolute_error', n_jobs=1)

    for idx, (r2, mae) in enumerate(zip(cv_scores, mae_scores), 1):
        print(f"   Fold {idx}: R2 = {r2*100:.2f}%, MAE = EUR {mae:.2f}")

    print(f"\nΜΕΣΟ R2 SCORE: {cv_scores.mean()*100:.2f}% (+/- {cv_scores.std()*100:.2f}%)")
    print(f"ΜΕΣΟ MAE ERROR: EUR {mae_scores.mean():.2f}")

    #  Sanity Test Scenarios
    print("\n--- SANITY TEST: ΔΟΚΙΜΑΣΤΙΚΕΣ ΠΡΟΒΛΕΨΕΙΣ SE REAL SCENARIOS ---")

    feature_cols = X.columns.tolist()

    scenarios = [
        {
            "name": "1. Μικρό 50τμ, 1980, Κυψέλη",
            "sqm": 50, "bedrooms": 1, "bathrooms": 1, "floor": 2,
            "year_built": 1980, "suburb": "Κυψέλη (Αθήνα - Κέντρο)",
            "elevator": 1, "renovated": 0, "furnished": 0, "parking": 0
        },
        {
            "name": "2. Ανακαινισμένο 80τμ, 2005, Αμπελόκηποι",
            "sqm": 80, "bedrooms": 2, "bathrooms": 1, "floor": 3,
            "year_built": 2005, "suburb": "Αμπελόκηποι - Πεντάγωνο (Αθήνα - Κέντρο)",
            "elevator": 1, "renovated": 1, "furnished": 0, "parking": 0
        },
        {
            "name": "3. Πολυτελές 120τμ, 2018, Γλυφάδα με Parking",
            "sqm": 120, "bedrooms": 3, "bathrooms": 2, "floor": 4,
            "year_built": 2018, "suburb": "Γλυφάδα (Αθήνα - Νότια Προάστια)",
            "elevator": 1, "renovated": 0, "furnished": 0, "parking": 1
        }
    ]

    current_year = 2026

    for sc in scenarios:
        row = {}
        sub_df = df[df['suburb'] == sc['suburb']]
        
        if sub_df.empty:
            sub_df = df

        for col in feature_cols:
            if col == 'sqm': row[col] = sc['sqm']
            elif col == 'bedrooms': row[col] = sc['bedrooms']
            elif col == 'bathrooms': row[col] = sc['bathrooms']
            elif col == 'floor': row[col] = sc['floor']
            elif col == 'year_built': row[col] = sc['year_built']
            elif col == 'property_age': row[col] = current_year - sc['year_built']
            elif col == 'suburb': row[col] = sc['suburb']
            elif col == 'elevator': row[col] = sc['elevator']
            elif col == 'renovated': row[col] = sc['renovated']
            elif col == 'furnished': row[col] = sc['furnished']
            elif col == 'parking': row[col] = sc['parking']
            elif col == 'latitude': row[col] = sub_df['latitude'].mean()
            elif col == 'longitude': row[col] = sub_df['longitude'].mean()
            elif col == 'metro_distance_m': row[col] = sub_df['metro_distance_m'].mean()
            elif col == 'uni_distance_m': row[col] = sub_df['uni_distance_m'].mean()
            elif col == 'hospital_distance_m': row[col] = sub_df['hospital_distance_m'].mean()
            elif col == 'park_distance_m': row[col] = sub_df['park_distance_m'].mean()
            else:
                if pd.api.types.is_numeric_dtype(df[col]):
                    row[col] = df[col].median()
                else:
                    row[col] = df[col].mode()[0]

        input_df = pd.DataFrame([row])
        pred = model_pipeline.predict(input_df)[0]
        
        print(f"\n{sc['name']}")
        print(f"   Πρόβλεψη Ενοικίου: EUR {pred:.2f} /μήνα (EUR {pred/sc['sqm']:.2f}/τ.μ.)")

    print("\n---------------------------------------------------")
    print("Ο έλεγχος ολοκληρώθηκε!")

if __name__ == "__main__":
    validate()