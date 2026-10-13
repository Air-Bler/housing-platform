"""Κοινή κλήση του vision μοντέλου με ρητή πολιτική timeout / retry και επαλήθευση απάντησης.

Κάθε αποτυχία μετατρέπεται σε AppError με σταθερό κωδικό. Δεν επιστρέφεται ποτέ
αποτέλεσμα που δεν προήλθε από το μοντέλο.
"""

import asyncio
import json
import logging
from typing import TypeVar

import openai
from openai import AsyncOpenAI
from pydantic import BaseModel, ValidationError

from backend.app import config
from backend.app.errors import AppError

logger = logging.getLogger("housing.ai")

T = TypeVar("T", bound=BaseModel)

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if not config.OPENAI_API_KEY:
        raise AppError(503, "VISION_NOT_CONFIGURED",
                       "Η ανάλυση φωτογραφιών δεν είναι διαθέσιμη αυτή τη στιγμή.")
    if _client is None:
        _client = build_client()
    return _client


def build_client(http_client=None) -> AsyncOpenAI:
    # Async client: η αναμονή του provider δεν μπλοκάρει το event loop του worker.
    return AsyncOpenAI(
        api_key=config.OPENAI_API_KEY,
        timeout=openai.Timeout(config.AI_ATTEMPT_TIMEOUT_S, connect=config.AI_CONNECT_TIMEOUT_S),
        max_retries=config.AI_MAX_RETRIES,
        http_client=http_client,
    )


def build_image_parts(images: list[tuple[str, str]]) -> list[dict]:
    """images: λίστα (mime_type, base64)."""
    return [
        {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}", "detail": "high"}}
        for mime, b64 in images
    ]


async def run_vision_json(prompt: str, images: list[tuple[str, str]], schema: type[T], max_tokens: int) -> T:
    client = _get_client()
    messages = [{"role": "user", "content": [{"type": "text", "text": prompt}, *build_image_parts(images)]}]

    try:
        response = await asyncio.wait_for(
            client.chat.completions.create(
                model=config.VISION_MODEL,
                messages=messages,
                response_format={"type": "json_object"},
                max_tokens=max_tokens,
                temperature=0.1,
            ),
            timeout=config.AI_TOTAL_DEADLINE_S,
        )
    except (asyncio.TimeoutError, openai.APITimeoutError) as e:
        raise AppError(504, "VISION_TIMEOUT",
                       "Η ανάλυση φωτογραφιών άργησε υπερβολικά και διακόπηκε. Δοκιμάστε ξανά.") from e
    except openai.RateLimitError as e:
        raise AppError(503, "VISION_BUSY",
                       "Η υπηρεσία ανάλυσης φωτογραφιών είναι προσωρινά φορτωμένη. Δοκιμάστε σε λίγο.") from e
    except (openai.AuthenticationError, openai.PermissionDeniedError, openai.NotFoundError) as e:
        # Σφάλμα ρύθμισης από τη δική μας πλευρά (κλειδί, δικαιώματα, μοντέλο).
        raise AppError(503, "VISION_NOT_CONFIGURED",
                       "Η ανάλυση φωτογραφιών δεν είναι διαθέσιμη αυτή τη στιγμή.") from e
    except openai.BadRequestError as e:
        # Π.χ. ο provider απέρριψε μια εικόνα παρότι πέρασε τους δικούς μας ελέγχους.
        raise AppError(422, "VISION_REJECTED_INPUT",
                       "Η υπηρεσία ανάλυσης δεν δέχτηκε τις φωτογραφίες. Δοκιμάστε με άλλες εικόνες.") from e
    except openai.APIError as e:
        raise AppError(502, "VISION_PROVIDER_ERROR",
                       "Η υπηρεσία ανάλυσης φωτογραφιών δεν απάντησε σωστά. Δοκιμάστε ξανά.") from e

    choice = response.choices[0]
    raw = choice.message.content
    if choice.finish_reason != "stop" or not raw:
        logger.warning("Vision response not usable: finish_reason=%s", choice.finish_reason)
        raise AppError(502, "VISION_INVALID_RESPONSE",
                       "Η ανάλυση φωτογραφιών δεν επέστρεψε έγκυρο αποτέλεσμα. Δοκιμάστε ξανά.")

    try:
        return schema.model_validate(json.loads(raw))
    except (json.JSONDecodeError, ValidationError) as e:
        logger.warning("Vision response failed schema %s: %s | raw=%.500s", schema.__name__, e, raw)
        raise AppError(502, "VISION_INVALID_RESPONSE",
                       "Η ανάλυση φωτογραφιών δεν επέστρεψε έγκυρο αποτέλεσμα. Δοκιμάστε ξανά.") from e
