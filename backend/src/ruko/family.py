"""The guardian side: families, alerts, and the directive that goes back.

The shape of the problem: a parent checks something and it is a scam. Somebody
who loves them needs to know **now**, and needs a way to say "stop" that lands
on the parent's screen while the scammer is still on the line.

Storage is deliberately two items per family:

- ``FAM#<code>``   the family and which guardian owns it
- ``FAMFEED#<code>`` a single item holding the last 20 alerts and the current
  directive

One item for the whole feed means the dashboard is a single read and the parent
poll is a single read, which keeps both cheap enough to poll every few seconds.
"""

from __future__ import annotations

import hashlib
import os
import random
import string
import time
import uuid

import boto3

from .http import LOG

MAX_ALERTS = 20
DIRECTIVE_TTL_SECONDS = 180  # a guardian's "stop" is about right now, not later
FAMILY_TTL_SECONDS = 180 * 24 * 60 * 60

# No vowels and no 0/O/1/I: family codes get read aloud over the phone.
CODE_ALPHABET = "BCDFGHJKLMNPQRSTVWXYZ23456789"
CODE_LENGTH = 6

_table = None


def table():
    global _table
    if _table is None:
        _table = boto3.resource("dynamodb").Table(os.environ["TABLE_NAME"])
    return _table


def guardian_key(email: str) -> str:
    """Accounts are keyed by a hash, so the table never holds a plain address."""
    normalised = (email or "").strip().lower()
    return "GUA#" + hashlib.sha256(normalised.encode()).hexdigest()


def mask_email(email: str) -> str:
    name, _, domain = (email or "").strip().lower().partition("@")
    if not domain:
        return "unknown"
    head = name[:2] if len(name) > 3 else name[:1]
    return f"{head}{'*' * 4}@{domain}"


def new_family_code() -> str:
    return "".join(random.choice(CODE_ALPHABET) for _ in range(CODE_LENGTH))


def normalise_code(code: str) -> str:
    return "".join(c for c in (code or "").upper() if c in CODE_ALPHABET)[:CODE_LENGTH]


# --- guardians -------------------------------------------------------------


def get_guardian(email: str) -> dict | None:
    try:
        return table().get_item(Key={"pk": guardian_key(email)}).get("Item")
    except Exception as exc:  # noqa: BLE001
        LOG.warning("guardian_read_failed type=%s", type(exc).__name__)
        return None


def create_guardian(email: str, salt: str, pw_hash: str) -> tuple[dict | None, str | None]:
    """Create the account and its family. Returns (item, error_code)."""
    now = int(time.time())
    code = new_family_code()

    item = {
        "pk": guardian_key(email),
        "email_masked": mask_email(email),
        "pw_salt": salt,
        "pw_hash": pw_hash,
        "family_code": code,
        "created_at": now,
    }
    try:
        table().put_item(Item=item, ConditionExpression="attribute_not_exists(pk)")
    except Exception as exc:  # noqa: BLE001
        if type(exc).__name__ == "ConditionalCheckFailedException":
            return None, "email_taken"
        LOG.warning("guardian_create_failed type=%s", type(exc).__name__)
        return None, "write_failed"

    try:
        table().put_item(
            Item={
                "pk": f"FAM#{code}",
                "family_code": code,
                "guardian": item["pk"],
                "guardian_masked": item["email_masked"],
                "created_at": now,
                "ttl": now + FAMILY_TTL_SECONDS,
            }
        )
    except Exception as exc:  # noqa: BLE001
        LOG.warning("family_create_failed type=%s", type(exc).__name__)

    return item, None


def family_exists(code: str) -> bool:
    code = normalise_code(code)
    if len(code) != CODE_LENGTH:
        return False
    try:
        return bool(table().get_item(Key={"pk": f"FAM#{code}"}).get("Item"))
    except Exception as exc:  # noqa: BLE001
        LOG.warning("family_read_failed type=%s", type(exc).__name__)
        return False


# --- alerts ----------------------------------------------------------------


def _feed_key(code: str) -> str:
    return f"FAMFEED#{normalise_code(code)}"


