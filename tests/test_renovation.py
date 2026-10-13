import json

from tests.conftest import VALID_RENOVATION, chat_completion, make_image

FORM = {
    "suburb": "Κυψέλη", "sqm": "70", "bedrooms": "2", "bathrooms": "1", "floor": "2",
    "year_built": "1975", "condition": "light", "tax_rate": "0.15",
}


def photos(n=1, data=None):
    data = data if data is not None else make_image()
    return [("images", (f"{i}.jpg", data, "image/jpeg")) for i in range(n)]


def test_without_photos_vision_is_null(client):
    r = client.post("/api/renovation-roi", data=FORM)
    assert r.status_code == 200
    body = r.json()
    assert body["vision"] is None
    assert body["condition"] == "light"


def test_with_photos_uses_validated_analysis(client, provider):
    provider.reply_json(VALID_RENOVATION)
    r = client.post("/api/renovation-roi", data=FORM, files=photos())
    assert r.status_code == 200
    body = r.json()
    assert body["vision"]["status"] == "completed"
    assert body["vision"]["analysis"]["condition_score"] == 4.0
    assert body["condition"] == "heavy"
    assert body["as_is"]["vision_score"] == 4.0
    assert {"insulation", "bathroom"} <= {n["key"] for n in body["detected_needs"]}


def test_provider_failure_is_reported_not_hidden(client, provider):
    provider.reply((500, {"error": {"message": "boom"}}))
    r = client.post("/api/renovation-roi", data=FORM, files=photos())
    assert r.status_code == 200
    body = r.json()
    assert body["vision"] == {"status": "failed", "error": {
        "code": "VISION_PROVIDER_ERROR", "message": body["vision"]["error"]["message"]}}
    # Η εκτίμηση βασίζεται στη δηλωμένη κατάσταση, όχι σε κάποια επινοημένη διάγνωση.
    assert body["condition"] == "light"


def test_invalid_analysis_is_reported_as_failure(client, provider):
    provider.reply((200, chat_completion(json.dumps({**VALID_RENOVATION, "needed_works": ["jacuzzi"]}))))
    body = client.post("/api/renovation-roi", data=FORM, files=photos()).json()
    assert body["vision"]["status"] == "failed"
    assert body["vision"]["error"]["code"] == "VISION_INVALID_RESPONSE"
    assert body["condition"] == "light"


def test_invalid_photo_rejects_request(client, provider):
    provider.reply_json(VALID_RENOVATION)
    r = client.post("/api/renovation-roi", data=FORM, files=photos(data=b"not an image"))
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "IMAGE_INVALID"
    assert provider.calls == 0


def test_invalid_numbers_are_rejected(client):
    for field, value in [("sqm", "-10"), ("year_built", "3000"), ("tax_rate", "2"), ("budget", "-5"),
                         ("condition", "ruined"), ("bathrooms", "0")]:
        r = client.post("/api/renovation-roi", data={**FORM, field: value})
        assert r.status_code == 422, (field, r.text)
        assert r.json()["error"]["details"][0]["field"] == field


def test_zero_tax_rate_is_respected(client):
    body = client.post("/api/renovation-roi", data={**FORM, "tax_rate": "0"}).json()
    assert body["assumptions"]["tax_rate_pct"] == 0
