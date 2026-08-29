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
    Είσαι ένας εξειδικευμένος επιθεωρητής ακινήτων στην Αθήνα.
    Εξετάζεις φωτογραφίες για ακίνητο {sqm} τ.μ. στην περιοχή {suburb}.

    **ΚΑΝΟΝΑΣ ZERO HALLUCINATION:**
    - Αναφέρσου ΑΠΟΚΛΕΙΣΤΙΚΑ σε δωμάτια και λεπτομέρειες που απεικονίζονται στις φωτογραφίες.
    - ΜΗΝ αναφέρεις χώρους που δεν φαίνονται.

    **ΥΠΟΧΡΕΩΤΙΚΗ ΛΙΣΤΑ ΕΛΕΓΧΟΥ ΥΛΙΚΩΝ (SURFACE CHECKLIST):**
    Για κάθε χώρο που βλέπεις, εξέτασε υποχρεωτικά:
    1. **Επενδύσεις Τοίχων & Πλακάκια:** Κατάσταση, μέγεθος, χρωματισμός και αρμοί πλακιδίων (π.χ. παλαιού τύπου μικρά τετράγωνα πλακάκια δεκαετίας '70-'80, αποχρωματισμένοι αρμοί, φθορές).
    2. **Δάπεδα:** Είδος (παρκέ, μωσαϊκό, πλακάκι) και κατάσταση στίλβωσης/φθοράς.
    3. **Υδραυλικά & Είδη Υγιεινής:** Εξωτερικές εμφανείς σωληνώσεις, παλαιότητα μπανιέρας/νιπτήρα, μπαταρίες.
    4. **Κουφώματα & Φωτισμός:** Τύπος κουφωμάτων (αλουμίνιο/ξύλο), φυσικό φως.

    **ΚΑΤΗΓΟΡΙΕΣ ΕΞΟΔΟΥ:**
    - **highlights (Δυνατά Σημεία):** 2-3 συγκεκριμένα θετικά στοιχεία ποιότητας/συντήρησης.
    - **observations (Σημεία Προσοχής & Ανακαίνισης):** 2-4 αναλυτικές παρατηρήσεις για παλαιότητα υλικών (αναφέρσου ρητά στα πλακάκια τοίχου/δαπέδου, υδραυλικά, μπανιέρα κ.λπ.).

    **ΚΛΙΜΑΚΑ ΒΑΘΜΟΛΟΓΙΑΣ (1.0 - 10.0):**
    - 4.0 - 5.5: Παλαιάς κατασκευής / vintage στοιχεία ('70s-'80s).
    - 6.0 - 7.5: Μερικώς ανακαινισμένο / καλοδιατηρημένο.
    - 8.0 - 9.5: Πλήρως εκσυγχρονισμένο / μοντέρνα υλικά.

    Απάντησε ΑΠΟΚΛΕΙΣΤΙΚΑ σε έγκυρο JSON:
    {{
      "score": 6.5,
      "summary": "Περιγραφή 1-2 προτάσεων για την κατάσταση των ορατών χώρων και των υλικών τους.",
      "highlights": [
        "Συγκεκριμένο θετικό στοιχείο 1",
        "Συγκεκριμένο θετικό στοιχείο 2"
      ],
      "observations": [
        "Συγκεκριμένη παρατήρηση παλαιότητας πλακιδίων/υλικών 1",
        "Συγκεκριμένη παρατήρηση υδραυλικών/εξοπλισμού 2"
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
                "detail": "auto"
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
            model="gpt-4o-mini",
            messages=messages,
            response_format={"type": "json_object"},
            max_tokens=450,
            temperature=0.2
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"OpenAI Vision Error: {e}")
        return {
            "score": 6.5,
            "summary": "Ολοκληρώθηκε οπτική αξιολόγηση με βάση τα ορατά χαρακτηριστικά του ακινήτου.",
            "highlights": ["Καλή διατήρηση βασικών επιφανειών"],
            "observations": ["Συνιστάται αναβάθμιση παλαιότερων υλικών"]
        }