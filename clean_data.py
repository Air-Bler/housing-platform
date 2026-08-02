import pandas as pd
import numpy as np
import os

INPUT_FILE = "data/raw/properties.csv"
OUTPUT_DIR = "data/processed"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "cleaned_properties.csv")

# Μετρό & ΗΣΑΠ
METRO_STATIONS = [
    {"name": "Σύνταγμα", "suburb": "Κέντρο Αθήνας", "lat": 37.9755, "lon": 23.7348},
    {"name": "Ομόνοια", "suburb": "Κέντρο Αθήνας", "lat": 37.9841, "lon": 23.7281},
    {"name": "Μοναστηράκι", "suburb": "Μοναστηράκι", "lat": 37.9763, "lon": 23.7257},
    {"name": "Ευαγγελισμός", "suburb": "Ιλίσια / Κολωνάκι", "lat": 37.9761, "lon": 23.7468},
    {"name": "Μέγαρο Μουσικής", "suburb": "Ιλίσια", "lat": 37.9793, "lon": 23.7527},
    {"name": "Αμπελόκηποι", "suburb": "Αμπελόκηποι", "lat": 37.9873, "lon": 23.7571},
    {"name": "Πανεπιστήμιο", "suburb": "Κέντρο Αθήνας", "lat": 37.9803, "lon": 23.7328},
    {"name": "Fix (Συγγρού-Φιξ)", "suburb": "Κουκάκι", "lat": 37.9645, "lon": 23.7267},
    {"name": "Ακρόπολη", "suburb": "Μακρυγιάννη", "lat": 37.9686, "lon": 23.7284},
    {"name": "Νέος Κόσμος", "suburb": "Νέος Κόσμος", "lat": 37.9578, "lon": 23.7287},
    {"name": "Δάφνη", "suburb": "Δάφνη", "lat": 37.9493, "lon": 23.7383},
    {"name": "Άγιος Δημήτριος", "suburb": "Άγιος Δημήτριος", "lat": 37.9406, "lon": 23.7405},
    {"name": "Ηλιούπολη", "suburb": "Ηλιούπολη", "lat": 37.9300, "lon": 23.7480},
    {"name": "Άλιμος", "suburb": "Άλιμος", "lat": 37.9180, "lon": 23.7483},
    {"name": "Ελληνικό", "suburb": "Ελληνικό", "lat": 37.8926, "lon": 23.7437},
    {"name": "Πανόρμου", "suburb": "Αμπελόκηποι", "lat": 37.9932, "lon": 23.7634},
    {"name": "Κατεχάκη", "suburb": "Ελληνορώσων", "lat": 37.9936, "lon": 23.7761},
    {"name": "Εθνική Άμυνα", "suburb": "Πεντάγωνο / Νέο Ψυχικό", "lat": 37.9984, "lon": 23.7848},
    {"name": "Χολαργός", "suburb": "Χολαργός", "lat": 38.0049, "lon": 23.7946},
    {"name": "Νομισματοκοπείο", "suburb": "Χαλάνδρι / Αγία Παρασκευή", "lat": 38.0101, "lon": 23.8055},
    {"name": "Αγία Παρασκευή", "suburb": "Αγία Παρασκευή", "lat": 38.0173, "lon": 23.8126},
    {"name": "Χαλάνδρι", "suburb": "Χαλάνδρι", "lat": 38.0216, "lon": 23.8208},
    {"name": "Δουκίσσης Πλακεντίας", "suburb": "Χαλάνδρι / Βριλήσσια", "lat": 38.0238, "lon": 23.8329},
    {"name": "Κεραμεικός", "suburb": "Γκάζι / Κεραμεικός", "lat": 37.9784, "lon": 23.7121},
    {"name": "Ελαιώνας", "suburb": "Ελαιώνας", "lat": 37.9877, "lon": 23.6946},
    {"name": "Αιγάλεω", "suburb": "Αιγάλεω", "lat": 37.9913, "lon": 23.6812},
    {"name": "Αγία Μαρίνα", "suburb": "Αγία Βαρβάρα", "lat": 37.9972, "lon": 23.6672},
    {"name": "Νίκαια", "suburb": "Νίκαια", "lat": 37.9768, "lon": 23.6472},
    {"name": "Κορυδαλλός", "suburb": "Κορυδαλλός", "lat": 37.9822, "lon": 23.6511},
    {"name": "Μανιάτικα", "suburb": "Πειραιάς (Μανιάτικα)", "lat": 37.9587, "lon": 23.6334},
    {"name": "Πειραιάς", "suburb": "Πειραιάς Λιμάνι", "lat": 37.9478, "lon": 23.6428},
    {"name": "Δημοτικό Θέατρο", "suburb": "Πειραιάς Κέντρο", "lat": 37.9431, "lon": 23.6468},
    {"name": "Σταθμός Λαρίσης", "suburb": "Σταθμός Λαρίσης", "lat": 37.9924, "lon": 23.7208},
    {"name": "Αττική", "suburb": "Αττική", "lat": 37.9992, "lon": 23.7227},
    {"name": "Άγιος Νικόλαος", "suburb": "Κάτω Πατήσια", "lat": 38.0068, "lon": 23.7276},
    {"name": "Κάτω Πατήσια", "suburb": "Κάτω Πατήσια", "lat": 38.0125, "lon": 23.7289},
    {"name": "Άνω Πατήσια", "suburb": "Άνω Πατήσια", "lat": 38.0238, "lon": 23.7358},
    {"name": "Περισσός", "suburb": "Νέα Ιωνία / Περισσός", "lat": 38.0323, "lon": 23.7439},
    {"name": "Πευκάκια", "suburb": "Νέα Ιωνία", "lat": 38.0371, "lon": 23.7501},
    {"name": "Νέα Ιωνία", "suburb": "Νέα Ιωνία", "lat": 38.0418, "lon": 23.7552},
    {"name": "Ηράκλειο", "suburb": "Ηράκλειο", "lat": 38.0463, "lon": 23.7661},
    {"name": "Ειρήνη", "suburb": "Μαρούσι (ΟΑΚΑ)", "lat": 38.0436, "lon": 23.7801},
    {"name": "Νερατζιώτισσα", "suburb": "Μαρούσι", "lat": 38.0449, "lon": 23.7908},
    {"name": "Μαρούσι", "suburb": "Μαρούσι Κέντρο", "lat": 38.0560, "lon": 23.8080},
    {"name": "ΚΑΤ", "suburb": "Κηφισιά / Μαρούσι", "lat": 38.0661, "lon": 23.8098},
    {"name": "Κηφισιά", "suburb": "Κηφισιά", "lat": 38.0733, "lon": 23.8082},
    {"name": "Περιστέρι", "suburb": "Περιστέρι", "lat": 38.0158, "lon": 23.6917},
    {"name": "Ανθούπολη", "suburb": "Περιστέρι (Ανθούπολη)", "lat": 38.0189, "lon": 23.6844},
    {"name": "Άγιος Αντώνιος", "suburb": "Περιστέρι", "lat": 38.0064, "lon": 23.6987}
]

