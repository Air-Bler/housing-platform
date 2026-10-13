def preflight(client, origin):
    return client.options("/api/predict", headers={
        "Origin": origin, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type"})


def test_allowed_origin(client):
    r = preflight(client, "http://localhost:3000")
    assert r.status_code == 200
    assert r.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert "access-control-allow-credentials" not in r.headers


def test_other_origin_is_not_allowed(client):
    r = preflight(client, "https://evil.example")
    assert "access-control-allow-origin" not in r.headers
    r = client.get("/api/model-stats", headers={"Origin": "https://evil.example"})
    assert "access-control-allow-origin" not in r.headers


def test_disallowed_method(client):
    r = client.options("/api/predict", headers={"Origin": "http://localhost:3000",
                                                "Access-Control-Request-Method": "DELETE"})
    assert r.status_code == 400
