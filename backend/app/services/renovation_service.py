import json
import base64
from openai import OpenAI
from backend.app.config import OPENAI_API_KEY
from backend.app.services.ml_service import predict_rent_price, df



WORK_ITEMS = {
    "painting":      {"label": "Βαψίματα τοίχων & ταβανιών",                 "unit": "sqm",      "cost": 12,   "finish": True},
    "minor_repairs": {"label": "Μικροεπισκευές, σοβατίσματα & καθαρισμός",   "unit": "sqm",      "cost": 10,   "finish": False},
    "lighting":      {"label": "Φωτιστικά, διακόπτες & πρίζες",               "unit": "sqm",      "cost": 8,    "finish": True},
    "floors":        {"label": "Δάπεδα (laminate / πλακάκι / γυάλισμα)",      "unit": "sqm",      "cost": 38,   "finish": True},
    "doors":         {"label": "Εσωτερικές πόρτες",                           "unit": "door",     "cost": 280,  "finish": True},
    "kitchen":       {"label": "Κουζίνα (ντουλάπια, πάγκος, συσκευές)",       "unit": "fixed",    "cost": 5500, "finish": True},
    "bathroom":      {"label": "Μπάνιο (πλακάκια, είδη υγιεινής, ντουζιέρα)", "unit": "bathroom", "cost": 5000, "finish": True},
    "windows":       {"label": "Κουφώματα αλουμινίου με διπλά τζάμια",        "unit": "sqm",      "cost": 55,   "finish": True},
    "electrical":    {"label": "Νέα ηλεκτρολογική εγκατάσταση",               "unit": "sqm",      "cost": 35,   "finish": False},
    "plumbing":      {"label": "Νέα υδραυλική εγκατάσταση",                   "unit": "sqm",      "cost": 28,   "finish": False},
    "insulation":    {"label": "Θερμομόνωση & αντιμετώπιση υγρασίας",         "unit": "sqm",      "cost": 30,   "finish": False},
    "ac":            {"label": "Κλιματιστικά inverter",                       "unit": "room",     "cost": 850,  "finish": False},
    "furnishing":    {"label": "Επίπλωση & ηλεκτρικές συσκευές",              "unit": "sqm",      "cost": 90,   "finish": False},
}


CRITICAL_WORKS = ["electrical", "plumbing", "insulation"]

SCENARIOS = [
    {
        "key": "refresh",
        "name": "Στοχευμένες Επεμβάσεις",
        "tagline": "Φρεσκάρισμα + μόνο ό,τι χρειάζεται για να νοικιαστεί άμεσα",
        "works": ["painting", "minor_repairs", "lighting"],
        "optional_if_needed": ["floors", "doors", "kitchen", "bathroom", "windows", "ac"],
        "finish_mult": 1.0,
        "furnished": False,
        "duration_weeks": 4,
    },
    {
        "key": "full",
        "name": "Πλήρης Ανακαίνιση",
        "tagline": "Ριζική ανακαίνιση με νέα κουζίνα, μπάνιο και δάπεδα",
        "works": ["painting", "minor_repairs", "lighting", "floors", "doors", "kitchen", "bathroom"],
        "optional_if_needed": ["windows"],
        "finish_mult": 1.0,
        "furnished": False,
        "duration_weeks": 10,
    },
    {
        "key": "premium",
        "name": "Premium & Επιπλωμένο",
        "tagline": "Υψηλές προδιαγραφές, επίπλωση, έτοιμο για απαιτητικούς ενοικιαστές",
        "works": ["painting", "minor_repairs", "lighting", "floors", "doors", "kitchen", "bathroom",
                  "windows", "ac", "furnishing"],
        "optional_if_needed": [],
        "finish_mult": 1.4,
        "furnished": True,
        "duration_weeks": 14,
    },
]

# Αρχική κατάσταση 
CONDITION_PROFILES = {
    "light":  {"label": "Χρειάζεται φρεσκάρισμα",     "vision_score": 6.3, "after_refresh": 7.0,
               "needs": set()},
    "medium": {"label": "Εμφανείς φθορές",            "vision_score": 5.0, "after_refresh": 6.8,
               "needs": {"windows", "floors"}},
    "heavy":  {"label": "Χρήζει ριζικής ανακαίνισης", "vision_score": 3.8, "after_refresh": 6.3,
               "needs": {"windows", "floors", "kitchen", "bathroom", "electrical", "plumbing", "insulation"}},
}

