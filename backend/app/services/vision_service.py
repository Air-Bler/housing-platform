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
    Είσαι ένας έμπειρος εκτιμητής ακινήτων και σύμβουλος ανακαινίσεων στην Αττική. 
    Εξετάζεις φωτογραφίες για ένα ακίνητο {sqm} τ.μ. στην περιοχή {suburb}.

    **ΑΥΣΤΗΡΟΙ ΚΑΝΟΝΕΣ ΟΡΑΣΗΣ & ΑΝΑΚΑΙΝΙΣΗΣ:**
    1. **ΜΗΝ ΥΠΟΘΕΤΕΙΣ:** Περίγραψε ΑΠΟΚΛΕΙΣΤΙΚΑ ΚΑΙ ΜΟΝΟ όσα βλέπεις καθαρά στις φωτογραφίες.
    2. **ΕΝΤΟΠΙΣΜΟΣ ΠΑΛΑΙΟΤΗΤΑΣ & ΠΡΟΤΑΣΗ ΑΝΑΚΑΙΝΙΣΗΣ:** 
       - Αν διακρίνεις παλιά πλακάκια, παλιά είδη υγιεινής, παλιά ντουλάπια κουζίνας, φθαρμένα δάπεδα ή παλιά κουφώματα, ΕΠΙΣΗΜΑΝΕ ΤΟ και ΠΡΟΤΕΙΝΕ συγκεκριμένη ανακαίνιση (π.χ. "Προτείνεται ανακαίνιση μπάνιου/κουζίνας για αύξηση της μισθωτικής αξίας").
    3. **ΕΛΛΕΙΨΗ ΧΩΡΩΝ:** Αν λείπουν βασικοί χώροι (π.χ. κουζίνα), σημείωσε ότι δεν υπάρχουν διαθέσιμες φωτογραφίες.
    4. **ΒΑΘΜΟΛΟΓΙΑ (1-10):** Δώσε βαθμό βάσει της πραγματικής εικόνας (π.χ. παλιό μη ανακαινισμένο: 4-5, μερικώς ανακαινισμένο: 6-7, πλήρως ανακαινισμένο: 8-10).

    Απάντησε ΑΠΟΚΛΕΙΣΤΙΚΑ σε έγκυρο JSON format:
    {{
      "score": 6,
      "summary": "Σύντομη σύνοψη 1-2 προτάσεων για την κατάσταση ΜΟΝΟ των χώρων που απεικονίζονται.",
      "highlights": [
        "Δυνατό σημείο 1 (π.χ. Καλή διαρρύθμιση και φυσικό φως)"
      ],
      "observations": [
        "Σημείο προσοχής / Πρόταση ανακαίνισης (π.χ. 'Παλαιά είδη υγιεινής & πλακάκια: Συνιστάται ανακαίνιση μπάνιου για αναβάθμιση του ακινήτου')"
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