"""DynamoDB access: community indicator counts, and the check record.

Privacy shape, which is the point of this module:

- An indicator is stored as **SHA-256 of its normalised form**, never in the
  clear. Two people reporting the same number produce the same hash without the
  number ever being written down.
- Alongside the hash we keep only a masked display string (`98xxxxxx21`), so a
  count can be shown back without revealing whose number it is.
- The check record holds the verdict, never the message text or the image.
"""

from __future__ import annotations

import hashlib
import os
import time
from typing import Iterable

import boto3
from boto3.dynamodb.conditions import Key  # noqa: F401  (kept for future queries)

from .extract import registrable_domain
from .http import LOG

CHECK_TTL_SECONDS = 24 * 60 * 60
INDICATOR_TTL_SECONDS = 180 * 24 * 60 * 60

_table = None


def table():
    global _table
    if _table is None:
        _table = boto3.resource("dynamodb").Table(os.environ["TABLE_NAME"])
    return _table


# --- normalising and hashing ----------------------------------------------


def normalise(kind: str, value: str) -> str:
    value = (value or "").strip().lower()
    if kind == "phone":
        digits = "".join(c for c in value if c.isdigit())
        return digits[-10:]
    if kind == "url":
        value = value.split("://", 1)[-1].split("/", 1)[0].split("?", 1)[0]
        return registrable_domain(value)
    return value


def indicator_key(kind: str, value: str) -> str:
    normalised = normalise(kind, value)
    digest = hashlib.sha256(f"{kind}:{normalised}".encode()).hexdigest()
    return f"IND#{digest}"


def mask(kind: str, value: str) -> str:
    """A display string that proves recognition without revealing the value."""
    normalised = normalise(kind, value)
    if kind == "phone":
        return f"{normalised[:2]}xxxxxx{normalised[-2:]}" if len(normalised) == 10 else "xxxxxxxxxx"
    if kind == "upi":
        name, _, handle = normalised.partition("@")
        head = name[:2] if len(name) > 3 else name[:1]
        return f"{head}{'x' * 4}@{handle}"
    # url: keep the shape of the name and the suffix, hide the rest.
    name, dot, suffix = normalised.partition(".")
    if not dot:
        return normalised
    parts = name.split("-")
    if len(parts) > 1:
        parts[-1] = "xxxx"
        return f"{'-'.join(parts)}.{suffix}"
    hidden = name[:3] + "xxxx" if len(name) > 5 else name
    return f"{hidden}.{suffix}"


def indicators_from(extracted: dict) -> list[tuple[str, str]]:
    """(kind, value) pairs worth counting, de-duplicated."""
    pairs: list[tuple[str, str]] = []
    for value in extracted.get("domains") or extracted.get("urls") or []:
        pairs.append(("url", value))
    for value in extracted.get("upi_ids", []):
        pairs.append(("upi", value))
    for value in extracted.get("phone_numbers", []):
        pairs.append(("phone", value))

    seen: set[str] = set()
    unique: list[tuple[str, str]] = []
    for kind, value in pairs:
        key = indicator_key(kind, value)
        if key not in seen and normalise(kind, value):
            seen.add(key)
            unique.append((kind, value))
    return unique


# --- reads ----------------------------------------------------------------


def report_counts(indicators: Iterable[tuple[str, str]]) -> list[dict]:
    """Community counts for these indicators, most reported first."""
    keys = [{"pk": indicator_key(kind, value)} for kind, value in indicators]
    if not keys:
        return []

    try:
        response = boto3.resource("dynamodb").batch_get_item(
            RequestItems={os.environ["TABLE_NAME"]: {"Keys": keys[:100]}}
        )
    except Exception as exc:  # noqa: BLE001 - community counts are a nice-to-have
        LOG.warning("community_lookup_failed type=%s", type(exc).__name__)
        return []

    items = response.get("Responses", {}).get(os.environ["TABLE_NAME"], [])
    found = [
        {
            "masked": item.get("masked", "unknown"),
            "report_count": int(item.get("report_count", 0)),
        }
        for item in items
        if int(item.get("report_count", 0)) > 0
    ]
    found.sort(key=lambda hit: hit["report_count"], reverse=True)
    return found


def counts_by_masked(hits: list[dict]) -> dict[str, int]:
    return {hit["masked"]: hit["report_count"] for hit in hits}


def get_check(check_id: str) -> dict | None:
    try:
        item = table().get_item(Key={"pk": f"CHK#{check_id}"}).get("Item")
    except Exception as exc:  # noqa: BLE001
        LOG.warning("check_read_failed type=%s", type(exc).__name__)
        return None
    return item


# --- writes ---------------------------------------------------------------


def save_check(check_id: str, verdict: dict, indicators: list[tuple[str, str]], family_code) -> None:
    """Store the verdict for 24 hours so /report can act on it later.

    Only the verdict and the indicator hashes are written. The message text and
    the screenshot are never persisted here.
    """
    item = {
        "pk": f"CHK#{check_id}",
        "verdict": verdict,
        "indicators": [
            {"key": indicator_key(kind, value), "kind": kind, "masked": mask(kind, value)}
            for kind, value in indicators
        ],
        "scam_type": verdict.get("scam_type"),
        "reported": False,
        "created_at": int(time.time()),
        "ttl": int(time.time()) + CHECK_TTL_SECONDS,
    }
    if family_code:
        item["family_code"] = str(family_code)[:64]

    try:
        table().put_item(Item=item)
    except Exception as exc:  # noqa: BLE001 - a failed write must not fail the check
        LOG.warning("check_write_failed check_id=%s type=%s", check_id, type(exc).__name__)


def mark_reported(check_id: str) -> bool:
    """Flag the check as reported. False means it was already reported.

    This is what makes /report idempotent: the counters below only run when this
    returns True, so refreshing the page cannot inflate a count.
    """
    try:
        table().update_item(
            Key={"pk": f"CHK#{check_id}"},
            UpdateExpression="SET reported = :true",
            ConditionExpression="attribute_exists(pk) AND reported = :false",
            ExpressionAttributeValues={":true": True, ":false": False},
        )
        return True
    except Exception as exc:  # noqa: BLE001
        if type(exc).__name__ == "ConditionalCheckFailedException":
            return False
        LOG.warning("mark_reported_failed check_id=%s type=%s", check_id, type(exc).__name__)
        return False


def bump_indicators(indicators: list[dict], scam_type: str | None) -> int:
    """Add one report to each indicator. Returns how many were updated."""
    now = int(time.time())
    updated = 0
    for indicator in indicators:
        try:
            table().update_item(
                Key={"pk": indicator["key"]},
                UpdateExpression=(
                    "SET report_count = if_not_exists(report_count, :zero) + :one, "
                    "kind = :kind, masked = :masked, last_reported = :now, "
                    "last_scam_type = :scam_type, #ttl = :ttl"
                ),
                ExpressionAttributeNames={"#ttl": "ttl"},
                ExpressionAttributeValues={
                    ":zero": 0,
                    ":one": 1,
                    ":kind": indicator.get("kind", "url"),
                    ":masked": indicator.get("masked", "unknown"),
                    ":now": now,
                    ":scam_type": scam_type or "other_scam",
                    ":ttl": now + INDICATOR_TTL_SECONDS,
                },
            )
            updated += 1
        except Exception as exc:  # noqa: BLE001
            LOG.warning("indicator_bump_failed type=%s", type(exc).__name__)
    return updated
