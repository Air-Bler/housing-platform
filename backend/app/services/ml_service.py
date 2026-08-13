from math import radians, cos, sin, asin, sqrt
import pandas as pd
import numpy as np
import joblib
from backend.app.config import MODEL_PATH, DATA_PATH


model = joblib.load(MODEL_PATH)
df = pd.read_csv(DATA_PATH)

METRO_STATIONS = [
    {"name": "Σταθμός Συντάγματος", "lat": 37.9755, "lon": 23.7348},
    {"name": "Σταθμός Ευαγγελισμού", "lat": 37.9761, "lon": 23.7467},
    {"name": "Σταθμός Μέγαρο Μουσικής", "lat": 37.9792, "lon": 23.7528},
    {"name": "Σταθμός Αμπελόκηποι", "lat": 37.9868, "lon": 23.7570},
    {"name": "Σταθμός Πανεπιστήμιο", "lat": 37.9803, "lon": 23.7329},
    {"name": "Σταθμός Ομόνοια", "lat": 37.9841, "lon": 23.7281},
    {"name": "Σταθμός Μοναστηράκι", "lat": 37.9763, "lon": 23.7257},
    {"name": "Σταθμός Ακρόπολη", "lat": 37.9686, "lon": 23.7283},
    {"name": "Σταθμός Συγγρού-Φιξ", "lat": 37.9647, "lon": 23.7265},
    {"name": "Σταθμός Νέος Κόσμος", "lat": 37.9576, "lon": 23.7288},
    {"name": "Σταθμός Δάφνη", "lat": 37.9497, "lon": 23.7383},
    {"name": "Σταθμός Άγιος Δημήτριος", "lat": 37.9406, "lon": 23.7406},
    {"name": "Σταθμός Ηλιούπολη", "lat": 37.9304, "lon": 23.7460},
    {"name": "Σταθμός Άλιμος", "lat": 37.9184, "lon": 23.7483},
    {"name": "Σταθμός Αργυρούπολη", "lat": 37.9067, "lon": 23.7481},
    {"name": "Σταθμός Ελληνικό", "lat": 37.8925, "lon": 23.7483},
    {"name": "Σταθμός Πανόρμου", "lat": 37.9931, "lon": 23.7633},
    {"name": "Σταθμός Κατεχάκη", "lat": 37.9936, "lon": 23.7761},
    {"name": "Σταθμός Εθνική Άμυνα", "lat": 37.9996, "lon": 23.7844},
    {"name": "Σταθμός Χολαργός", "lat": 38.0048, "lon": 23.7947},
    {"name": "Σταθμός Νομισματοκοπείο", "lat": 38.0101, "lon": 23.8058},
    {"name": "Σταθμός Αγία Παρασκευή", "lat": 38.0173, "lon": 23.8126},
    {"name": "Σταθμός Χαλάνδρι", "lat": 38.0218, "lon": 23.8208},
    {"name": "Σταθμός Δουκίσσης Πλακεντίας", "lat": 38.0238, "lon": 23.8329},
    {"name": "Σταθμός Μεταξουργείο", "lat": 37.9862, "lon": 23.7210},
    {"name": "Σταθμός Σταθμός Λαρίσης", "lat": 37.9924, "lon": 23.7208},
    {"name": "Σταθμός Αττική", "lat": 37.9998, "lon": 23.7226},
    {"name": "Σταθμός Άγιος Αντώνιος", "lat": 38.0132, "lon": 23.6933},
    {"name": "Σταθμός Περιστέρι", "lat": 38.0157, "lon": 23.6828},
    {"name": "Σταθμός Ανθούπολη", "lat": 38.0197, "lon": 23.6749},
    {"name": "Σταθμός Κεραμεικός", "lat": 37.9785, "lon": 23.7118},
    {"name": "Σταθμός Ελαιώνας", "lat": 37.9875, "lon": 23.6948},
    {"name": "Σταθμός Αιγάλεω", "lat": 37.9916, "lon": 23.6813},
    {"name": "Σταθμός Αγία Μαρίνα", "lat": 37.9972, "lon": 23.6672},
    {"name": "Σταθμός Νίκαια", "lat": 37.9763, "lon": 23.6468},
    {"name": "Σταθμός Κορυδαλλός", "lat": 37.9818, "lon": 23.6515},
    {"name": "Σταθμός Μανιάτικα", "lat": 37.9606, "lon": 23.6358},
    {"name": "Σταθμός Δημοτικό Θέατρο", "lat": 37.9431, "lon": 23.6468},
    {"name": "Σταθμός Πειραιάς", "lat": 37.9482, "lon": 23.6425},
    {"name": "Σταθμός Φάληρο", "lat": 37.9450, "lon": 23.6653},
    {"name": "Σταθμός Μοσχάτο", "lat": 37.9547, "lon": 23.6806},
    {"name": "Σταθμός Καλλιθέα", "lat": 37.9603, "lon": 23.6975},
    {"name": "Σταθμός Ταύρος", "lat": 37.9626, "lon": 23.7052},
    {"name": "Σταθμός Πετράλωνα", "lat": 37.9686, "lon": 23.7092},
    {"name": "Σταθμός Θησείο", "lat": 37.9762, "lon": 23.7203},
    {"name": "Σταθμός Βικτώρια", "lat": 37.9930, "lon": 23.7302},
    {"name": "Σταθμός Άνω Πατήσια", "lat": 38.0238, "lon": 23.7358},
    {"name": "Σταθμός Νέα Ιωνία", "lat": 38.0308, "lon": 23.7533},
    {"name": "Σταθμός Μαρούσι", "lat": 38.0560, "lon": 23.8053},
    {"name": "Σταθμός Κηφισιά", "lat": 38.0735, "lon": 23.8080},
]

