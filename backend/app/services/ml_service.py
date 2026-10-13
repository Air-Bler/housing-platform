import json
import logging
from datetime import date
from math import radians, cos, sin, asin, sqrt
import pandas as pd
import joblib
from backend.app.config import MODEL_PATH, DATA_PATH, METRICS_PATH
from backend.app.errors import AppError

logger = logging.getLogger("housing.ml")


def _load(path, loader, what):
    try:
        value = loader(path)
        logger.info("Loaded %s from %s", what, path)
        return value
    except FileNotFoundError:
        logger.error("%s not found at %s", what, path)
    except Exception:
        logger.exception("Failed to load %s from %s", what, path)
    return None


model = _load(MODEL_PATH, joblib.load, "ML model")
df = _load(DATA_PATH, pd.read_csv, "dataset")
if df is None:
    df = pd.DataFrame()
# Metrics μετρημένα σε αγγελίες που το μοντέλο δεν είδε στην εκπαίδευση (backend/scripts/evaluate_model.py).
METRICS = _load(METRICS_PATH, lambda p: json.loads(p.read_text(encoding="utf-8")), "model metrics")


def check_ready():
    """Καλείται στην εκκίνηση. Χωρίς μοντέλο, δεδομένα ή metrics η εφαρμογή δεν ξεκινά,
    αντί να εμφανίζει επινοημένες τιμές σαν πραγματικές."""
    missing = [name for name, ok in [
        (f"μοντέλο ({MODEL_PATH})", model is not None),
        (f"δεδομένα ({DATA_PATH})", not df.empty),
        (f"metrics ({METRICS_PATH}) - τρέξτε backend/scripts/evaluate_model.py", METRICS is not None),
    ] if not ok]
    if missing:
        raise RuntimeError("Λείπουν αρχεία που χρειάζεται η εφαρμογή: " + "; ".join(missing))


def clean_suburb_name(raw: str) -> str:
    return str(raw).split('(')[0].split('-')[0].split('–')[0].strip()


def _build_suburb_index(data):
    """καθαρό όνομα (lowercase) -> στοιχεία περιοχής όπως εμφανίζονται στα δεδομένα εκπαίδευσης."""
    if data.empty or 'suburb' not in data.columns:
        return {}
    d = data.assign(_clean=data['suburb'].astype(str).map(clean_suburb_name).str.lower())
    index = {}
    for key, rows in d.groupby('_clean'):
        # Το μοντέλο εκπαιδεύτηκε με το πλήρες όνομα (π.χ. "Κυψέλη (Αθήνα - Κέντρο)") και το αντίστοιχο area.
        raw = rows['suburb'].mode()[0]
        index[key] = {
            "name": clean_suburb_name(raw),
            "model_suburb": raw,
            "model_area": rows.loc[rows['suburb'] == raw, 'area'].mode()[0],
            "rows": rows.drop(columns='_clean'),
        }
    return index


SUBURB_INDEX = _build_suburb_index(df)


# Πλήρης Κατάλογος Σταθμών Μετρό & ΗΣΑΠ Αθήνας