# Πανεπιστήμια & Σχολές Αττικής
UNIVERSITIES = [
    {"name": "ΕΚΠΑ - Πανεπιστημιούπολη", "suburb": "Ζωγράφου", "lat": 37.9686, "lon": 23.7666},
    {"name": "ΕΜΠ - Πολυτεχνειούπολη", "suburb": "Ζωγράφου", "lat": 37.9772, "lon": 23.7828},
    {"name": "ΟΠΑ / ASOEE", "suburb": "Πατησίων / Κυψέλη", "lat": 37.9942, "lon": 23.7323},
    {"name": "Πάντειον Πανεπιστήμιο", "suburb": "Κουκάκι / Νέος Κόσμος", "lat": 37.9602, "lon": 23.7171},
    {"name": "Πανεπιστήμιο Πειραιώς (ΠΑΠΕΙ)", "suburb": "Πειραιάς", "lat": 37.9416, "lon": 23.6529},
    {"name": "Γεωπονικό Πανεπιστήμιο", "suburb": "Βοτανικός", "lat": 37.9840, "lon": 23.7028},
    {"name": "ΠΑΔΑ - Πανεπιστημιούπολη 1", "suburb": "Αιγάλεω", "lat": 37.9922, "lon": 23.6750}
]

# Νοσοκομεία & Ιατρικά Κέντρα
HOSPITALS = [
    {"name": "Ευαγγελισμός", "suburb": "Ιλίσια / Κολωνάκι", "lat": 37.9760, "lon": 23.7471},
    {"name": "Σωτηρία", "suburb": "Γουδή / Αμπελόκηποι", "lat": 37.9892, "lon": 23.7744},
    {"name": "Γεννηματάς", "suburb": "Γουδή / Αμπελόκηποι", "lat": 37.9880, "lon": 23.7712},
    {"name": "Αττικόν", "suburb": "Χαϊδάρι", "lat": 38.0152, "lon": 23.6621},
    {"name": "Ερρίκος Ντυνάν", "suburb": "Αμπελόκηποι", "lat": 37.9930, "lon": 23.7681},
    {"name": "Υγεία / Μητέρα", "suburb": "Μαρούσι", "lat": 38.0315, "lon": 23.7882},
    {"name": "Λαϊκό Νοσοκομείο", "suburb": "Γουδή", "lat": 37.9841, "lon": 23.7663},
    {"name": "Παίδων Αγία Σοφία", "suburb": "Γουδή", "lat": 37.9856, "lon": 23.7651},
    {"name": "Τζάνειο", "suburb": "Πειραιάς", "lat": 37.9372, "lon": 23.6475}
]

