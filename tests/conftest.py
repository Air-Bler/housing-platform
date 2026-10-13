import io
import json

import httpx2
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from backend.app import config, rate_limit
from backend.app.main import app
from backend.app.services import ai_client


@pytest.fixture(autouse=True)
def _reset_rate_limits():
    rate_limit.reset()


@pytest.fixture
def client():
    return TestClient(app, raise_server_exceptions=False)


def make_image(fmt="JPEG", size=(320, 240), color=(180, 160, 140)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, format=fmt)
    return buf.getvalue()


def chat_completion(content: str | None, finish_reason: str = "stop") -> dict:
    return {
        "id": "chatcmpl-test", "object": "chat.completion", "created": 0, "model": "gpt-4o",
        "choices": [{"index": 0, "finish_reason": finish_reason,
                     "message": {"role": "assistant", "content": content}}],
    }


VALID_ANALYSIS = {
    "score": 8.1,
    "summary": "Φωτεινό διαμέρισμα σε πολύ καλή κατάσταση.",
    "highlights": ["Νέα κουφώματα", "Ανακαινισμένο μπάνιο"],
    "observations": ["Φθορές στο δάπεδο του σαλονιού"],
}

VALID_RENOVATION = {
    "condition_score": 4.0,
    "condition_level": "heavy",
    "summary": "Παλιό ακίνητο με εμφανή υγρασία.",
    "detected_issues": ["Υγρασία στο ταβάνι"],
    "strengths": ["Ψηλά ταβάνια"],
    "needed_works": ["painting", "insulation", "bathroom"],
    "quick_wins": ["Βάψιμο"],
}


class FakeProvider:
    """Αντικαθιστά το HTTP επίπεδο του OpenAI SDK, ώστε να δοκιμάζονται τα πραγματικά retries/timeouts του SDK."""

    def __init__(self, monkeypatch):
        self.calls = 0
        self.responses = []
        monkeypatch.setattr(config, "OPENAI_API_KEY", "sk-test")
        monkeypatch.setattr(ai_client, "_client", None)

        async def handler(request: httpx2.Request) -> httpx2.Response:
            self.calls += 1
            item = self.responses[min(self.calls, len(self.responses)) - 1]
            if callable(item):
                return await item(request)
            status, body = item
            return httpx2.Response(status, json=body)

        monkeypatch.setattr(ai_client, "_client",
                            ai_client.build_client(httpx2.AsyncClient(transport=httpx2.MockTransport(handler))))

    def reply(self, *items):
        """items: (status, body) ή async callable(request) -> Response."""
        self.responses = list(items)
        return self

    def reply_json(self, payload: dict):
        return self.reply((200, chat_completion(json.dumps(payload, ensure_ascii=False))))


@pytest.fixture
def provider(monkeypatch):
    return FakeProvider(monkeypatch)
