import json

from starlette.types import ASGIApp, Message, Receive, Scope, Send

from backend.app.errors import AppError, _request_id, error_body


class BodySizeLimitMiddleware:
    """Όριο στο μέγεθος του request body.

    Ελέγχει πρώτα το Content-Length (απόρριψη χωρίς ανάγνωση) και μετά μετρά τα bytes
    καθώς φτάνουν, ώστε να καλύπτονται και chunked uploads χωρίς Content-Length.
    Σε production το ίδιο όριο πρέπει να υπάρχει και στον reverse proxy (π.χ. nginx client_max_body_size).
    """

    def __init__(self, app: ASGIApp, max_bytes: int):
        self.app = app
        self.max_bytes = max_bytes

    def _too_large(self) -> AppError:
        mb = self.max_bytes // (1024 * 1024)
        return AppError(413, "REQUEST_TOO_LARGE", f"Το αίτημα ξεπερνά το όριο των {mb} MB.")

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        headers = dict(scope.get("headers") or [])
        declared = headers.get(b"content-length")
        if declared is not None and declared.isdigit() and int(declared) > self.max_bytes:
            return await self._reject(scope, send)

        received = 0

        async def limited_receive() -> Message:
            nonlocal received
            message = await receive()
            if message["type"] == "http.request":
                received += len(message.get("body", b""))
                if received > self.max_bytes:
                    # Σηκώνεται μέσα στην ανάγνωση της φόρμας και χειρίζεται από τον AppError handler (413).
                    raise self._too_large()
            return message

        await self.app(scope, limited_receive, send)

    async def _reject(self, scope: Scope, send: Send):
        err = self._too_large()
        body = json.dumps(error_body(err.code, err.message, _request_id()), ensure_ascii=False).encode("utf-8")
        await send({"type": "http.response.start", "status": 413,
                    "headers": [(b"content-type", b"application/json"), (b"content-length", str(len(body)).encode())]})
        await send({"type": "http.response.body", "body": body})