METRO_STATIONS = [
    # Γραμμή 1 (ΗΣΑΠ - Πράσινη)
    {"name": "Σταθμός Πειραιάς (ΗΣΑΠ/Γρ.1)", "lat": 37.9482, "lon": 23.6425},
    {"name": "Σταθμός Φάληρο", "lat": 37.9450, "lon": 23.6653},
    {"name": "Σταθμός Μοσχάτο", "lat": 37.9547, "lon": 23.6806},
    {"name": "Σταθμός Καλλιθέα", "lat": 37.9603, "lon": 23.6975},
    {"name": "Σταθμός Ταύρος", "lat": 37.9626, "lon": 23.7052},
    {"name": "Σταθμός Πετράλωνα", "lat": 37.9686, "lon": 23.7092},
    {"name": "Σταθμός Θησείο", "lat": 37.9762, "lon": 23.7203},
    {"name": "Σταθμός Μοναστηράκι", "lat": 37.9763, "lon": 23.7257},
    {"name": "Σταθμός Ομόνοια", "lat": 37.9841, "lon": 23.7281},
    {"name": "Σταθμός Βικτώρια", "lat": 37.9930, "lon": 23.7302},
    {"name": "Σταθμός Αττική", "lat": 37.9998, "lon": 23.7226},
    {"name": "Σταθμός Άγιος Νικόλαος", "lat": 38.0071, "lon": 23.7282},
    {"name": "Σταθμός Κάτω Πατήσια", "lat": 38.0125, "lon": 23.7291},
    {"name": "Σταθμός Άγιος Ελευθέριος", "lat": 38.0201, "lon": 23.7319},
    {"name": "Σταθμός Άνω Πατήσια", "lat": 38.0238, "lon": 23.7358},
    {"name": "Σταθμός Περισσός", "lat": 38.0315, "lon": 23.7472},
    {"name": "Σταθμός Πευκάκια", "lat": 38.0367, "lon": 23.7505},
    {"name": "Σταθμός Νέα Ιωνία", "lat": 38.0415, "lon": 23.7554},
    {"name": "Σταθμός Ηράκλειο", "lat": 38.0463, "lon": 23.7661},
    {"name": "Σταθμός Ειρήνη", "lat": 38.0440, "lon": 23.7840},
    {"name": "Σταθμός Νερατζιώτισσα", "lat": 38.0450, "lon": 23.7928},
    {"name": "Σταθμός Μαρούσι", "lat": 38.0560, "lon": 23.8053},
    {"name": "Σταθμός ΚΑΤ", "lat": 38.0662, "lon": 23.8078},
    {"name": "Σταθμός Κηφισιά", "lat": 38.0735, "lon": 23.8080},

    # Γραμμή 2 (Κόκκινη)
    {"name": "Σταθμός Ανθούπολη", "lat": 38.0197, "lon": 23.6749},
    {"name": "Σταθμός Περιστέρι", "lat": 38.0157, "lon": 23.6828},
    {"name": "Σταθμός Άγιος Αντώνιος", "lat": 38.0132, "lon": 23.6933},
    {"name": "Σταθμός Σεπόλια", "lat": 38.0028, "lon": 23.7142},
    {"name": "Σταθμός Σταθμός Λαρίσης", "lat": 37.9924, "lon": 23.7208},
    {"name": "Σταθμός Μεταξουργείο", "lat": 37.9862, "lon": 23.7210},
    {"name": "Σταθμός Πανεπιστήμιο", "lat": 37.9803, "lon": 23.7329},
    {"name": "Σταθμός Σύνταγμα", "lat": 37.9755, "lon": 23.7348},
    {"name": "Σταθμός Ακρόπολη", "lat": 37.9686, "lon": 23.7283},
    {"name": "Σταθμός Συγγρού-Φιξ", "lat": 37.9647, "lon": 23.7265},
    {"name": "Σταθμός Νέος Κόσμος", "lat": 37.9576, "lon": 23.7288},
    {"name": "Σταθμός Άγιος Ιωάννης", "lat": 37.9560, "lon": 23.7350},
    {"name": "Σταθμός Δάφνη", "lat": 37.9497, "lon": 23.7383},
    {"name": "Σταθμός Άγιος Δημήτριος", "lat": 37.9406, "lon": 23.7406},
    {"name": "Σταθμός Ηλιούπολη", "lat": 37.9304, "lon": 23.7460},
    {"name": "Σταθμός Άλιμος", "lat": 37.9184, "lon": 23.7483},
    {"name": "Σταθμός Αργυρούπολη", "lat": 37.9067, "lon": 23.7481},
    {"name": "Σταθμός Ελληνικό", "lat": 37.8925, "lon": 23.7483},

    # Γραμμή 3 (Μπλε)
    {"name": "Σταθμός Δημοτικό Θέατρο", "lat": 37.9431, "lon": 23.6468},
    {"name": "Σταθμός Μανιάτικα", "lat": 37.9606, "lon": 23.6358},
    {"name": "Σταθμός Νίκαια", "lat": 37.9763, "lon": 23.6468},
    {"name": "Σταθμός Κορυδαλλός", "lat": 37.9818, "lon": 23.6515},
    {"name": "Σταθμός Αγία Βαρβάρα", "lat": 37.9898, "lon": 23.6599},
    {"name": "Σταθμός Αγία Μαρίνα", "lat": 37.9972, "lon": 23.6672},
    {"name": "Σταθμός Αιγάλεω", "lat": 37.9916, "lon": 23.6813},
    {"name": "Σταθμός Ελαιώνας", "lat": 37.9875, "lon": 23.6948},
    {"name": "Σταθμός Κεραμεικός", "lat": 37.9785, "lon": 23.7118},
    {"name": "Σταθμός Ευαγγελισμός", "lat": 37.9761, "lon": 23.7467},
    {"name": "Σταθμός Μέγαρο Μουσικής", "lat": 37.9792, "lon": 23.7528},
    {"name": "Σταθμός Αμπελόκηποι", "lat": 37.9868, "lon": 23.7570},
    {"name": "Σταθμός Πανόρμου", "lat": 37.9931, "lon": 23.7633},
    {"name": "Σταθμός Κατεχάκη", "lat": 37.9936, "lon": 23.7761},
    {"name": "Σταθμός Εθνική Άμυνα", "lat": 37.9996, "lon": 23.7844},
    {"name": "Σταθμός Χολαργός", "lat": 38.0048, "lon": 23.7947},
    {"name": "Σταθμός Νομισματοκοπείο", "lat": 38.0101, "lon": 23.8058},
    {"name": "Σταθμός Αγία Παρασκευή", "lat": 38.0173, "lon": 23.8126},
    {"name": "Σταθμός Χαλάνδρι", "lat": 38.0218, "lon": 23.8208},
    {"name": "Σταθμός Δουκίσσης Πλακεντίας", "lat": 38.0238, "lon": 23.8329}
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
    {"name": "Άλσος Παγκρατίου", "lat": 37.9688, "lon": 23.7470},
    {"name": "Άλσος Βύρωνα", "lat": 37.9620, "lon": 23.7530},
    {"name": "Πάρκο Αγίας Παρασκευής", "lat": 38.0173, "lon": 23.8126},
    {"name": "Άλσος Κηφισιάς", "lat": 38.0735, "lon": 23.8080}
]

