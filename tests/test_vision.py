import asyncio
import json
import time

import httpx2
import pytest

from backend.app import config
from backend.app.services import ai_client
from backend.app.services.vision_service import VisionAnalysis
from tests.conftest import VALID_ANALYSIS, chat_completion, make_image

FORM = {"suburb": "Κυψέλη", "sqm": "70"}


def upload(n=1, fmt="JPEG", name="room.jpg", content_type="image/jpeg", data=None):
    data = data if data is not None else make_image(fmt)
    return [("images", (f"{i}-{name}", data, content_type)) for i in range(n)]


def analyze(client, files=None, form=FORM):
    return client.post("/api/analyze-images", data=form, files=files if files is not None else upload())


# --- Επιτυχία -----------------------------------------------------------------

def test_success_returns_validated_analysis(client, provider):
    provider.reply_json({**VALID_ANALYSIS, "extra_field": "ignored"})
    r = analyze(client)
    assert r.status_code == 200
    assert r.json() == {"analysis": VALID_ANALYSIS}
    assert provider.calls == 1


def test_mime_type_comes_from_content_not_from_client(client, provider, monkeypatch):
    sent = {}

    async def capture(request):
        sent["body"] = json.loads(request.content)
        return httpx2.Response(200, json=chat_completion(json.dumps(VALID_ANALYSIS)))

    provider.reply(capture)
    r = analyze(client, upload(fmt="PNG", name="room.jpg", content_type="image/jpeg"))
    assert r.status_code == 200
    url = sent["body"]["messages"][0]["content"][1]["image_url"]["url"]
    assert url.startswith("data:image/png;base64,")


# --- Αποτυχία provider: ποτέ ψεύτικο αποτέλεσμα -------------------------------

def assert_failure(r, status, code):
    assert r.status_code == status, r.text
    body = r.json()
    assert "analysis" not in body
    assert body["error"]["code"] == code
    assert body["error"]["message"]


def test_missing_api_key_is_an_explicit_503(client, monkeypatch):
    monkeypatch.setattr(config, "OPENAI_API_KEY", None)
    monkeypatch.setattr(ai_client, "_client", None)
    assert_failure(analyze(client), 503, "VISION_NOT_CONFIGURED")


def test_server_errors_are_retried_then_fail(client, provider):
    provider.reply((500, {"error": {"message": "boom"}}))
    assert_failure(analyze(client), 502, "VISION_PROVIDER_ERROR")
    assert provider.calls == 1 + config.AI_MAX_RETRIES


def test_transient_error_recovers_on_retry(client, provider):
    provider.reply((503, {"error": {"message": "overloaded"}}), (200, chat_completion(json.dumps(VALID_ANALYSIS))))
    r = analyze(client)
    assert r.status_code == 200
    assert provider.calls == 2


def test_rate_limit_maps_to_busy(client, provider):
    provider.reply((429, {"error": {"message": "slow down"}}))
    assert_failure(analyze(client), 503, "VISION_BUSY")
    assert provider.calls == 1 + config.AI_MAX_RETRIES


@pytest.mark.parametrize("status,code", [(400, "VISION_REJECTED_INPUT"), (401, "VISION_NOT_CONFIGURED")])
def test_client_errors_are_not_retried(client, provider, status, code):
    provider.reply((status, {"error": {"message": "nope"}}))
    assert_failure(analyze(client), 503 if status == 401 else 422, code)
    assert provider.calls == 1


def test_total_deadline_stops_waiting(client, provider, monkeypatch):
    monkeypatch.setattr(config, "AI_TOTAL_DEADLINE_S", 0.3)

    async def slow(_):
        await asyncio.sleep(5)
        return httpx2.Response(200, json=chat_completion(json.dumps(VALID_ANALYSIS)))

    provider.reply(slow)
    start = time.monotonic()
    assert_failure(analyze(client), 504, "VISION_TIMEOUT")
    assert time.monotonic() - start < 2


def test_attempt_timeout_maps_to_504(client, provider):
    async def timeout(request):
        raise httpx2.ReadTimeout("read timed out", request=request)

    provider.reply(timeout)
    assert_failure(analyze(client), 504, "VISION_TIMEOUT")
    assert provider.calls == 1 + config.AI_MAX_RETRIES


# --- Επαλήθευση απάντησης AI -------------------------------------------------

@pytest.mark.parametrize("payload", [
    {k: v for k, v in VALID_ANALYSIS.items() if k != "score"},
    {**VALID_ANALYSIS, "score": "εννιά"},
    {**VALID_ANALYSIS, "score": 15},
    {**VALID_ANALYSIS, "score": 0},
    {**VALID_ANALYSIS, "summary": ""},
    {**VALID_ANALYSIS, "highlights": "ένα string αντί για λίστα"},
    {**VALID_ANALYSIS, "observations": []},
    {"result": VALID_ANALYSIS},
    [VALID_ANALYSIS],
])
def test_schema_violations_are_rejected(client, provider, payload):
    provider.reply((200, chat_completion(json.dumps(payload, ensure_ascii=False))))
    assert_failure(analyze(client), 502, "VISION_INVALID_RESPONSE")


def test_non_json_response_is_rejected(client, provider):
    provider.reply((200, chat_completion("Το ακίνητο είναι καλό, 8/10")))
    assert_failure(analyze(client), 502, "VISION_INVALID_RESPONSE")


def test_truncated_response_is_rejected(client, provider):
    provider.reply((200, chat_completion('{"score": 8.1, "summary": "Φωτει', finish_reason="length")))
    assert_failure(analyze(client), 502, "VISION_INVALID_RESPONSE")


# --- Δεν μπλοκάρεται το event loop -------------------------------------------

def test_provider_wait_does_not_block_event_loop(provider):
    """Όσο περιμένουμε τον provider, άλλες coroutines του ίδιου worker πρέπει να τρέχουν."""
    async def slow(_):
        await asyncio.sleep(0.4)
        return httpx2.Response(200, json=chat_completion(json.dumps(VALID_ANALYSIS)))

    provider.reply(slow)
    images = [("image/jpeg", "AAAA")]

    async def scenario():
        ticks = 0

        async def heartbeat():
            nonlocal ticks
            while True:
                await asyncio.sleep(0.02)
                ticks += 1

        hb = asyncio.create_task(heartbeat())
        start = time.monotonic()
        results = await asyncio.gather(*[
            ai_client.run_vision_json("prompt", images, VisionAnalysis, max_tokens=10) for _ in range(3)
        ])
        elapsed = time.monotonic() - start
        hb.cancel()
        return results, elapsed, ticks

    results, elapsed, ticks = asyncio.run(scenario())
    assert len(results) == 3
    assert elapsed < 0.8          # οι 3 κλήσεις έτρεξαν παράλληλα, όχι σειριακά (1.2s)
    assert ticks >= 10            # το heartbeat συνέχισε να τρέχει κατά την αναμονή