# Πάρκα & Πράσινες Ζώνες
PARKS = [
    {"name": "Εθνικός Κήπος", "suburb": "Κέντρο Αθήνας", "lat": 37.9733, "lon": 23.7371},
    {"name": "Πεδίον του Άρεως", "suburb": "Κυψέλη / Πεδίον Άρεως", "lat": 37.9925, "lon": 23.7356},
    {"name": "ΚΠΙΣΝ (Ίδρυμα Σταύρος Νιάρχος)", "suburb": "Καλλιθέα / Φάληρο", "lat": 37.9392, "lon": 23.6925},
    {"name": "Άλσος Συγγρού", "suburb": "Μαρούσι / Κηφισιά", "lat": 38.0583, "lon": 23.8115},
    {"name": "Πάρκο Αντώνης Τρίτσης", "suburb": "Ίλιον / Άγιοι Ανάργυροι", "lat": 38.0345, "lon": 23.7088},
    {"name": "Λόφος Λυκαβηττού", "suburb": "Κολωνάκι / Νεάπολη", "lat": 37.9818, "lon": 23.7431},
    {"name": "Άλσος Νέας Σμύρνης", "suburb": "Νέα Σμύρνη", "lat": 37.9455, "lon": 23.7142},
    {"name": "Άλσος Παγκρατίου", "suburb": "Παγκράτι", "lat": 37.9698, "lon": 23.7460}
]

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371000  
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    delta_phi = np.radians(lat2 - lat1)
    delta_lambda = np.radians(lon2 - lon1)

    a = np.sin(delta_phi / 2.0)**2 + np.cos(phi1) * np.cos(phi2) * np.sin(delta_lambda / 2.0)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    return R * c

def get_min_distance(lat, lon, locations):
    if pd.isna(lat) or pd.isna(lon):
        return np.nan
    distances = [haversine_distance(lat, lon, loc['lat'], loc['lon']) for loc in locations]
    return round(min(distances))