SUBURB_ALIASES = {
    "βικτώρια": "Λεωφόρος Πατησίων",
    "πλατεία βικτωρίας": "Λεωφόρος Πατησίων",
    "κάτω πατήσια": "Λεωφόρος Πατησίων",
    "πλατεία αμερικής": "Λεωφόρος Πατησίων",
    "άγιος παντελεήμονας": "Λεωφόρος Πατησίων",
    "πλατεία κολιάτσου": "Λεωφόρος Πατησίων",
    "ομόνοια": "Κέντρο",
    "σύνταγμα": "Ιστορικό Κέντρο",
    "μοναστηράκι": "Ιστορικό Κέντρο",
    "πλάκα": "Ιστορικό Κέντρο",
    "θησείο": "Ιστορικό Κέντρο",
    "μουσείο": "Εξάρχεια",
    "νεάπολη": "Εξάρχεια"
}

COORDS_MAP = {
    "βικτώρια": (37.9930, 23.7302),
    "πλατεία βικτωρίας": (37.9930, 23.7302),
    "ομόνοια": (37.9841, 23.7281),
    "κάτω πατήσια": (38.0125, 23.7291),
    "άνω πατήσια": (38.0238, 23.7358),
    "πατήσια": (38.0150, 23.7320),
    "λεωφόρος πατησίων": (38.0050, 23.7310),
    "λεωφ. πατησίων": (38.0050, 23.7310),
    "κυψέλη": (37.9990, 23.7400),
    "εξάρχεια": (37.9865, 23.7350),
    "κολωνάκι": (37.9780, 23.7420),
    "κουκάκι": (37.9640, 23.7240),
    "παγκράτι": (37.9680, 23.7490),
    "αμπελόκηποι": (37.9868, 23.7570),
    "νέος κόσμος": (37.9576, 23.7288),
    "σεπόλια": (38.0028, 23.7142),
    "μεταξουργείο": (37.9862, 23.7210),
    "κεραμεικός": (37.9785, 23.7118),
    "πετράλωνα": (37.9686, 23.7092),
    "δάφνη": (37.9497, 23.7383),
    "νέα σμύρνη": (37.9486, 23.7169),
    "καλλιθέα": (37.9550, 23.7000),
    "βύρωνας": (37.9620, 23.7530),
    "καισαριανή": (37.9680, 23.7600),
    "ζωγράφου": (37.9730, 23.7710),
    "ιλίσια": (37.9770, 23.7590),
    "περιστέρι": (38.0150, 23.6900),
    "αιγάλεω": (37.9916, 23.6813),
    "μαρούσι": (38.0560, 23.8053),
    "χαλάνδρι": (38.0218, 23.8208),
    "αγία παρασκευή": (38.0173, 23.8126),
    "ηλιούπολη": (37.9304, 23.7460),
    "άλιμος": (37.9184, 23.7483),
    "γλυφάδα": (37.8630, 23.7540),
    "αργυρούπολη": (37.9067, 23.7481),
    "κηφισιά": (38.0735, 23.8080),
    "πειραιάς": (37.9482, 23.6425),
    "γκύζη": (37.9910, 23.7470),
    "πολύγωνο": (37.9980, 23.7520),
    "ιστορικό κέντρο": (37.9755, 23.7300),
    "κέντρο": (37.9800, 23.7300)
}

