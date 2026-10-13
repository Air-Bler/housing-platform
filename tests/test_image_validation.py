import pytest

from backend.app import config
from tests.conftest import VALID_ANALYSIS, make_image
from tests.test_vision import FORM, analyze, upload


@pytest.fixture(autouse=True)
def ok_provider(provider):
    """Ο provider απαντά κανονικά· κάθε test ελέγχει ότι δεν κλήθηκε όταν το upload απορρίπτεται."""
    return provider.reply_json(VALID_ANALYSIS)


def assert_rejected(r, provider, status, code):
    assert r.status_code == status, r.text
    assert r.json()["error"]["code"] == code
    assert provider.calls == 0


def test_no_images(client, ok_provider):
    r = client.post("/api/analyze-images", data=FORM)
    assert r.status_code == 422
    assert ok_provider.calls == 0


def test_too_many_images(client, ok_provider):
    assert_rejected(analyze(client, upload(n=config.MAX_IMAGES + 1)), ok_provider, 422, "TOO_MANY_IMAGES")


def test_max_images_accepted(client, ok_provider):
    assert analyze(client, upload(n=config.MAX_IMAGES)).status_code == 200


def test_not_an_image(client, ok_provider):
    r = analyze(client, upload(data=b"%PDF-1.7 not really an image", name="room.jpg"))
    assert_rejected(r, ok_provider, 422, "IMAGE_INVALID")
    assert "room.jpg" in r.json()["error"]["message"]


def test_truncated_image(client, ok_provider):
    data = make_image()
    assert_rejected(analyze(client, upload(data=data[: len(data) // 3])), ok_provider, 422, "IMAGE_INVALID")


def test_unsupported_format(client, ok_provider):
    assert_rejected(analyze(client, upload(fmt="BMP", name="room.bmp")), ok_provider, 422,
                    "IMAGE_UNSUPPORTED_FORMAT")


def test_too_small(client, ok_provider):
    assert_rejected(analyze(client, upload(data=make_image(size=(20, 20)))), ok_provider, 422, "IMAGE_TOO_SMALL")


def test_dimensions_too_large(client, ok_provider, monkeypatch):
    monkeypatch.setattr(config, "MAX_IMAGE_SIDE_PX", 500)
    assert_rejected(analyze(client, upload(data=make_image(size=(600, 400)))), ok_provider, 422,
                    "IMAGE_DIMENSIONS_TOO_LARGE")


def test_single_file_too_large(client, ok_provider, monkeypatch):
    monkeypatch.setattr(config, "MAX_IMAGE_BYTES", 2_000)
    assert_rejected(analyze(client, upload(data=make_image(size=(800, 600)))), ok_provider, 413, "IMAGE_TOO_LARGE")


def test_total_too_large(client, ok_provider, monkeypatch):
    data = make_image()
    monkeypatch.setattr(config, "MAX_TOTAL_IMAGE_BYTES", int(len(data) * 2.5))
    assert_rejected(analyze(client, upload(n=3, data=data)), ok_provider, 413, "IMAGES_TOTAL_TOO_LARGE")


def test_request_body_limit_via_content_length(client, ok_provider):
    r = client.post("/api/analyze-images", content=b"x", headers={
        "Content-Length": str(config.MAX_REQUEST_BYTES + 1), "Content-Type": "multipart/form-data; boundary=x"})
    assert_rejected(r, ok_provider, 413, "REQUEST_TOO_LARGE")


def test_request_body_limit_when_streamed(client, ok_provider):
    """Chunked upload χωρίς Content-Length: το όριο εφαρμόζεται καθώς φτάνουν τα bytes."""
    big = b"x" * (config.MAX_REQUEST_BYTES + 1024)

    def chunks():
        for i in range(0, len(big), 1024 * 1024):
            yield big[i:i + 1024 * 1024]

    r = client.post("/api/analyze-images", content=chunks(),
                    headers={"Content-Type": "multipart/form-data; boundary=x"})
    assert_rejected(r, ok_provider, 413, "REQUEST_TOO_LARGE")
