from backend.app import config
from tests.conftest import VALID_ANALYSIS, VALID_RENOVATION
from tests.test_renovation import FORM as RENO_FORM, photos
from tests.test_vision import analyze, upload


def test_per_ip_limit(client, provider, monkeypatch):
    monkeypatch.setattr(config, "AI_PER_IP_LIMIT", 2)
    provider.reply_json(VALID_ANALYSIS)
    assert analyze(client).status_code == 200
    assert analyze(client).status_code == 200
    r = analyze(client)
    assert r.status_code == 429
    assert r.json()["error"]["code"] == "RATE_LIMITED"
    assert 0 < int(r.headers["retry-after"]) <= config.AI_PER_IP_WINDOW_S
    assert provider.calls == 2


def test_window_expires(client, provider, monkeypatch):
    monkeypatch.setattr(config, "AI_PER_IP_LIMIT", 1)
    monkeypatch.setattr(config, "AI_PER_IP_WINDOW_S", 0)
    provider.reply_json(VALID_ANALYSIS)
    assert analyze(client).status_code == 200
    assert analyze(client).status_code == 200


def test_failed_calls_count_towards_limit(client, provider, monkeypatch):
    monkeypatch.setattr(config, "AI_PER_IP_LIMIT", 1)
    provider.reply((500, {"error": {"message": "boom"}}))
    assert analyze(client).status_code == 502
    assert analyze(client).status_code == 429


def test_invalid_uploads_do_not_count(client, provider, monkeypatch):
    monkeypatch.setattr(config, "AI_PER_IP_LIMIT", 1)
    provider.reply_json(VALID_ANALYSIS)
    assert analyze(client, upload(data=b"not an image")).status_code == 422
    assert analyze(client).status_code == 200


def test_daily_limit(client, provider, monkeypatch):
    monkeypatch.setattr(config, "AI_DAILY_LIMIT", 1)
    provider.reply_json(VALID_ANALYSIS)
    assert analyze(client).status_code == 200
    r = analyze(client)
    assert r.status_code == 503
    assert r.json()["error"]["code"] == "VISION_DAILY_LIMIT"


def test_renovation_reports_limit_and_still_computes(client, provider, monkeypatch):
    monkeypatch.setattr(config, "AI_PER_IP_LIMIT", 0)
    provider.reply_json(VALID_RENOVATION)
    r = client.post("/api/renovation-roi", data=RENO_FORM, files=photos())
    assert r.status_code == 200
    assert r.json()["vision"]["status"] == "failed"
    assert r.json()["vision"]["error"]["code"] == "RATE_LIMITED"
    assert provider.calls == 0