# Αντιπροσωπευτική απόσταση (m) για κάθε επιλογή χρόνου με τα πόδια της φόρμας.
METRO_WALK_DISTANCE_M = {"under_5": 280, "5_10": 600, "10_15": 1000, "over_15": 1600}
METRO_WALK_LABEL = {"under_5": "Έως 5 λεπτά με τα πόδια", "5_10": "5-10 λεπτά με τα πόδια",
                    "10_15": "10-15 λεπτά με τα πόδια", "over_15": "Πάνω από 15 λεπτά με τα πόδια"}
# Ο όροφος στα δεδομένα (floorNumber του Spitogatos) είναι κωδικός, όχι αριθμός ορόφου:
# 1 υπόγειο, 2 ημιυπόγειο, 3 ισόγειο, 4 υπερυψωμένο, 6 = 1ος, 7 = 2ος, ... (όροφος + 5).
# Το 0 σημαίνει ότι η τιμή έλειπε από την αγγελία.
def encode_floor(floor: int) -> int:
    if floor < 0:
        return 1
    if floor == 0:
        return 3
    return floor + 5


def decode_floor(code: int) -> int | None:
    """Κωδικός δεδομένων -> όροφος της φόρμας (το ημιυπόγειο ως υπόγειο, το υπερυψωμένο ως ισόγειο)."""
    code = int(code)
    if code == 0:
        return None
    return {1: -1, 2: -1, 3: 0, 4: 0}.get(code, code - 5)


# Επιδράσεις μικρότερες από αυτό δεν εμφανίζονται ως παράγοντες (θόρυβος του μοντέλου).
MIN_FACTOR_EUR = 10

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
    suburbs_set = set()
    if df is not None and not df.empty and 'suburb' in df.columns:
        raw_suburbs = df['suburb'].dropna().astype(str).tolist()
        for s in raw_suburbs:
            cleaned = s.split('(')[0].split('-')[0].split('–')[0].strip()
            if cleaned:
                suburbs_set.add(cleaned)
    
    for alias, parent in SUBURB_ALIASES.items():
        if parent.lower() in SUBURB_INDEX:
            suburbs_set.add(alias.capitalize())

    return sorted(list(suburbs_set))

def get_model_metadata():
    m = METRICS["end_to_end"]
    return {
        "dataset_size": len(df),
        "test_size": METRICS["test_rows"],
        "r2": m["r2"],
        "mae": m["mae"],
        "mape_pct": round(m["mape"] * 100, 1),
    }

# Ελάχιστες αγγελίες για να εμφανιστεί μια περιοχή στα δημόσια στατιστικά.
MIN_LISTINGS_PUBLIC = 15


def _valid_rows():
    cols = ['suburb', 'price_per_sqm', 'latitude', 'longitude']
    return df.dropna(subset=cols)


