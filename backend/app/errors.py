"""Ενιαίο συμβόλαιο σφαλμάτων του API.

Επιτυχία: HTTP 2xx με το αποτέλεσμα του endpoint.
Αποτυχία: HTTP 4xx/5xx με σώμα
    {"error": {"code": "<ΣΤΑΘΕΡΟΣ_ΚΩΔΙΚΟΣ>", "message": "<μήνυμα για τον χρήστη>", "details": [...]?, "request_id": "..."}}

Ο client αποφασίζει με βάση το HTTP status και το `error.code`. Το `message` είναι
ασφαλές να εμφανιστεί στον χρήστη. Τεχνικές λεπτομέρειες γράφονται μόνο στο log,
με το ίδιο `request_id` ώστε να εντοπίζεται η αντίστοιχη εγγραφή.
"""

import logging
import uuid

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("housing.api")


class AppError(HTTPException):
    # Υποκλάση του HTTPException ώστε το FastAPI να μην το μετατρέπει σε γενικό 400
    # όταν σηκώνεται κατά την ανάγνωση του body (π.χ. όριο μεγέθους upload).
    def __init__(self, status_code: int, code: str, message: str, details: list | None = None):
        super().__init__(status_code=status_code, detail=message)
        self.code = code
        self.message = message
        self.details = details


def error_body(code: str, message: str, request_id: str, details: list | None = None) -> dict:
    body = {"code": code, "message": message, "request_id": request_id}
    if details:
        body["details"] = details
    return {"error": body}


def _request_id() -> str:
    return uuid.uuid4().hex[:12]


async def _app_error_handler(request: Request, exc: AppError):
    rid = _request_id()
    level = logging.ERROR if exc.status_code >= 500 else logging.INFO
    logger.log(level, "%s %s -> %s %s [%s]", request.method, request.url.path, exc.status_code, exc.code, rid,
               exc_info=exc.__cause__ if exc.status_code >= 500 else None)
    return JSONResponse(status_code=exc.status_code, content=error_body(exc.code, exc.message, rid, exc.details),
                        headers=exc.headers)


async def _validation_error_handler(request: Request, exc: RequestValidationError):
    rid = _request_id()
    details = [
        {"field": ".".join(str(p) for p in err["loc"] if p not in ("body", "query", "path")), "message": err["msg"]}
        for err in exc.errors()
    ]
    logger.info("%s %s -> 422 INVALID_INPUT %s [%s]", request.method, request.url.path, details, rid)
    return JSONResponse(
        status_code=422,
        content=error_body("INVALID_INPUT", "Ορισμένα στοιχεία της φόρμας δεν είναι έγκυρα.", rid, details),
    )


_HTTP_CODES = {400: "BAD_REQUEST", 404: "NOT_FOUND", 405: "METHOD_NOT_ALLOWED", 413: "REQUEST_TOO_LARGE"}


async def _http_error_handler(request: Request, exc: StarletteHTTPException):
    rid = _request_id()
    code = _HTTP_CODES.get(exc.status_code, "HTTP_ERROR")
    logger.info("%s %s -> %s %s (%s) [%s]", request.method, request.url.path, exc.status_code, code, exc.detail, rid)
    message = "Το αίτημα δεν είναι έγκυρο." if exc.status_code < 500 else "Παρουσιάστηκε εσωτερικό σφάλμα."
    return JSONResponse(status_code=exc.status_code, content=error_body(code, message, rid), headers=exc.headers)


class UnhandledErrorMiddleware:
    """Μετατρέπει κάθε απρόβλεπτο exception σε 500 με το ενιαίο σώμα σφάλματος.

    Είναι middleware και όχι exception handler, γιατί ο handler για Exception στο Starlette
    τρέχει έξω από το CORSMiddleware και η απάντηση δεν θα είχε CORS headers.
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        started = False

        async def tracking_send(message):
            nonlocal started
            if message["type"] == "http.response.start":
                started = True
            await send(message)

        try:
            await self.app(scope, receive, tracking_send)
        except Exception:
            rid = _request_id()
            logger.exception("Unhandled error on %s %s [%s]", scope.get("method"), scope.get("path"), rid)
            if started:
                raise
            response = JSONResponse(
                status_code=500,
                content=error_body("INTERNAL_ERROR", "Παρουσιάστηκε εσωτερικό σφάλμα. Δοκιμάστε ξανά αργότερα.", rid),
            )
            await response(scope, receive, send)


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppError, _app_error_handler)
    app.add_exception_handler(RequestValidationError, _validation_error_handler)
    app.add_exception_handler(StarletteHTTPException, _http_error_handler)