CONTINGENCY_RATE = 0.10      
VACANCY_RATE = 1 / 12        
MAINTENANCE_RATE = 0.05      
TAX_DEDUCTION_RATE = 0.05    
RENT_GROWTH = 0.03          
PROJECTION_YEARS = 10
GROSS_YIELD = 0.055          
PREMIUM_FINISH_UPLIFT = 1.05 
RECOMMENDATION_TOLERANCE = 0.08
SUBSIDY_RATE = 0.40
SUBSIDY_CAP = 10000


def _market_premium(column, fallback, cap):
    """Διάμεσος λόγος €/τ.μ. (με / χωρίς χαρακτηριστικό) σε κτίρια πριν το 1990."""
    try:
        old = df[df["year_built"] < 1990]
        ratio = (old[old[column] == 1]["price_per_sqm"].median()
                 / old[old[column] == 0]["price_per_sqm"].median())
        return round(max(1.0, min(cap, float(ratio))), 3)
    except Exception:
        return fallback



RENOVATION_PREMIUM = _market_premium("renovated", fallback=1.15, cap=1.25)
FURNISHED_PREMIUM = _market_premium("furnished", fallback=1.12, cap=1.15)


def _condition_mult(score):
    """Επίδραση της κατάστασης στο ενοίκιο μη ανακαινισμένου ακινήτου (6.0 = τυπική αγγελία)."""
    if score < 6.0:
        return max(0.75, 1 - (6.0 - score) * 0.07)
    return 1 + min(score - 6.0, 1.5) * 0.03


def _item_cost(key, sqm, bedrooms, bathrooms, finish_mult):
    item = WORK_ITEMS[key]
    unit = item["unit"]
    if unit == "sqm":
        qty = sqm
    elif unit == "bathroom":
        qty = max(1, bathrooms)
    elif unit == "door":
        qty = max(2, bedrooms + bathrooms + 2)
    elif unit == "room":
        qty = max(1, bedrooms + 1)
    else:
        qty = 1
    mult = finish_mult if item["finish"] else 1.0
    return round(item["cost"] * qty * mult)


def _payback_years(net_cost, annual_net):
    """Χρόνια απόσβεσης με ετήσια αύξηση ενοικίου (κλασματικά)."""
    if annual_net <= 0:
        return None
    if net_cost <= 0:
        return 0.0
    remaining = net_cost
    year = 0
    income = annual_net
    while year < 50:
        if income >= remaining:
            return round(year + remaining / income, 1)
        remaining -= income
        income *= 1 + RENT_GROWTH
        year += 1
    return None


