"""Όρια χρήσης για τις κλήσεις AI, που κοστίζουν σε κάθε αίτημα.

- Ανά IP: έως AI_PER_IP_LIMIT κλήσεις ανά AI_PER_IP_WINDOW_S (sliding window).
- Συνολικά: έως AI_DAILY_LIMIT κλήσεις ανά ημέρα (UTC), ως φρένο στο κόστος.

Οι μετρητές είναι στη μνήμη του process: με πολλούς workers ή instances κάθε ένα έχει
τους δικούς του, οπότε τα πραγματικά όρια πολλαπλασιάζονται. Για τέτοιο deployment
χρειάζεται κοινός χώρος (π.χ. Redis). Πίσω από reverse proxy, ο uvicorn πρέπει να τρέχει
με --proxy-headers --forwarded-allow-ips=<IP του proxy> ώστε να βλέπουμε την IP του χρήστη.
Το όριο χρέωσης στον λογαριασμό OpenAI παραμένει η τελευταία γραμμή προστασίας.
"""

import math
import time
from collections import deque
from datetime import datetime, timezone

from fastapi import Request

from backend.app import config
from backend.app.errors import AppError

_per_ip: dict[str, deque] = {}
_daily = {"day": None, "count": 0}
_MAX_TRACKED_IPS = 10_000


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _prune(now: float):
    cutoff = now - config.AI_PER_IP_WINDOW_S
    for ip in [ip for ip, hits in _per_ip.items() if not hits or hits[-1] <= cutoff]:
        del _per_ip[ip]


def reserve_ai_call(request: Request) -> None:
    """Δεσμεύει μία κλήση AI για το αίτημα ή σηκώνει AppError.

    Μετρά την προσπάθεια πριν την κλήση, ώστε και οι αποτυχημένες κλήσεις να μετρούν στο όριο.
    Δεν υπάρχει await ανάμεσα στον έλεγχο και την καταγραφή, οπότε είναι ασφαλές στο event loop.
    """
    now = time.monotonic()
    ip = _client_ip(request)

    hits = _per_ip.setdefault(ip, deque())
    while hits and hits[0] <= now - config.AI_PER_IP_WINDOW_S:
        hits.popleft()
    if len(hits) >= config.AI_PER_IP_LIMIT:
        oldest = hits[0] if hits else now  # limit 0: η λειτουργία είναι κλειστή
        retry_after = max(1, math.ceil(oldest + config.AI_PER_IP_WINDOW_S - now))
        minutes = max(1, math.ceil(retry_after / 60))
        err = AppError(429, "RATE_LIMITED",
                       f"Έχετε φτάσει το όριο αναλύσεων φωτογραφιών. Δοκιμάστε ξανά σε {minutes} λεπτά.")
        err.headers = {"Retry-After": str(retry_after)}
        raise err

    today = datetime.now(timezone.utc).date()
    if _daily["day"] != today:
        _daily.update(day=today, count=0)
    if _daily["count"] >= config.AI_DAILY_LIMIT:
        raise AppError(503, "VISION_DAILY_LIMIT",
                       "Η ανάλυση φωτογραφιών δεν είναι διαθέσιμη για σήμερα. Δοκιμάστε ξανά αύριο.")

    hits.append(now)
    _daily["count"] += 1
    if len(_per_ip) > _MAX_TRACKED_IPS:
        _prune(now)


def reset() -> None:
    _per_ip.clear()
    _daily.update(day=None, count=0)
