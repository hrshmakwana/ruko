"""POST /report - add a check's indicators to the community database.

Idempotent per check: the check record is flipped to reported under a condition,
and the counters only move when that flip actually happened. Refreshing the page
or tapping twice cannot inflate a count.
"""

from __future__ import annotations

from ruko import store
from ruko.http import LOG, ApiError, handler_wrapper, parse_json_body, response


@handler_wrapper
def lambda_handler(event, context):  # noqa: ANN001, ARG001
    body = parse_json_body(event)

    check_id = body.get("check_id")
    if not isinstance(check_id, str) or not check_id.strip():
        raise ApiError(400, "bad_check_id", "check_id is required.")
    check_id = check_id.strip()[:64]

    item = store.get_check(check_id)
    if item is None:
        # Checks expire after 24 hours, so this is a normal thing to hit.
        raise ApiError(404, "check_not_found", "That check has expired. Please check it again.")

    if item.get("reported"):
        return response(200, {"ok": True, "already_reported": True, "indicators": 0})

    if not store.mark_reported(check_id):
        return response(200, {"ok": True, "already_reported": True, "indicators": 0})

    indicators = item.get("indicators") or []
    updated = store.bump_indicators(indicators, item.get("scam_type"))

    LOG.info("report_done check_id=%s indicators=%d", check_id, updated)

    return response(200, {"ok": True, "already_reported": False, "indicators": updated})