def compute_renovation_roi(data, vision=None):
    sqm = float(data["sqm"])
    bedrooms = int(data["bedrooms"])
    bathrooms = int(data["bathrooms"])
    year_built = int(data["year_built"])
    condition = data.get("condition") or "medium"
    if condition not in CONDITION_PROFILES:
        condition = "medium"
    profile = CONDITION_PROFILES[condition]

    budget = data.get("budget")
    years_vacant = data.get("years_vacant")
    tax_rate = float(data.get("tax_rate") or 0.15)
    use_subsidy = bool(data.get("use_subsidy"))

    
    has_vision = bool(vision) and not vision.get("error")
    if has_vision and isinstance(vision.get("needed_works"), list):
        needs = {w for w in vision["needed_works"] if w in WORK_ITEMS}
        current_vision = float(vision.get("condition_score", profile["vision_score"]))
    else:
        needs = set(profile["needs"])
        current_vision = profile["vision_score"]

    
    if year_built < 1980 and condition != "light":
        needs |= {"electrical", "plumbing"}

    base = {
        "suburb": data["suburb"],
        "sqm": sqm,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "floor": int(data["floor"]),
        "year_built": year_built,
        "metro_walk_time": data.get("metro_walk_time") or "auto",
        "elevator": bool(data.get("elevator")),
        "parking": bool(data.get("parking")),
    }

    
    market = predict_rent_price(dict(base, renovated=False, furnished=False))
    market_rent = market["estimated_price"]
    band = (market["price_max"] - market["price_min"]) / 2 / max(1.0, market_rent)

    as_is_rent = market_rent * _condition_mult(current_vision)
    rentable_as_is = condition != "heavy" and current_vision > 4.5
    after_refresh = max(current_vision, profile["after_refresh"])
    scenario_mult = {
        "refresh": _condition_mult(after_refresh),
        "full": RENOVATION_PREMIUM,
        "premium": RENOVATION_PREMIUM * PREMIUM_FINISH_UPLIFT * FURNISHED_PREMIUM,
    }

    scenarios = []
    for sc in SCENARIOS:
        keys = list(sc["works"])
        keys += [k for k in sc["optional_if_needed"] if k in needs]
        keys += [k for k in CRITICAL_WORKS if k in needs and k not in keys]

        items = [
            {"key": k, "label": WORK_ITEMS[k]["label"],
             "cost": _item_cost(k, sqm, bedrooms, bathrooms, sc["finish_mult"]),
             "critical": k in CRITICAL_WORKS}
            for k in keys
        ]
        subtotal = sum(i["cost"] for i in items)
        contingency = round(subtotal * CONTINGENCY_RATE)
        gross_cost = subtotal + contingency
        subsidy = round(min(gross_cost * SUBSIDY_RATE, SUBSIDY_CAP)) if use_subsidy else 0
        net_cost = gross_cost - subsidy

        rent = market_rent * scenario_mult[sc["key"]]

        annual_gross = rent * 12 * (1 - VACANCY_RATE)
        maintenance = annual_gross * MAINTENANCE_RATE
        tax = annual_gross * (1 - TAX_DEDUCTION_RATE) * tax_rate
        annual_net = annual_gross - maintenance - tax

        cumulative = [-net_cost]
        income = annual_net
        for _ in range(PROJECTION_YEARS):
            cumulative.append(cumulative[-1] + income)
            income *= 1 + RENT_GROWTH

        total_net_10y = cumulative[-1] + net_cost
     
        unfurnished_rent = rent / FURNISHED_PREMIUM if sc["furnished"] else rent
        value_uplift = max(0.0, (unfurnished_rent - as_is_rent) * 12 / GROSS_YIELD)

        scenarios.append({
            "key": sc["key"],
            "name": sc["name"],
            "tagline": sc["tagline"],
            "duration_weeks": sc["duration_weeks"],
            "furnished": sc["furnished"],
            "items": items,
            "subtotal": subtotal,
            "contingency": contingency,
            "gross_cost": gross_cost,
            "subsidy": subsidy,
            "net_cost": net_cost,
            "cost_per_sqm": round(gross_cost / max(1.0, sqm)),
            "monthly_rent": round(rent),
            "rent_min": round(rent * (1 - band)),
            "rent_max": round(rent * (1 + band)),
            "rent_uplift_vs_as_is": round(rent - as_is_rent),
            "annual_gross": round(annual_gross),
            "annual_expenses": round(maintenance + tax),
            "annual_net": round(annual_net),
            "monthly_net": round(annual_net / 12),
            "payback_years": _payback_years(net_cost, annual_net),
            "annual_roi_pct": round(annual_net / net_cost * 100, 1) if net_cost > 0 else None,
            "roi_10y_pct": round((total_net_10y - net_cost) / net_cost * 100) if net_cost > 0 else None,
            "profit_10y": round(cumulative[-1]),
            "value_uplift": round(value_uplift, -2),
            "total_benefit_10y": round(cumulative[-1] + value_uplift),
            "cumulative_cashflow": [round(v) for v in cumulative],
            "within_budget": budget is None or gross_cost <= budget,
        })

    # Πρόταση: μεγαλύτερο συνολικό όφελος 10ετίας (καθαρά έσοδα + αύξηση αξίας) εντός προϋπολογισμού.
    # Όταν η διαφορά είναι μικρή, προτιμάται το σενάριο με το μικρότερο κεφάλαιο σε κίνδυνο.
    candidates = [s for s in scenarios if s["within_budget"]] or scenarios
    top_benefit = max(s["total_benefit_10y"] for s in candidates)
    close = [s for s in candidates if s["total_benefit_10y"] >= top_benefit * (1 - RECOMMENDATION_TOLERANCE)]
    best = min(close, key=lambda s: s["net_cost"])
    for s in scenarios:
        s["recommended"] = s["key"] == best["key"]

    # Κόστος αδράνειας: τι χάνει ο ιδιοκτήτης κάθε μήνα που το ακίνητο μένει κλειστό
    
    baseline = scenarios[0]
    inaction = {
        "monthly_lost": baseline["monthly_net"],
        "yearly_lost": baseline["annual_net"],
        "years_vacant": years_vacant,
        "lost_so_far": round(baseline["annual_net"] * years_vacant) if years_vacant else None,
    }

    return {
        "condition": condition,
        "condition_label": profile["label"],
        "detected_needs": [{"key": k, "label": WORK_ITEMS[k]["label"]} for k in sorted(needs)],
        "as_is": {
            "monthly_rent": round(as_is_rent),
            "rentable": rentable_as_is,
            "vision_score": round(current_vision, 1),
        },
        "scenarios": scenarios,
        "recommended_key": best["key"],
        "inaction": inaction,
        "assumptions": {
            "contingency_pct": round(CONTINGENCY_RATE * 100),
            "vacancy_months": 1,
            "maintenance_pct": round(MAINTENANCE_RATE * 100),
            "tax_rate_pct": round(tax_rate * 100),
            "rent_growth_pct": round(RENT_GROWTH * 100),
            "gross_yield_pct": round(GROSS_YIELD * 100, 1),
            "renovation_premium_pct": round((RENOVATION_PREMIUM - 1) * 100),
            "furnished_premium_pct": round((FURNISHED_PREMIUM - 1) * 100),
            "subsidy": {"enabled": use_subsidy, "rate_pct": round(SUBSIDY_RATE * 100), "cap": SUBSIDY_CAP},
        },
        "suburb_stats": market.get("suburb_stats"),
    }