def add_alert(code: str, alert: dict) -> str | None:
    """Push an alert onto the family feed, newest first, capped.

    Never raises: an alert failing to write must not break the check that
    triggered it.
    """
    code = normalise_code(code)
    if len(code) != CODE_LENGTH:
        return None

    now = int(time.time())
    alert_id = uuid.uuid4().hex[:12]
    entry = {
        "id": alert_id,
        "at": now,
        "kind": alert.get("kind", "scam"),
        "risk_level": alert.get("risk_level"),
        "risk_score": int(alert.get("risk_score", 0)),
        "scam_type": alert.get("scam_type"),
        # The headline only. The guardian never sees the raw message.
        "headline": str(alert.get("headline", ""))[:200],
        "language": alert.get("language", "en"),
        "check_id": alert.get("check_id"),
        "acknowledged": False,
    }

    try:
        feed = table().get_item(Key={"pk": _feed_key(code)}).get("Item") or {}
        alerts = [entry] + list(feed.get("alerts") or [])[: MAX_ALERTS - 1]
        table().put_item(
            Item={
                "pk": _feed_key(code),
                "family_code": code,
                "alerts": alerts,
                "directive": feed.get("directive"),
                "updated_at": now,
                "ttl": now + FAMILY_TTL_SECONDS,
            }
        )
        LOG.info("alert_added family=%s kind=%s id=%s", code, entry["kind"], alert_id)
        return alert_id
    except Exception as exc:  # noqa: BLE001
        LOG.warning("alert_write_failed type=%s", type(exc).__name__)
        return None


def get_feed(code: str) -> dict:
    try:
        item = table().get_item(Key={"pk": _feed_key(code)}).get("Item") or {}
    except Exception as exc:  # noqa: BLE001
        LOG.warning("feed_read_failed type=%s", type(exc).__name__)
        item = {}

    directive = item.get("directive")
    if directive and int(directive.get("at", 0)) + DIRECTIVE_TTL_SECONDS < time.time():
        directive = None  # expired; a stale "stop" is worse than none

    return {
        "alerts": [_clean_alert(a) for a in (item.get("alerts") or [])],
        "directive": _clean_directive(directive),
    }


def _clean_directive(directive: dict | None) -> dict | None:
    if not directive:
        return None
    return {
        "action": directive.get("action"),
        "note": directive.get("note"),
        "by": directive.get("by"),
        "at": int(directive.get("at", 0)),
    }


def _clean_alert(alert: dict) -> dict:
    return {
        "id": alert.get("id"),
        "at": int(alert.get("at", 0)),
        "kind": alert.get("kind", "scam"),
        "risk_level": alert.get("risk_level"),
        "risk_score": int(alert.get("risk_score", 0)),
        "scam_type": alert.get("scam_type"),
        "headline": alert.get("headline", ""),
        "language": alert.get("language", "en"),
        "acknowledged": bool(alert.get("acknowledged")),
    }


def set_directive(code: str, action: str, note: str | None, by: str) -> dict | None:
    """The guardian's answer, which the parent's screen is polling for."""
    code = normalise_code(code)
    directive = {
        "action": action,
        "note": (note or "")[:200] or None,
        "by": by,
        "at": int(time.time()),
    }
    try:
        table().update_item(
            Key={"pk": _feed_key(code)},
            UpdateExpression="SET directive = :d, updated_at = :now, #ttl = :ttl",
            ExpressionAttributeNames={"#ttl": "ttl"},
            ExpressionAttributeValues={
                ":d": directive,
                ":now": directive["at"],
                ":ttl": directive["at"] + FAMILY_TTL_SECONDS,
            },
        )
        LOG.info("directive_set family=%s action=%s", code, action)
        return directive
    except Exception as exc:  # noqa: BLE001
        LOG.warning("directive_write_failed type=%s", type(exc).__name__)
        return None


def clear_directive(code: str) -> None:
    try:
        table().update_item(
            Key={"pk": _feed_key(code)},
            UpdateExpression="REMOVE directive",
        )
    except Exception as exc:  # noqa: BLE001
        LOG.warning("directive_clear_failed type=%s", type(exc).__name__)


def acknowledge(code: str, alert_id: str) -> None:
    try:
        item = table().get_item(Key={"pk": _feed_key(code)}).get("Item") or {}
        alerts = list(item.get("alerts") or [])
        for alert in alerts:
            if alert.get("id") == alert_id:
                alert["acknowledged"] = True
        table().update_item(
            Key={"pk": _feed_key(code)},
            UpdateExpression="SET alerts = :a",
            ExpressionAttributeValues={":a": alerts},
        )
    except Exception as exc:  # noqa: BLE001
        LOG.warning("ack_failed type=%s", type(exc).__name__)
