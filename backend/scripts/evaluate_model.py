"""Μετρά την ακρίβεια της εκτίμησης σε αγγελίες που το μοντέλο δεν είδε στην εκπαίδευση
και γράφει τα αποτελέσματα στο backend/models/model_metrics.json.

Αυτά τα νούμερα εμφανίζει η εφαρμογή (μέσο σφάλμα, εύρος τιμής). Τρέξτε το ξανά κάθε φορά
που αλλάζει το μοντέλο, τα δεδομένα ή η λογική του predict_rent_price.

    uv run python -m backend.scripts.evaluate_model
"""

import hashlib
import json
import warnings
from datetime import date

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

from backend.app.config import DATA_PATH, METRICS_PATH
from backend.app.errors import AppError
from backend.app.services import ml_service

# Ίδιο split με το train_model.py
TEST_SIZE = 0.2
RANDOM_STATE = 42


def _metrics(actual, predicted):
    actual, predicted = np.asarray(actual, float), np.asarray(predicted, float)
    return {
        "r2": round(float(r2_score(actual, predicted)), 3),
        "mae": round(float(mean_absolute_error(actual, predicted)), 1),
        "mape": round(float(np.mean(np.abs((actual - predicted) / actual))), 4),
    }


def evaluate():
    warnings.filterwarnings("ignore", category=UserWarning)
    df = ml_service.df
    X = df.drop(columns=["id", "price", "price_per_sqm"])
    train_idx, test_idx = train_test_split(df.index, test_size=TEST_SIZE, random_state=RANDOM_STATE)
    train, test = df.loc[train_idx], df.loc[test_idx]

    # 1. Το μοντέλο μόνο του, με τα χαρακτηριστικά όπως είναι στα δεδομένα.
    model_only = _metrics(test["price"], ml_service.model.predict(X.loc[test_idx]))

    # 2. Όλη η διαδρομή του /predict, με στατιστικά περιοχής μόνο από το train set.
    ml_service.SUBURB_INDEX = ml_service._build_suburb_index(train)
    # Το εύρος τιμής (price_min/max) εξαρτάται από τα metrics· η ίδια η εκτίμηση όχι.
    ml_service.METRICS = ml_service.METRICS or {"end_to_end": {"mape": 0.0}}
    actual, predicted, model_prices, skipped = [], [], [], 0
    for _, row in test.iterrows():
        floor = ml_service.decode_floor(row["floor"])
        if floor is None:  # ο όροφος έλειπε από την αγγελία
            skipped += 1
            continue
        try:
            result = ml_service.predict_rent_price({
                "suburb": ml_service.clean_suburb_name(row["suburb"]),
                "sqm": row["sqm"], "bedrooms": row["bedrooms"], "bathrooms": row["bathrooms"],
                "floor": floor, "year_built": row["year_built"], "metro_walk_time": "auto",
                "elevator": row["elevator"], "renovated": row["renovated"], "furnished": row["furnished"],
            })
        except AppError:
            skipped += 1
            continue
        actual.append(row["price"])
        predicted.append(result["estimated_price"])
        model_prices.append(result["model_price"])
    ml_service.SUBURB_INDEX = ml_service._build_suburb_index(df)

    metrics = {
        "generated": date.today().isoformat(),
        "dataset_rows": len(df),
        "dataset_md5": hashlib.md5(DATA_PATH.read_bytes()).hexdigest(),
        "test_rows": len(test),
        "split": {"test_size": TEST_SIZE, "random_state": RANDOM_STATE},
        "model_only": model_only,
        # Έξοδος του μοντέλου με τα inputs της εφαρμογής, πριν από τους πολλαπλασιαστές (όροφος, μετρό κ.λπ.).
        "app_model_price": _metrics(actual, model_prices),
        "end_to_end": {**_metrics(actual, predicted), "rows": len(actual), "skipped": skipped},
    }
    METRICS_PATH.write_text(json.dumps(metrics, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(metrics, indent=2, ensure_ascii=False))
    print(f"\nSaved to {METRICS_PATH}")


if __name__ == "__main__":
    evaluate()