async def analyze_renovation_photos(suburb: str, sqm: float, year_built: int, images: list):
    if not OPENAI_API_KEY:
        return {"error": "Missing API Key"}

    client = OpenAI(api_key=OPENAI_API_KEY)
    work_keys = "\n".join(f'    - "{k}": {v["label"]}' for k, v in WORK_ITEMS.items() if k != "furnishing")

    prompt_text = f"""
    Είσαι έμπειρος μηχανικός και εκτιμητής κόστους ανακαινίσεων στην Αθήνα.
    Ο ιδιοκτήτης έχει ένα κλειστό / παρατημένο ακίνητο {sqm} τ.μ. στην περιοχή {suburb}, έτος κατασκευής {year_built},
    και θέλει να το ανακαινίσει για να το νοικιάσει.

    **ΚΑΝΟΝΕΣ (STRICT VISUAL GROUNDING):**
    1. Αναφέρσου ΑΠΟΚΛΕΙΣΤΙΚΑ σε ό,τι φαίνεται καθαρά στις φωτογραφίες.
    2. ΜΗΝ εφευρίσκεις προβλήματα σε χώρους που δεν απεικονίζονται.
    3. Υγρασία, μούχλα, ρωγμές, σκουριά, παλιοί πίνακες ρεύματος είναι κρίσιμα ευρήματα — ανέφερέ τα αν φαίνονται.

    **condition_score (1.0 - 10.0):**
    - < 4.5: χρήζει ριζικής ανακαίνισης, δεν νοικιάζεται ως έχει
    - 4.5 - 6.0: εμφανείς φθορές, παλιά κουφώματα/δάπεδα/κουζίνα
    - 6.0 - 7.5: κατοικήσιμο, θέλει φρεσκάρισμα
    - > 7.5: καλή κατάσταση

    **condition_level:** "light" (θέλει φρεσκάρισμα), "medium" (εμφανείς φθορές), "heavy" (ριζική ανακαίνιση).

    **needed_works:** λίστα ΜΟΝΟ με κλειδιά από την παρακάτω λίστα, για εργασίες που φαίνεται ότι χρειάζονται:
{work_keys}

    **detected_issues:** 2-4 συγκεκριμένα ορατά προβλήματα.
    **strengths:** 1-3 στοιχεία που αξίζει να διατηρηθούν (π.χ. μωσαϊκό που γυαλίζεται, ξύλινα πατώματα, φωτεινότητα, ψηλά ταβάνια).
    **quick_wins:** 2-3 φθηνές παρεμβάσεις με τη μεγαλύτερη επίδραση στο ενοίκιο.

    Απάντησε ΑΠΟΚΛΕΙΣΤΙΚΑ σε έγκυρο JSON:
    {{
      "condition_score": 5.2,
      "condition_level": "medium",
      "summary": "1-2 προτάσεις για τη γενική κατάσταση.",
      "detected_issues": ["..."],
      "strengths": ["..."],
      "needed_works": ["painting", "floors"],
      "quick_wins": ["..."]
    }}
    """

    content_parts = [{"type": "text", "text": prompt_text}]
    for img in images:
        contents = await img.read()
        mime_type = img.content_type if img.content_type else "image/jpeg"
        base64_image = base64.b64encode(contents).decode('utf-8')
        content_parts.append({
            "type": "image_url",
            "image_url": {"url": f"data:{mime_type};base64,{base64_image}", "detail": "high"}
        })

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": content_parts}],
            response_format={"type": "json_object"},
            max_tokens=700,
            temperature=0.1
        )
        result = json.loads(response.choices[0].message.content)
        if result.get("condition_level") not in CONDITION_PROFILES:
            result["condition_level"] = None
        return result
    except Exception as e:
        print(f"OpenAI Renovation Vision Error: {e}")
        return {"error": "Η ανάλυση φωτογραφιών δεν ολοκληρώθηκε."}