def get_city_stats():
    """Συγκεντρωτικά στοιχεία για την αρχική και τις λίστες περιοχών.
    Επιστρέφονται μόνο μέσοι όροι, ποτέ μεμονωμένες αγγελίες."""
    rows = _valid_rows()
    grouped = (rows.assign(name=rows['suburb'].map(clean_suburb_name))
               .groupby('name')['price_per_sqm'].agg(['mean', 'count']).reset_index())
    grouped = grouped[grouped['count'] >= MIN_LISTINGS_PUBLIC]
    renovated = rows['renovated'].dropna()
    return {
        "totalProperties": len(rows),
        "neighborhoodCount": len(grouped),
        "avgPricePerSqm": round(float(rows['price_per_sqm'].mean()), 1),
        "pctNotRenovated": round(float((renovated == 0).mean() * 100)) if len(renovated) else None,
        "neighborhoods": [
            {"name": r['name'], "avgPrice": round(float(r['mean']), 2), "count": int(r['count'])}
            for _, r in grouped.iterrows()
        ],
    }


def get_heatmap_areas():
    """Μέση τιμή ανά τ.μ. και κέντρο κάθε περιοχής (όπως ορίζεται στα δεδομένα) για τον χάρτη της αρχικής."""
    grouped = _valid_rows().groupby('suburb').agg(
        lat=('latitude', 'mean'), lon=('longitude', 'mean'),
        price=('price_per_sqm', 'mean'), count=('price_per_sqm', 'count'),
    ).reset_index()
    grouped = grouped[grouped['count'] >= MIN_LISTINGS_PUBLIC]
    return [
        {"name": clean_suburb_name(r['suburb']), "position": [round(float(r['lat']), 5), round(float(r['lon']), 5)],
         "price": round(float(r['price']), 2), "count": int(r['count'])}
        for _, r in grouped.iterrows()
    ]


def get_all_suburbs_stats():
    if df is None or df.empty or 'suburb' not in df.columns:
        return []

    temp_df = df.copy()
    temp_df['clean_suburb'] = temp_df['suburb'].astype(str).apply(
        lambda x: x.split('(')[0].split('-')[0].split('–')[0].strip()
    )

    if 'price_per_sqm' not in temp_df.columns:
        temp_df['price_per_sqm'] = temp_df['price'] / temp_df['sqm'].replace(0, 1)

    grouped = temp_df.groupby('clean_suburb').agg(
        avg_rent=('price', 'mean'),
        median_rent=('price', 'median'),
        min_rent=('price', 'min'),
        max_rent=('price', 'max'),
        avg_sqm_price=('price_per_sqm', 'mean'),
        count=('clean_suburb', 'count'),
        lat=('latitude', 'mean'),
        lon=('longitude', 'mean')
    ).reset_index()

    stats_dict = {}
    for _, row in grouped.iterrows():
        name = str(row['clean_suburb'])
        name_lower = name.lower()
        
        lat = float(row['lat']) if pd.notna(row['lat']) and row['lat'] != 0 else COORDS_MAP.get(name_lower, (37.9755, 23.7348))[0]
        lon = float(row['lon']) if pd.notna(row['lon']) and row['lon'] != 0 else COORDS_MAP.get(name_lower, (37.9755, 23.7348))[1]

        stats_dict[name_lower] = {
            "name": name,
            "avgRent": round(float(row['avg_rent']), 1),
            "medianRent": round(float(row['median_rent']), 1),
            "minRent": round(float(row['min_rent']), 1),
            "maxRent": round(float(row['max_rent']), 1),
            "avgSqmPrice": round(float(row['avg_sqm_price']), 2),
            "listingsCount": int(row['count']),
            "lat": lat,
            "lon": lon
        }

    for alias_name, parent_name in SUBURB_ALIASES.items():
        alias_lower = alias_name.lower()
        parent_lower = parent_name.lower()

        if alias_lower not in stats_dict:
            parent_stats = stats_dict.get(parent_lower)
            if parent_stats is None:
                continue

            # Χωρίς δικές του συντεταγμένες, το alias εμφανίζεται στη θέση της περιοχής στην οποία ανήκει.
            coords = COORDS_MAP.get(alias_lower, (parent_stats["lat"], parent_stats["lon"]))
            stats_dict[alias_lower] = {
                "name": alias_name.capitalize(),
                "avgRent": parent_stats["avgRent"],
                "medianRent": parent_stats["medianRent"],
                "minRent": parent_stats["minRent"],
                "maxRent": parent_stats["maxRent"],
                "avgSqmPrice": parent_stats["avgSqmPrice"],
                "listingsCount": parent_stats["listingsCount"],
                "lat": coords[0],
                "lon": coords[1]
            }

    return sorted(list(stats_dict.values()), key=lambda x: x['name'])




