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
    Είσαι ένας έμπειρος εκτιμητής ακινήτων στην Αττική.
    Το αλγοριθμικό μας Machine Learning μοντέλο υπολόγισε τη βασική αντικειμενική τιμή ενοικίου στα **€{estimated_price}/μήνα** για ένα ακίνητο {sqm} τ.μ. στην περιοχή {suburb}.

    **ΑΥΣΤΗΡΕΣ ΟΔΗΓΙΕΣ ΟΠΤΙΚΗΣ ΑΝΑΛΥΣΗΣ:**
    1. Εξέτασε ΠΡΟΣΕΚΤΙΚΑ ΜΟΝΟ τους χώρους που εμφανίζονται στις παρεχόμενες φωτογραφίες.
    2. ΑΝ ΚΑΠΟΙΟΣ ΧΩΡΟΣ (π.χ. Μπάνιο, Κουζίνα, Μπαλκόνι) ΔΕΝ ΕΜΦΑΝΙΖΕΤΑΙ στις εικόνες, αναφέρε το ρητά στη λεπτομέρεια (π.χ. "Δεν παρέχεται φωτογραφία μπάνιου") και βάλε impact_euro: 0. ΜΗΝ επινόησες ή υποθέτεις κατάσταση για χώρους που δεν βλέπεις.
    3. Υπολόγισε την οπτική βαθμολογία (1 έως 10) και την επίδραση σε € αποκλειστικά από όσα πραγματικά διακρίνονται (π.χ. κατάσταση δαπέδων, κουζίνας, φωτεινότητα, έπιπλα).
    4. Η συνολική προσαρμογή πρέπει να κυμαίνεται μεταξύ -15% και +15%.

    Απάντησε ΑΠΟΚΛΕΙΣΤΙΚΑ σε έγκυρο JSON format με τη δομή:
    {{
      "score": 7.5,
      "summary_quote": "Σύντομη ετυμηγορία 1 πρότασης βάσει των χώρων που διακρίνονται στις εικόνες",
      "breakdown": [
        {{
          "category": "Σαλόνι & Φωτεινότητα",
          "details": "Περιγραφή των χώρων που φαίνονται",
          "impact_euro": 15
        }},
        {{
          "category": "Κουζίνα",
          "details": "Περιγραφή κουζίνας ή δήλωση ότι δεν εμφανίζεται στις εικόνες",
          "impact_euro": 0
        }},
        {{
          "category": "Μπάνιο",
          "details": "Περιγραφή μπάνιου ή 'Δεν παρέχεται φωτογραφία μπάνιου'",
          "impact_euro": 0
        }},
        {{
          "category": "Δάπεδα & Κουφώματα",
          "details": "Κατάσταση δαπέδων/παραθύρων που διακρίνονται",
          "impact_euro": -10
        }}
      ],
      "total_adjustment_euro": 5,
      "adjusted_price": {round(estimated_price + 5, 2)}
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
        max_tokens=650
    )

    return json.loads(response.choices[0].message.content)