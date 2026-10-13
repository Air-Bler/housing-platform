from datetime import date

import pytest

from backend.app.api import predict as predict_api

VALID = {
    "suburb": "Κυψέλη", "sqm": 70, "bedrooms": 2, "bathrooms": 1, "floor": 2, "year_built": 1990,
    "metro_walk_time": "auto", "elevator": True,
}


def test_valid_request_returns_estimate(client):
    r = client.post("/api/predict", json=VALID)
    assert r.status_code == 200
    assert r.json()["estimated_price"] > 0


@pytest.mark.parametrize("field,value", [
    ("sqm", -50), ("sqm", 0), ("sqm", 5), ("sqm", 1001),
    ("bedrooms", -1), ("bedrooms", 16),
    ("bathrooms", 0), ("bathrooms", 11),
    ("floor", -3), ("floor", 41),
    ("year_built", 1849), ("year_built", date.today().year + 1),
    ("vision_score", 0), ("vision_score", 10.5), ("vision_score", -2),
    ("user_asking_price", 0), ("user_asking_price", -400),
    ("metro_walk_time", "5 λεπτά"),
    ("suburb", ""), ("suburb", "   "),
])
def test_out_of_range_values_are_rejected(client, field, value):
    r = client.post("/api/predict", json={**VALID, field: value})
    assert r.status_code == 422
    err = r.json()["error"]
    assert err["code"] == "INVALID_INPUT"
    assert any(d["field"] == field for d in err["details"])


@pytest.mark.parametrize("field,value", [
    ("sqm", 5.5), ("sqm", 1000), ("bedrooms", 0), ("floor", -2), ("floor", 0),
    ("year_built", 1850), ("year_built", date.today().year), ("vision_score", 1), ("vision_score", 10),
])
def test_boundary_values_are_accepted(client, field, value):
    assert client.post("/api/predict", json={**VALID, field: value}).status_code == 200


def test_unknown_fields_are_rejected(client):
    r = client.post("/api/predict", json={**VALID, "sqmm": 70})
    assert r.status_code == 422


def test_missing_required_field(client):
    body = dict(VALID)
    del body["sqm"]
    r = client.post("/api/predict", json=body)
    assert r.status_code == 422
    assert r.json()["error"]["details"][0]["field"] == "sqm"


def test_internal_error_does_not_leak_details(client, monkeypatch):
    def boom(_):
        raise RuntimeError("C:\\secret\\path\\model.pkl is corrupted")

    monkeypatch.setattr(predict_api, "predict_rent_price", boom)
    r = client.post("/api/predict", json=VALID, headers={"Origin": "http://localhost:3000"})
    assert r.status_code == 500
    body = r.json()
    assert body["error"]["code"] == "INTERNAL_ERROR"
    assert "secret" not in r.text and "RuntimeError" not in r.text
    assert body["error"]["request_id"]
    # Το σφάλμα πρέπει να φτάνει στο frontend, όχι να εμφανίζεται ως CORS error.
    assert r.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_unknown_route_uses_error_envelope(client):
    r = client.get("/api/does-not-exist")
    assert r.status_code == 404
    assert r.json()["error"]["code"] == "NOT_FOUND"
