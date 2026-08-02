import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os

DATA_PATH = "data/processed/cleaned_properties.csv"
MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "price_model.pkl")

def train():
    if not os.path.exists(DATA_PATH):
        print(f"ERROR: Το αρχείο {DATA_PATH} δεν βρέθηκε!")
        return

    print("Reading processed data...")
    df = pd.read_csv(DATA_PATH)

    
    ignore_cols = ['id', 'price', 'price_per_sqm']
    X = df.drop(columns=[col for col in ignore_cols if col in df.columns])
    y = df['price']

    
    numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_features = X.select_dtypes(include=['object', 'category']).columns.tolist()

    print(f"Features: {len(numeric_features)} numeric, {len(categorical_features)} categorical")

    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', 'passthrough', numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ]
    )

    
    model_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(
            n_estimators=200,
            max_depth=12,
            min_samples_split=10,
            min_samples_leaf=4,
            random_state=42,
            n_jobs=-1
        ))
    ])

    #  Split Train / Test (80% / 20%)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print(f"Training model on {len(X_train)} samples...")
    model_pipeline.fit(X_train, y_train)

    #  Αξιολόγηση
    train_preds = model_pipeline.predict(X_train)
    test_preds = model_pipeline.predict(X_test)

    train_r2 = r2_score(y_train, train_preds)
    test_r2 = r2_score(y_test, test_preds)
    mae = mean_absolute_error(y_test, test_preds)
    rmse = np.sqrt(mean_squared_error(y_test, test_preds))

    print("\n--- EVALUATION RESULTS ---")
    print(f"Train R2 Score:          {train_r2 * 100:.2f}%")
    print(f"Test R2 Score (Accuracy): {test_r2 * 100:.2f}%")
    print(f"MAE Error:               EUR {mae:.2f}")
    print(f"RMSE Error:              EUR {rmse:.2f}")

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model_pipeline, MODEL_PATH)
    print(f"\nSaved trained model to: {MODEL_PATH}")

if __name__ == "__main__":
    train()