def predict_rent_price(data):
    def get_val(key, default=None):
        if hasattr(data, key):
            v = getattr(data, key)
            return v if v is not None else default
        elif isinstance(data, dict):
            v = data.get(key)
            return v if v is not None else default
        return default

    suburb_input = str(get_val('suburb', '')).strip()
    sqm = float(get_val('sqm'))
    bedrooms = int(get_val('bedrooms'))
    bathrooms = int(get_val('bathrooms'))
    floor = int(get_val('floor'))
    year_built = int(get_val('year_built'))
    metro_walk_time = str(get_val('metro_walk_time', 'auto')).strip().lower()
    elevator = bool(get_val('elevator', False))
    renovated = bool(get_val('renovated', False))
    furnished = bool(get_val('furnished', False))
    parking = bool(get_val('parking', False))
    user_asking = get_val('user_asking_price', None)
    vision_score = get_val('vision_score', None)

    property_age = date.today().year - year_built

    suburb_raw = clean_suburb_name(suburb_input).lower()
    resolved_raw = SUBURB_ALIASES.get(suburb_raw, suburb_raw).lower()
    suburb_info = SUBURB_INDEX.get(resolved_raw)
    if suburb_info is None:
        # Χωρίς αγγελίες για την περιοχή δεν έχουμε ούτε συντεταγμένες ούτε τιμές αναφοράς.
        raise AppError(422, "UNKNOWN_SUBURB",
                       f"Δεν υπάρχουν δεδομένα για την περιοχή «{suburb_input}». Επιλέξτε περιοχή από τη λίστα.",
                       [{"field": "suburb", "message": "Άγνωστη περιοχή"}])
    suburb_df = suburb_info["rows"]

    #  Συντεταγμένες
    if suburb_raw in COORDS_MAP:
        suburb_lat, suburb_lon = COORDS_MAP[suburb_raw]
    else:
        suburb_lat = float(suburb_df['latitude'].mean())
        suburb_lon = float(suburb_df['longitude'].mean())

    #  Μέσος όρος τιμών περιοχής
    suburb_avg_price = float(suburb_df['price'].mean())
    suburb_avg_sqm_price = float(suburb_df['price_per_sqm'].mean())

    #  Υπολογισμός Εγγύτητας σε POIs
    metro_name, suburb_metro_dist = find_nearest_poi(suburb_lat, suburb_lon, METRO_STATIONS)
    uni_name, suburb_uni_dist = find_nearest_poi(suburb_lat, suburb_lon, UNIVERSITIES)
    hospital_name, suburb_hospital_dist = find_nearest_poi(suburb_lat, suburb_lon, HOSPITALS)
    park_name, suburb_park_dist = find_nearest_poi(suburb_lat, suburb_lon, PARKS)

    # Ο χρόνος με τα πόδια που δηλώνει ο χρήστης είναι πιο ακριβής από την απόσταση από το κέντρο της περιοχής.
    metro_distance = METRO_WALK_DISTANCE_M.get(metro_walk_time, float(suburb_metro_dist))

    # Χαρακτηριστικά που δεν ζητάμε από τον χρήστη (π.χ. ενεργειακή κλάση) παίρνουν την τυπική τιμή της περιοχής.
    feature_cols = [col for col in df.columns if col not in ['price', 'price_per_sqm', 'id']]
    sample_row = {}
    for col in feature_cols:
        source = suburb_df[col] if suburb_df[col].notna().any() else df[col]
        sample_row[col] = [source.median() if pd.api.types.is_numeric_dtype(source) else source.mode()[0]]

    input_df = pd.DataFrame(sample_row)
    input_df['sqm'] = float(sqm)
    input_df['bedrooms'] = int(bedrooms)
    input_df['bathrooms'] = int(bathrooms)
    input_df['floor'] = encode_floor(floor)
    input_df['year_built'] = int(year_built)
    input_df['property_age'] = int(property_age)
    # Ίδια μορφή με τα δεδομένα εκπαίδευσης, αλλιώς το one-hot encoding αγνοεί την περιοχή.
    input_df['suburb'] = suburb_info["model_suburb"]
    input_df['area'] = suburb_info["model_area"]
    input_df['latitude'] = float(suburb_lat)
    input_df['longitude'] = float(suburb_lon)
    input_df['metro_distance_m'] = float(metro_distance)
    input_df['uni_distance_m'] = float(suburb_uni_dist)
    input_df['hospital_distance_m'] = float(suburb_hospital_dist)
    input_df['park_distance_m'] = float(suburb_park_dist)

    for col, val in [('elevator', elevator), ('renovated', renovated), ('furnished', furnished)]:
        input_df[col] = 1 if val else 0

    # Παράγοντες τιμής: πόσο αλλάζει η εκτίμηση του μοντέλου αν αλλάξει μόνο ένα χαρακτηριστικό
    # προς την τυπική τιμή. Όλα τα σενάρια προβλέπονται μαζί σε ένα batch.
    known_floors = suburb_df['floor'][suburb_df['floor'] != 0].map(decode_floor)
    typical_floor = int(known_floors.median()) if not known_floors.empty else 1
    typical_year = int(suburb_df['year_built'].median())
    expected_bedrooms = max(1, round((sqm - 20) / 25))

    def variant(**changes):
        row = input_df.copy()
        for k, v in changes.items():
            row[k] = v
        return row

    factors = [("elevator", variant(elevator=0 if elevator else 1))]
    if renovated:
        factors.append(("renovated", variant(renovated=0)))
    if furnished:
        factors.append(("furnished", variant(furnished=0)))
    if floor != typical_floor:
        factors.append(("floor", variant(floor=encode_floor(typical_floor))))
    if bedrooms != expected_bedrooms:
        factors.append(("bedrooms", variant(bedrooms=expected_bedrooms)))
    if abs(year_built - typical_year) >= 5:
        factors.append(("year_built", variant(year_built=typical_year,
                                              property_age=date.today().year - typical_year)))
    if metro_walk_time in METRO_WALK_DISTANCE_M:
        factors.append(("metro", variant(metro_distance_m=float(suburb_metro_dist))))

    # Αν το μοντέλο αποτύχει, το σφάλμα φτάνει στον χρήστη ως 500 αντί για μια εκτίμηση από άλλη μέθοδο.
    predictions = model.predict(pd.concat([input_df] + [v for _, v in factors], ignore_index=True))
    model_price = float(predictions[0])
    effects = {key: model_price - float(p) for (key, _), p in zip(factors, predictions[1:])}
    base_predicted_price = model_price

    # Η προσαρμογή από τις φωτογραφίες δεν προκύπτει από τα δεδομένα· εμφανίζεται χωριστά ως εκτίμηση.
    vision_delta_eur = 0.0
    if vision_score is not None:
        v_score = float(vision_score)
        if v_score >= 7.5:
            vision_delta_pct = (v_score - 7.0) * 0.025
        elif v_score <= 5.5:
            vision_delta_pct = (v_score - 6.0) * 0.03
        else:
            vision_delta_pct = 0.0
        vision_delta_eur = round(base_predicted_price * vision_delta_pct, 2)

    predicted_price = max(150.0, base_predicted_price + vision_delta_eur)

    # Εύρος τιμής από το σφάλμα που μετρήθηκε σε αγγελίες εκτός εκπαίδευσης.
    dynamic_delta = max(60.0, round(predicted_price * METRICS["end_to_end"]["mape"], 2))
    price_min = max(100.0, round(predicted_price - dynamic_delta, 2))
    price_max = round(predicted_price + dynamic_delta, 2)

    #  Explainability Reasons
    def floor_label(f):
        return "Υπόγειο" if f < 0 else "Ισόγειο" if f == 0 else f"{f}ος όροφος"

    factor_text = {
        "elevator": "Με ανελκυστήρα" if elevator else "Χωρίς ανελκυστήρα",
        "renovated": "Ανακαινισμένο",
        "furnished": "Επιπλωμένο",
        "floor": f"{floor_label(floor)} (τυπικός για την περιοχή: {floor_label(typical_floor).lower()})",
        "bedrooms": f"{bedrooms} υπνοδωμάτια (τυπικά για {int(sqm)} τ.μ.: {expected_bedrooms})",
        "year_built": f"Έτος κατασκευής {year_built} (τυπικό για την περιοχή: {typical_year})",
        "metro": f"{METRO_WALK_LABEL.get(metro_walk_time, '')} από το {metro_name}",
    }
    reasons = []
    for key, delta in sorted(effects.items(), key=lambda kv: -abs(kv[1])):
        if abs(delta) < MIN_FACTOR_EUR:
            continue
        sign = "+" if delta > 0 else "−"
        reasons.append({"type": "positive" if delta > 0 else "negative",
                        "text": f"{factor_text[key]}: {sign}€{abs(round(delta))}/μήνα"})

    # Πληροφορίες χωρίς επίδραση στην τιμή (type "info").
    if metro_walk_time not in METRO_WALK_DISTANCE_M:
        reasons.append({"type": "info", "text": f"Πλησιέστερος σταθμός: {metro_name} (~{int(suburb_metro_dist)}m από το κέντρο της περιοχής)"})
    if suburb_uni_dist <= 2200:
        reasons.append({"type": "info", "text": f"Κοντά στο {uni_name}"})
    if suburb_park_dist <= 1000:
        reasons.append({"type": "info", "text": f"Κοντά σε χώρους πρασίνου: {park_name}"})
    if suburb_hospital_dist <= 1500:
        reasons.append({"type": "info", "text": f"Κοντά σε νοσοκομείο: {hospital_name}"})
    if parking:
        reasons.append({"type": "info", "text": "Θέση στάθμευσης: δεν επηρεάζει την εκτίμηση, γιατί δεν υπάρχει στα δεδομένα αγγελιών"})

    # AI Vision Reason
    if vision_delta_eur > 0:
        reasons.append({"type": "positive", "text": f"Προσαρμογή AI Vision: +€{int(vision_delta_eur)}/μήνα (άριστη οπτική κατάσταση· εκτίμηση, όχι από τα δεδομένα)"})
    elif vision_delta_eur < 0:
        reasons.append({"type": "negative", "text": f"Προσαρμογή AI Vision: -€{int(abs(vision_delta_eur))}/μήνα (ανάγκη ευπρεπισμού· εκτίμηση, όχι από τα δεδομένα)"})

    safe_metro_dist = int(metro_distance) if metro_walk_time in METRO_WALK_DISTANCE_M else max(250, int(suburb_metro_dist))

    # Χωρίς ζητούμενο ενοίκιο δεν υπάρχει τίποτα να αξιολογηθεί.
    value_score = None
    deal_type = None

    if user_asking is not None and str(user_asking).strip() != "":
        try:
            asking_val = float(user_asking)
            if asking_val > 0:
                diff_percent = ((predicted_price - asking_val) / predicted_price) * 100
                if diff_percent > 12:
                    value_score = 9.3
                    deal_type = "Εξαιρετική Ευκαιρία (Underpriced)"
                elif diff_percent >= -5:
                    value_score = 7.8
                    deal_type = "Δίκαιη Τιμή Αγοράς (Fair Value)"
                else:
                    value_score = 5.0
                    deal_type = "Υπερτιμημένο (Overpriced)"
        except (ValueError, TypeError):
            pass

    safe_uni_dist = max(350, int(suburb_uni_dist))
    safe_hospital_dist = max(400, int(suburb_hospital_dist))
    safe_park_dist = max(250, int(suburb_park_dist))

    return {
        "model_price": round(model_price, 2),
        "price_before_vision": round(base_predicted_price, 2),
        "vision_adjustment_eur": round(vision_delta_eur, 2),
        "estimated_price": round(predicted_price, 2),
        "price_min": price_min,
        "price_max": price_max,
        "price_per_sqm": round(predicted_price / max(1.0, sqm), 2),
        "poi_distances": {
            "metro_m": safe_metro_dist,
            "metro_name": metro_name,
            "uni_m": safe_uni_dist,
            "uni_name": uni_name,
            "hospital_m": safe_hospital_dist,
            "hospital_name": hospital_name,
            "park_m": safe_park_dist,
            "park_name": park_name
        },
        "reasons": reasons,
        "value_score": round(value_score, 1) if value_score is not None else None,
        "deal_type": deal_type,
        "suburb_stats": {
            "avg_price": round(suburb_avg_price, 2),
            "avg_price_per_sqm": round(suburb_avg_sqm_price, 2)
        }
    }

estimate_fair_rent = predict_rent_price