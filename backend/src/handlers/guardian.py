"""The guardian API.

  POST /guardian/signup     create an account, get a family code
  POST /guardian/login      get a token
  GET  /guardian/alerts     the family feed (auth)
  POST /guardian/directive  push "stop" onto the parent's screen (auth)

Checking a message needs no account. This exists only so an alert has somewhere
to go.
"""

from __future__ import annotations

import re

from ruko import family
from ruko.auth import bearer_from, hash_password, issue_token, read_token, verify_password
from ruko.http import LOG, ApiError, handler_wrapper, parse_json_body, response

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$")
MIN_PASSWORD = 8
MAX_PASSWORD = 200


def _credentials(event: dict) -> tuple[str, str]:
    body = parse_json_body(event)

    email = body.get("email")
    if not isinstance(email, str) or not EMAIL_RE.match(email.strip()):
        raise ApiError(400, "bad_email", "Please enter a valid email address.")

    password = body.get("password")
    if not isinstance(password, str) or len(password) < MIN_PASSWORD:
        raise ApiError(
            400, "weak_password", f"Password must be at least {MIN_PASSWORD} characters."
        )
    if len(password) > MAX_PASSWORD:
        raise ApiError(400, "long_password", "That password is too long.")

    return email.strip().lower(), password


def _require_auth(event: dict) -> dict:
    token = bearer_from(event)
    payload = read_token(token) if token else None
    if not payload:
        raise ApiError(401, "unauthorised", "Please sign in again.")
    return payload


@handler_wrapper
def signup(event, context):  # noqa: ANN001, ARG001
    email, password = _credentials(event)

    salt, pw_hash = hash_password(password)
    item, error = family.create_guardian(email, salt, pw_hash)

    if error == "email_taken":
        raise ApiError(409, "email_taken", "An account with this email already exists.")
    if error or not item:
        raise ApiError(500, "signup_failed", "Could not create the account. Please try again.")

    LOG.info("guardian_signup family=%s", item["family_code"])
    return response(
        201,
        {
            "token": issue_token(item["pk"], item["family_code"]),
            "family_code": item["family_code"],
            "email_masked": item["email_masked"],
        },
    )


@handler_wrapper
def login(event, context):  # noqa: ANN001, ARG001
    email, password = _credentials(event)
    item = family.get_guardian(email)

    # Same error either way: never reveal whether an address has an account.
    if not item or not verify_password(password, item.get("pw_salt", ""), item.get("pw_hash", "")):
        raise ApiError(401, "bad_credentials", "Email or password is incorrect.")

    return response(
        200,
        {
            "token": issue_token(item["pk"], item["family_code"]),
            "family_code": item["family_code"],
            "email_masked": item.get("email_masked"),
        },
    )


@handler_wrapper
def alerts(event, context):  # noqa: ANN001, ARG001
    payload = _require_auth(event)
    code = payload["fam"]
    feed = family.get_feed(code)
    return response(
        200,
        {
            "family_code": code,
            "alerts": feed["alerts"],
            "directive": feed["directive"],
        },
    )


@handler_wrapper
def directive(event, context):  # noqa: ANN001, ARG001
    payload = _require_auth(event)
    body = parse_json_body(event)

    action = body.get("action")
    if action not in ("stop", "safe", "clear"):
        raise ApiError(400, "bad_action", "action must be stop, safe or clear.")

    code = payload["fam"]

    if action == "clear":
        family.clear_directive(code)
        return response(200, {"ok": True, "directive": None})

    alert_id = body.get("alert_id")
    if isinstance(alert_id, str) and alert_id.strip():
        family.acknowledge(code, alert_id.strip()[:32])

    note = body.get("note") if isinstance(body.get("note"), str) else None
    result = family.set_directive(code, action, note, payload.get("sub", "")[-8:])
    if result is None:
        raise ApiError(500, "directive_failed", "Could not send that. Please try again.")

    return response(200, {"ok": True, "directive": result})
