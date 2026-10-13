import pytest

from backend.app.services import ml_service
from tests.test_predict_validation import VALID


def test_suburb_reaches_the_model_in_training_format(monkeypatch):
    seen = {}
    real_predict = ml_service.model.predict

    def spy(X):
        seen["suburb"], seen["area"] = X["suburb"].iloc[0], X["area"].iloc[0]
        return real_predict(X)

    monkeypatch.setattr(ml_service.model, "predict", spy)
    ml_service.predict_rent_price(VALID)
    model_suburbs = set(ml_service.df["suburb"])
    assert seen["suburb"] in model_suburbs and seen["suburb"].startswith("Κυψέλη")
    assert seen["area"] in set(ml_service.df.loc[ml_service.df["suburb"] == seen["suburb"], "area"])


def test_unknown_suburb_is_rejected(client):
    r = client.post("/api/predict", json={**VALID, "suburb": "Ατλαντίδα"})
    assert r.status_code == 422
    err = r.json()["error"]
    assert err["code"] == "UNKNOWN_SUBURB"
    assert err["details"][0]["field"] == "suburb"


def test_every_listed_suburb_can_be_estimated(client):
    for name in client.get("/api/suburbs").json()["suburbs"]:
        assert client.post("/api/predict", json={**VALID, "suburb": name}).status_code == 200, name


def test_kentro_does_not_match_every_central_listing():
    rows = ml_service.SUBURB_INDEX["κέντρο"]["rows"]
    assert set(rows["suburb"].map(ml_service.clean_suburb_name)) == {"Κέντρο"}


def test_no_deal_score_without_asking_price(client):
    body = client.post("/api/predict", json=VALID).json()
    assert body["value_score"] is None and body["deal_type"] is None
    body = client.post("/api/predict", json={**VALID, "user_asking_price": 400}).json()
    assert body["value_score"] is not None and body["deal_type"]


def test_price_range_uses_measured_error(client):
    body = client.post("/api/predict", json=VALID).json()
    mape = ml_service.METRICS["end_to_end"]["mape"]
    half_width = (body["price_max"] - body["price_min"]) / 2
    assert half_width == pytest.approx(max(60.0, body["estimated_price"] * mape), abs=0.02)


def test_model_stats_are_held_out_metrics(client):
    stats = client.get("/api/model-stats").json()
    m = ml_service.METRICS
    assert stats == {
        "dataset_size": len(ml_service.df), "test_size": m["test_rows"], "r2": m["end_to_end"]["r2"],
        "mae": m["end_to_end"]["mae"], "mape_pct": round(m["end_to_end"]["mape"] * 100, 1),
    }


def test_aliases_without_coordinates_sit_on_their_parent(client):
    stats = {s["name"]: s for s in client.get("/api/suburbs-stats").json()["suburbs"]}
    plaka, parent = stats["Πλάκα"], stats["Ιστορικό Κέντρο"]
    assert (plaka["lat"], plaka["lon"]) == (parent["lat"], parent["lon"])


@pytest.mark.parametrize("attr,value", [("model", None), ("METRICS", None)])
def test_startup_fails_without_required_files(monkeypatch, attr, value):
    monkeypatch.setattr(ml_service, attr, value)
    with pytest.raises(RuntimeError, match="Λείπουν"):
        ml_service.check_ready()


def test_startup_fails_without_data(monkeypatch):
    import pandas as pd
    monkeypatch.setattr(ml_service, "df", pd.DataFrame())
    with pytest.raises(RuntimeError, match="δεδομένα"):
        ml_service.check_ready()


def spy_model(monkeypatch):
    calls = []
    real_predict = ml_service.model.predict

    def spy(X):
        calls.append(X.copy())
        return real_predict(X)

    monkeypatch.setattr(ml_service.model, "predict", spy)
    return calls


@pytest.mark.parametrize("floor,code", [(-2, 1), (-1, 1), (0, 3), (1, 6), (2, 7), (8, 13)])
def test_floor_is_sent_in_the_data_encoding(monkeypatch, floor, code):
    calls = spy_model(monkeypatch)
    ml_service.predict_rent_price({**VALID, "floor": floor})
    assert calls[0]["floor"].iloc[0] == code


def test_floor_codes_round_trip():
    for floor in [-1, 0, 1, 5, 19]:
        assert ml_service.decode_floor(ml_service.encode_floor(floor)) == floor
    assert ml_service.decode_floor(0) is None


def test_metro_walk_time_feeds_the_model(monkeypatch):
    calls = spy_model(monkeypatch)
    ml_service.predict_rent_price({**VALID, "metro_walk_time": "under_5"})
    assert calls[0]["metro_distance_m"].iloc[0] == ml_service.METRO_WALK_DISTANCE_M["under_5"]


def test_parking_does_not_change_the_estimate():
    without = ml_service.predict_rent_price({**VALID, "parking": False})
    with_parking = ml_service.predict_rent_price({**VALID, "parking": True})
    assert with_parking["estimated_price"] == without["estimated_price"]
    assert any(r["type"] == "info" and "στάθμευσης" in r["text"] for r in with_parking["reasons"])


def test_estimate_is_the_model_output_without_adjustments():
    r = ml_service.predict_rent_price({**VALID, "floor": 6, "elevator": False, "metro_walk_time": "over_15"})
    assert r["estimated_price"] == pytest.approx(max(150.0, r["model_price"]), abs=0.01)


def test_factor_amounts_come_from_the_model(monkeypatch):
    calls = spy_model(monkeypatch)
    r = ml_service.predict_rent_price({**VALID, "elevator": False, "floor": 5, "year_built": 2018})
    batch = calls[0]
    real_predict = type(ml_service.model).predict
    prices = real_predict(ml_service.model, batch)
    model_price = prices[0]
    # Κάθε παράγοντας = εκτίμηση με την πραγματική τιμή - εκτίμηση με την τυπική τιμή.
    expected = {round(model_price - p) for p in prices[1:] if abs(model_price - p) >= ml_service.MIN_FACTOR_EUR}
    shown = set()
    for reason in r["reasons"]:
        if reason["type"] in ("positive", "negative") and "AI Vision" not in reason["text"]:
            amount = int(reason["text"].rsplit("€", 1)[1].split("/")[0])
            shown.add(amount if reason["text"].rsplit(": ", 1)[1].startswith("+") else -amount)
    assert shown == expected
    assert r["model_price"] == pytest.approx(model_price, abs=0.01)


def test_raw_listings_are_not_served_by_the_frontend():
    from pathlib import Path
    public = Path(__file__).resolve().parent.parent / "frontend" / "public"
    assert not list(public.rglob("*.csv")), "Τα δεδομένα αγγελιών δεν πρέπει να βρίσκονται στο frontend/public"


def test_city_stats_are_aggregates_only(client):
    body = client.get("/api/city-stats").json()
    assert body["totalProperties"] == len(ml_service._valid_rows())
    assert body["neighborhoods"]
    for n in body["neighborhoods"]:
        assert set(n) == {"name", "avgPrice", "count"}
        assert n["count"] >= ml_service.MIN_LISTINGS_PUBLIC


def test_heatmap_areas_are_aggregates_only(client):
    areas = client.get("/api/heatmap-areas").json()["areas"]
    assert areas
    for a in areas:
        assert set(a) == {"name", "position", "price", "count"}
        assert a["count"] >= ml_service.MIN_LISTINGS_PUBLIC
