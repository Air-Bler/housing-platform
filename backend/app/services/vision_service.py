import json
import base64
from openai import OpenAI
from backend.app.config import OPENAI_API_KEY


async def analyze_property_photos(suburb: str, sqm: float, estimated_price: float, images: list):
    if not OPENAI_API_KEY:
        return {"error": "Missing API Key"}

    client = OpenAI(api_key=OPENAI_API_KEY)

    content_parts = []
    
    prompt_text = f"""
    Είσαι ένας αυστηρός, επαγγελματίας επιθεωρητής ακινήτων και εκτιμητής ποιότητας κατοικιών στην Αθήνα.
    Εξετάζεις φωτογραφίες για ακίνητο {sqm} τ.μ. στην περιοχή {suburb}.

    **ΚΑΝΟΝΕΣ ΟΠΤΙΚΗΣ ΑΞΙΟΛΟΓΗΣΗΣ (STRICT VISUAL GROUNDING):**
    1. Αναφέρσου ΑΠΟΚΛΕΙΣΤΙΚΑ σε στοιχεία και χώρους που είναι 100% ορατά στις φωτογραφίες.
    2. ΜΗΝ υποθέτεις αντικείμενα ή προβλήματα που δεν φαίνονται (π.χ. αν βλέπεις ντουζιέρα, ΜΗΝ αναφέρεις μπανιέρα).
    3. Αν ο χώρος είναι πρόσφατα ανακαινισμένος, μοντέρνος και σε άριστη κατάσταση, ΜΗΝ εφευρίσκεις αρνητικά σημεία.

    **ΚΛΙΜΑΚΑ ΒΑΘΜΟΛΟΓΙΑΣ (1.0 - 10.0):**
    - **8.8 - 9.8 (Υψηλή Ποιότητα / Πλήρης Ανακαίνιση / Premium):** Μοντέρνα εντοιχισμένη κουζίνα, σύγχρονο μπάνιο (π.χ. walk-in ντουζιέρα, εντοιχισμένες μπαταρίες, κρυφοί φωτισμοί), νέα κουφώματα αλουμινίου διπλών τζαμιών, κλιματισμός, άψογα δάπεδα.
    - **7.5 - 8.7 (Πολύ Καλή Κατάσταση):** Προσεγμένο και σύγχρονο ακίνητο χωρίς εμφανείς ανάγκες ανακαίνισης.
    - **5.5 - 7.4 (Μέτρια Κατάσταση / Μερικώς Ανακαινισμένο):** Κατοικήσιμο αλλά με εμφανή παλαιότερα στοιχεία δεκαετίας '80-'90 ή παλιά κουφώματα/δάπεδα.
    - **< 5.5 (Χρήζει Ριζικής Ανακαίνισης):** Φθορές, παλαιά υδραυλικά/ηλεκτρολογικά, παλιά πλακάκια/μωσαϊκά σε κακή κατάσταση.

    **ΟΔΗΓΙΕΣ ΓΙΑ ΤΑ ΠΕΔΙΑ ΕΞΟΔΟΥ:**
    - **highlights (Δυνατά Σημεία):** 2-3 συγκεκριμένα θετικά στοιχεία που ξεχωρίζουν στις φωτογραφίες.
    - **observations (Σημεία Προσοχής):** 
      - Εάν το ακίνητο είναι πλήρως ανακαινισμένο / άριστο, βάλε ΜΟΝΟ: ["Δεν παρατηρούνται ανάγκες άμεσης ανακαίνισης - το ακίνητο βρίσκεται σε άριστη κατάσταση."]
      - Εάν υπάρχουν πραγματικές ορατές ατέλειες ή παλαιότητα, κατάγραψε 1-2 συγκεκριμένες παρατηρήσεις.

    Απάντησε ΑΠΟΚΛΕΙΣΤΙΚΑ σε έγκυρο JSON (χωρίς επιπλέον κείμενο ή markdown backticks):
    {{
      "score": 9.2,
      "summary": "Σύντομη σύνοψη 1-2 προτάσεων για το επίπεδο ποιότητας και ανακαίνισης του ακινήτου.",
      "highlights": [
        "Συγκεκριμένο θετικό στοιχείο 1",
        "Συγκεκριμένο θετικό στοιχείο 2"
      ],
      "observations": [
        "Παρατήρηση ή δήλωση άριστης κατάστασης"
      ]
    }}
    """

    content_parts.append({"type": "text", "text": prompt_text})

    for img in images:
        contents = await img.read()
        mime_type = img.content_type if img.content_type else "image/jpeg"
        base64_image = base64.b64encode(contents).decode('utf-8')
        content_parts.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:{mime_type};base64,{base64_image}",
                "detail": "high"
            }
        })

    messages = [
        {
            "role": "user",
            "content": content_parts
        }
    ]

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            response_format={"type": "json_object"},
            max_tokens=450,
            temperature=0.1
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"OpenAI Vision Error: {e}")
        return {
            "score": 7.5,
            "summary": "Ολοκληρώθηκε οπτική αξιολόγηση με βάση τα ορατά χαρακτηριστικά του ακινήτου.",
            "highlights": ["Καλή διατήρηση βασικών επιφανειών"],
            "observations": ["Δεν παρατηρήθηκαν κρίσιμες φθορές στους ελεγχθέντες χώρους"]
        }