"""The parent's half of the guardian link. No account, no token.

  GET  /family/status?family_code=ABC123   is my guardian telling me anything?
  POST /family/link    {family_code}       does this code exist?
  POST /panic          {family_code}       I am being pressured right now

Knowing a family code lets you *raise* an alarm and *receive* a directive for
that family. It does not let you read the alert history — that needs the
guardian's token. The worst a leaked code allows is a false alarm, which is the
right way round for something whose whole job is raising the alarm.
"""

from __future__ import annotations

from ruko import family
from ruko.http import LOG, ApiError, handler_wrapper, parse_json_body, response
from ruko.verdict import normalise_language


def _code_from_query(event: dict) -> str:
    params = event.get("queryStringParameters") or {}
    code = family.normalise_code(params.get("family_code", ""))
    if len(code) != family.CODE_LENGTH:
        raise ApiError(400, "bad_family_code", "That family code does not look right.")
    return code


def _code_from_body(event: dict) -> str:
    body = parse_json_body(event)
    code = family.normalise_code(body.get("family_code", ""))
    if len(code) != family.CODE_LENGTH:
        raise ApiError(400, "bad_family_code", "That family code does not look right.")
    return code


@handler_wrapper
def status(event, context):  # noqa: ANN001, ARG001
    """Polled by the parent's screen. Kept tiny — this runs every few seconds."""
    code = _code_from_query(event)
    feed = family.get_feed(code)
    return response(200, {"directive": feed["directive"]})


@handler_wrapper
def link(event, context):  # noqa: ANN001, ARG001
    code = _code_from_body(event)
    if not family.family_exists(code):
        raise ApiError(404, "family_not_found", "No family found with that code.")
    return response(200, {"ok": True, "family_code": code})


@handler_wrapper
def panic(event, context):  # noqa: ANN001, ARG001
    """The red button: someone is being pressured right now."""
    body = parse_json_body(event)
    code = family.normalise_code(body.get("family_code", ""))
    if len(code) != family.CODE_LENGTH:
        raise ApiError(400, "bad_family_code", "That family code does not look right.")
    if not family.family_exists(code):
        raise ApiError(404, "family_not_found", "No family found with that code.")

    language = normalise_language(body.get("language"))
    alert_id = family.add_alert(
        code,
        {
            "kind": "panic",
            "risk_level": "scam",
            "risk_score": 100,
            "scam_type": "other_scam",
            "headline": "Someone is pressuring them right now. Call them.",
            "language": language,
        },
    )
    if alert_id is None:
        raise ApiError(500, "panic_failed", "Could not raise the alarm. Please call them directly.")

    LOG.info("panic_raised family=%s", code)
    return response(201, {"ok": True, "alert_id": alert_id})
