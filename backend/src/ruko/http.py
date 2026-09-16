"""Small helpers shared by every Lambda handler.

Deliberately dependency-free: the Lambda runtime already gives us json and os.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any

LOG = logging.getLogger("ruko")
LOG.setLevel(os.environ.get("LOG_LEVEL", "INFO"))

# API Gateway HTTP API adds the CORS headers itself, so we only set content type.
_BASE_HEADERS = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
}


class ApiError(Exception):
    """An error that is safe to show the caller."""

    def __init__(self, status: int, code: str, message: str) -> None:
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message


def response(status: int, body: Any) -> dict:
    return {
        "statusCode": status,
        "headers": dict(_BASE_HEADERS),
        "body": json.dumps(body, ensure_ascii=False, separators=(",", ":")),
    }


def error_response(err: ApiError) -> dict:
    return response(err.status, {"error": {"code": err.code, "message": err.message}})


def parse_json_body(event: dict) -> dict:
    """Read the request body as JSON.

    Never logs the body: it can contain a scam message the user pasted, which may
    include their own personal details.
    """
    raw = event.get("body") or "{}"
    if event.get("isBase64Encoded"):
        import base64

        raw = base64.b64decode(raw).decode("utf-8", errors="replace")
    try:
        parsed = json.loads(raw)
    except (ValueError, TypeError):
        raise ApiError(400, "bad_json", "Request body must be JSON.")
    if not isinstance(parsed, dict):
        raise ApiError(400, "bad_json", "Request body must be a JSON object.")
    return parsed


def handler_wrapper(fn):
    """Turn ApiError into a clean response and anything else into a 500.

    The unexpected-error branch logs the exception type only, never the message
    body, so a stack trace can never leak what the user pasted.
    """

    def wrapped(event, context):  # noqa: ANN001
        try:
            return fn(event, context)
        except ApiError as err:
            return error_response(err)
        except Exception as exc:  # noqa: BLE001
            LOG.exception("unhandled_error type=%s", type(exc).__name__)
            return error_response(
                ApiError(500, "internal_error", "Something went wrong. Please try again.")
            )

    return wrapped
