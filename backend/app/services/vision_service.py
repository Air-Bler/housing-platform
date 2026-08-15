import json
import base64
from openai import OpenAI
from backend.app.config import OPENAI_API_KEY

async def analyze_property_photos(suburb: str, sqm: float, estimated_price: float, images: list):
    if not OPENAI_API_KEY:
        return {"error": "Missing API Key"}

    client = OpenAI(api_key=OPENAI_API_KEY)

    image_messages = []
    for img in images:
        contents = await img.read()
        base64_image = base64.b64encode(contents).decode('utf-8')
        image_messages.append({
            "type": "image_url",
            "image_url": {"url": f"data:{img.content_type};base64,{base64_image}"}
        })

    prompt_text = f"""
    Είσαι ένας αυστηρός, πιστοποιημένος εκτιμητής ακινήτων στην Αθήνα.
    Εξετάζεις φωτογραφίες για ακίνητο {sqm} τ.μ. στην περιοχή {suburb}.

    **ΚΑΝΟΝΕΣ ΑΞΙΟΛΟΓΗΣΗΣ:**
    1. **ΓΛΩΣΣΑ:** Απάντησε σε άπταιστα, επαγγελματικά Ελληνικά. ΜΗΝ χρησιμοποιείς περίεργες μεταφράσεις (π.χ. απαγορεύεται η λέξη "δράκο"). Αν ένας χώρος είναι άδειος, γράψε "μη επιπλωμένος".
    2. **ΚΑΤΗΓΟΡΙΟΠΟΙΗΣΗ:**
       - **highlights (Δυνατά Σημεία):** ΜΟΝΟ θετικά στοιχεία (π.χ. διατηρημένο παρκέ, φυσικό φως, άνετοι χώροι). ΑΠΑΓΟΡΕΥΕΤΑΙ να βάλεις ανάγκες ανακαίνισης εδώ.
       - **observations (Σημεία Προσοχής):** Παλαιότητα, ανάγκες ανακαίνισης (π.χ. παλιά κουζίνα, μωσαϊκό δάπεδο, έλλειψη εντοιχιζόμενων συσκευών).
    3. **ΡΕΑΛΙΣΤΙΚΗ ΒΑΘΜΟΛΟΓΙΑ (1-10):**
       - Παλαιά/μη ανακαινισμένη κουζίνα με μωσαϊκό: **4.5 - 5.5 / 10**
       - Μερικώς ανακαινισμένο/προσεγμένο: **6.0 - 7.0 / 10**
       - Πλήρως μοντέρνα ανακαίνιση: **8.0 - 9.5 / 10**

    Απάντησε ΑΠΟΚΛΕΙΣΤΙΚΑ σε έγκυρο JSON:
    {{
      "score": 5,
      "summary": "Το ακίνητο διαθέτει φωτεινούς χώρους με διατηρημένο ξύλινο δάπεδο, ωστόσο η κουζίνα είναι παλαιάς κατασκευής και χρήζει ανακαίνισης.",
      "highlights": [
        "Καλοδιατηρημένο ξύλινο δάπεδο (παρκέ)",
        "Άπλετος φυσικός φωτισμός και ευρύχωρο καθιστικό"
      ],
      "observations": [
        "Παλαιά ντουλάπια και δάπεδο μωσαϊκού στην κουζίνα: Συνιστάται ολική ανακαίνιση κουζίνας"
      ]
    }}
    """

    messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": prompt_text},
                *image_messages
            ]
        }
    ]

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        response_format={"type": "json_object"},
        max_tokens=450
    )

    return json.loads(response.choices[0].message.content)