def clean_property_data():
    if not os.path.exists(INPUT_FILE):
        print(f"ERROR: Το αρχείο {INPUT_FILE} δεν βρέθηκε!")
        return

    print("Reading raw data...")
    df = pd.read_csv(INPUT_FILE)
    print(f"Initial dataset size: {len(df)} rows, {len(df.columns)} columns")

    columns_to_keep = {
        'id': 'id',
        'price': 'price',
        'sq_meters': 'sqm',
        'rooms': 'bedrooms',
        'no_of_bathrooms': 'bathrooms',
        'floorNumber': 'floor',
        'year_of_construction': 'year_built',
        'energyClass': 'energy_class',
        'geographiesByLevel_4_fullName': 'suburb',
        'geographiesByLevel_2_fullName': 'area',
        'latitude': 'latitude',
        'longitude': 'longitude',
        'elevator': 'elevator',
        'parking': 'parking',
        'renovated': 'renovated',
        'furnished': 'furnished',
        'heatingMedium': 'heating_type'
    }

    existing_cols = [col for col in columns_to_keep.keys() if col in df.columns]
    df_clean = df[existing_cols].rename(columns=columns_to_keep)

    df_clean['price'] = pd.to_numeric(df_clean['price'], errors='coerce')
    df_clean['sqm'] = pd.to_numeric(df_clean['sqm'], errors='coerce')

    df_clean = df_clean.dropna(subset=['price', 'sqm'])
    
   
    df_clean = df_clean[(df_clean['price'] >= 200) & (df_clean['price'] <= 4000)]
    df_clean = df_clean[(df_clean['sqm'] >= 20) & (df_clean['sqm'] <= 300)]

    df_clean['price_per_sqm'] = (df_clean['price'] / df_clean['sqm']).round(2)
    df_clean = df_clean[(df_clean['price_per_sqm'] >= 4.0) & (df_clean['price_per_sqm'] <= 32.0)]

    if 'bedrooms' in df_clean.columns:
        df_clean['bedrooms'] = pd.to_numeric(df_clean['bedrooms'], errors='coerce').fillna(1).astype(int)
    if 'bathrooms' in df_clean.columns:
        df_clean['bathrooms'] = pd.to_numeric(df_clean['bathrooms'], errors='coerce').fillna(1).astype(int)

    if 'suburb' in df_clean.columns:
        df_clean['suburb'] = df_clean['suburb'].fillna('Unknown').astype(str).str.strip()

    if 'year_built' in df_clean.columns:
        df_clean['year_built'] = pd.to_numeric(df_clean['year_built'], errors='coerce')
        current_year = 2026
        df_clean.loc[(df_clean['year_built'] < 1900) | (df_clean['year_built'] > current_year), 'year_built'] = np.nan
        df_clean['year_built'] = df_clean.groupby('suburb')['year_built'].transform(lambda x: x.fillna(x.median()))
        df_clean['year_built'] = df_clean['year_built'].fillna(df_clean['year_built'].median())
        df_clean['property_age'] = current_year - df_clean['year_built']

    if 'latitude' in df_clean.columns:
        df_clean['latitude'] = pd.to_numeric(df_clean['latitude'], errors='coerce')
        df_clean['latitude'] = df_clean.groupby('suburb')['latitude'].transform(lambda x: x.fillna(x.mean()))
        df_clean['latitude'] = df_clean['latitude'].fillna(df_clean['latitude'].mean())

    if 'longitude' in df_clean.columns:
        df_clean['longitude'] = pd.to_numeric(df_clean['longitude'], errors='coerce')
        df_clean['longitude'] = df_clean.groupby('suburb')['longitude'].transform(lambda x: x.fillna(x.mean()))
        df_clean['longitude'] = df_clean['longitude'].fillna(df_clean['longitude'].mean())

    # Υπολογισμός Αποστάσεων (Μετρό, Πανεπιστήμια, Νοσοκομεία, Πάρκα)
    print("Calculating distances from Metro, Universities, Hospitals & Parks...")
    
    df_clean['metro_distance_m'] = df_clean.apply(lambda r: get_min_distance(r['latitude'], r['longitude'], METRO_STATIONS), axis=1)
    df_clean['uni_distance_m'] = df_clean.apply(lambda r: get_min_distance(r['latitude'], r['longitude'], UNIVERSITIES), axis=1)
    df_clean['hospital_distance_m'] = df_clean.apply(lambda r: get_min_distance(r['latitude'], r['longitude'], HOSPITALS), axis=1)
    df_clean['park_distance_m'] = df_clean.apply(lambda r: get_min_distance(r['latitude'], r['longitude'], PARKS), axis=1)

    for col in ['metro_distance_m', 'uni_distance_m', 'hospital_distance_m', 'park_distance_m']:
        df_clean[col] = df_clean[col].fillna(df_clean[col].median())

    if 'heating_type' in df_clean.columns:
        df_clean['heating_type'] = df_clean['heating_type'].fillna('Άγνωστο').astype(str)

    if 'energy_class' in df_clean.columns:
        df_clean['energy_class'] = df_clean['energy_class'].fillna('Άγνωστο').astype(str)

    if 'floor' in df_clean.columns:
        df_clean['floor'] = pd.to_numeric(df_clean['floor'], errors='coerce').fillna(0).astype(int)

    for col in ['elevator', 'parking', 'renovated', 'furnished']:
        if col in df_clean.columns:
            df_clean[col] = df_clean[col].apply(lambda x: 1 if str(x).lower() in ['1', 'true', '1.0', 'yes'] else 0)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    df_clean.to_csv(OUTPUT_FILE, index=False)

    print("\nData cleaning and enrichment with 4 POIs completed successfully!")
    print(f"Final cleaned dataset size: {len(df_clean)} rows")
    print(f"Saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    clean_property_data()