UNIVERSITIES = [
    {"name": "ΕΚΠΑ - Πανεπιστημιούπολη", "lat": 37.9682, "lon": 23.7667},
    {"name": "ΕΜΠ - Πολυτεχνειούπολη", "lat": 37.9775, "lon": 23.7825},
    {"name": "Οικονομικό Πανεπιστήμιο (ΟΠΑ / ΑΣΟΕΕ)", "lat": 37.9942, "lon": 23.7322},
    {"name": "Πάντειο Πανεπιστήμιο", "lat": 37.9608, "lon": 23.7175},
    {"name": "Πανεπιστήμιο Πειραιώς (ΠΑΠΕΙ)", "lat": 37.9416, "lon": 23.6531},
    {"name": "Πανεπιστήμιο Δυτικής Αττικής (ΠΑΔΑ)", "lat": 37.9902, "lon": 23.6738},
    {"name": "Γεωπονικό Πανεπιστήμιο", "lat": 37.9840, "lon": 23.7042},
]

HOSPITALS = [
    {"name": "Γ.Ν. Ευαγγελισμός", "lat": 37.9764, "lon": 23.7472},
    {"name": "Γ.Ν. Λαϊκό", "lat": 37.9839, "lon": 23.7663},
    {"name": "Γ.Ν. Ιπποκράτειο", "lat": 37.9822, "lon": 23.7558},
    {"name": "Γ.Ν. Αλεξάνδρα", "lat": 37.9808, "lon": 23.7578},
    {"name": "Γ.Ν. Σωτηρία", "lat": 37.9908, "lon": 23.7742},
    {"name": "Γ.Ν. KAT (Κηφισιά)", "lat": 38.0644, "lon": 23.8086},
    {"name": "Γ.Ν. Νίκαιας", "lat": 37.9733, "lon": 23.6492},
    {"name": "Γ.Ν. Τζάνειο (Πειραιάς)", "lat": 37.9367, "lon": 23.6458},
    {"name": "Γ.Ν. Ασκληπιείο Βούλας", "lat": 37.8483, "lon": 23.7617},
]

PARKS = [
    {"name": "Εθνικός Κήπος", "lat": 37.9731, "lon": 23.7369},
    {"name": "Πεδίο του Άρεως", "lat": 37.9922, "lon": 23.7364},
    {"name": "Λόφος Λυκαβηττού", "lat": 37.9818, "lon": 23.7432},
    {"name": "Λόφος Φιλοπάππου", "lat": 37.9672, "lon": 23.7214},
    {"name": "Πάρκο Αντώνης Τρίτσης", "lat": 38.0461, "lon": 23.7125},
    {"name": "Άλσος Νέας Σμύρνης", "lat": 37.9486, "lon": 23.7169},
    {"name": "Άλσος Βεΐκου (Γαλάτσι)", "lat": 38.0169, "lon": 23.7583},
    {"name": "ΚΠΙΣΝ (Ίδρυμα Σταύρος Νιάρχος)", "lat": 37.9392, "lon": 23.6931},
]

def haversine_m(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = radians(lat1), radians(lat2)
    delta_phi = radians(lat2 - lat1)
    delta_lambda = radians(lon2 - lon1)
    a = sin(delta_phi / 2)**2 + cos(phi1) * cos(phi2) * sin(delta_lambda / 2)**2
    return 2 * R * asin(sqrt(a))

def find_nearest_poi(lat, lon, poi_list):
    nearest = None
    min_dist = float('inf')
    for poi in poi_list:
        d = haversine_m(lat, lon, poi["lat"], poi["lon"])
        if d < min_dist:
            min_dist = d
            nearest = poi["name"]
    return nearest, int(min_dist)

def get_all_suburbs():
    return sorted(df['suburb'].dropna().unique().tolist())

def predict_rent_price(data):
    current_year = 2026
    property_age = current_year - data.year_built

    suburb_df = df[df['suburb'] == data.suburb]
    
    if not suburb_df.empty:
        suburb_lat = suburb_df['latitude'].mean()
        suburb_lon = suburb_df['longitude'].mean()
        suburb_avg_price = suburb_df['price'].mean()
        suburb_avg_sqm_price = suburb_df['price_per_sqm'].mean()
    else:
        suburb_lat = df['latitude'].mean()
        suburb_lon = df['longitude'].mean()
        suburb_avg_price = df['price'].mean()
        suburb_avg_sqm_price = df['price_per_sqm'].mean()

    metro_name, suburb_metro_dist = find_nearest_poi(suburb_lat, suburb_lon, METRO_STATIONS)
    uni_name, suburb_uni_dist = find_nearest_poi(suburb_lat, suburb_lon, UNIVERSITIES)
    hospital_name, suburb_hospital_dist = find_nearest_poi(suburb_lat, suburb_lon, HOSPITALS)
    park_name, suburb_park_dist = find_nearest_poi(suburb_lat, suburb_lon, PARKS)

    feature_cols = [col for col in df.columns if col not in ['price', 'price_per_sqm', 'id']]

    sample_row = {}
    for col in feature_cols:
        if pd.api.types.is_numeric_dtype(df[col]):
            sample_row[col] = [df[col].median() if not df[col].empty else 0]
        else:
            mode_val = df[col].mode()
            sample_row[col] = [mode_val[0] if not mode_val.empty else '']

    input_df = pd.DataFrame(sample_row)

    input_df['sqm'] = float(data.sqm)
    input_df['bedrooms'] = int(data.bedrooms)
    input_df['bathrooms'] = int(data.bathrooms)
    input_df['floor'] = int(data.floor)
    input_df['year_built'] = int(data.year_built)
    input_df['property_age'] = int(property_age)
    input_df['suburb'] = str(data.suburb)
    input_df['latitude'] = float(suburb_lat)
    input_df['longitude'] = float(suburb_lon)
    
    input_df['metro_distance_m'] = float(suburb_metro_dist)
    input_df['uni_distance_m'] = float(suburb_uni_dist)
    input_df['hospital_distance_m'] = float(suburb_hospital_dist)
    input_df['park_distance_m'] = float(suburb_park_dist)

    for col, val in [('elevator', data.elevator), ('renovated', data.renovated), 
                     ('furnished', data.furnished), ('parking', data.parking)]:
        if col in input_df.columns:
            input_df[col] = 1 if val else 0

    predicted_price = float(model.predict(input_df)[0])

    reasons = []
    if suburb_metro_dist <= 800:
        reasons.append({"type": "positive", "text": f"Άμεση πρόσβαση στο {metro_name} ({int(suburb_metro_dist)}m)"})
    elif suburb_metro_dist > 1200:
        reasons.append({"type": "negative", "text": f"Απόσταση από {metro_name} ({round(suburb_metro_dist/1000, 1)}km)"})

    if suburb_uni_dist <= 1200:
        reasons.append({"type": "positive", "text": f"Εγγύτητα στο {uni_name} ({int(suburb_uni_dist)}m)"})

    if suburb_park_dist <= 1200:
        reasons.append({"type": "positive", "text": f"Πρόσβαση στο {park_name} ({int(suburb_park_dist)}m)"})

    if suburb_hospital_dist <= 1500:
        reasons.append({"type": "positive", "text": f"Πρόσβαση στο {hospital_name} ({round(suburb_hospital_dist/1000, 1)}km)"})

    if data.renovated:
        reasons.append({"type": "positive", "text": "Πρόσφατη ανακαίνιση (+Αύξηση αξίας)"})
    if data.parking:
        reasons.append({"type": "positive", "text": "Ύπαρξη θέσης Parking"})
    if data.elevator and data.floor > 1:
        reasons.append({"type": "positive", "text": "Ύπαρξη ανελκυστήρα σε όροφο"})

    if property_age <= 10:
        reasons.append({"type": "positive", "text": f"Νεόδμητο ακίνητο ({data.year_built})"})
    elif property_age > 40:
        reasons.append({"type": "negative", "text": f"Παλαιότητα κτιρίου ({data.year_built})"})

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
            "metro_name": metro_name,
            "uni_m": int(suburb_uni_dist),
            "uni_name": uni_name,
            "hospital_m": int(suburb_hospital_dist),
            "hospital_name": hospital_name,
            "park_m": int(suburb_park_dist),
            "park_name": park_name
        },
        "reasons": reasons,
        "value_score": round(value_score, 1),
        "deal_type": deal_type,
        "suburb_stats": {
            "avg_price": round(suburb_avg_price, 2),
            "avg_price_per_sqm": round(suburb_avg_sqm_price, 2)
        }
    }