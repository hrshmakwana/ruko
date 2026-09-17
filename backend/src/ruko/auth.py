"""Guardian accounts: password hashing and signed tokens.

Deliberately small and dependency-free — everything here is in the standard
library, so there is no bcrypt/JWT package to vendor into the Lambda.

Two things worth knowing:

- The signing key is generated once and kept in the table, created with a
  conditional write so two cold starts racing each other cannot both win. It is
  never in the repo and never in an environment variable.
- Checking a message stays anonymous. An account exists only for the guardian,
  because you cannot send an alert to nobody.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import time

import boto3

from .http import LOG

PBKDF2_ROUNDS = 210_000
TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60  # a month; guardians should not re-login often
SIGNING_KEY_PK = "SYS#signing-key"

_signing_key: bytes | None = None
_table = None


def _tbl():
    global _table
    if _table is None:
        _table = boto3.resource("dynamodb").Table(os.environ["TABLE_NAME"])
    return _table


def signing_key() -> bytes:
    """Fetch the signing key, creating it exactly once."""
    global _signing_key
    if _signing_key is not None:
        return _signing_key

    fresh = secrets.token_hex(32)
    try:
        _tbl().put_item(
            Item={"pk": SIGNING_KEY_PK, "key": fresh, "created_at": int(time.time())},
            ConditionExpression="attribute_not_exists(pk)",
        )
        _signing_key = fresh.encode()
        LOG.info("signing_key_created")
    except Exception as exc:  # noqa: BLE001 - the expected path once it exists
        if type(exc).__name__ != "ConditionalCheckFailedException":
            LOG.warning("signing_key_create_failed type=%s", type(exc).__name__)
        item = _tbl().get_item(Key={"pk": SIGNING_KEY_PK}).get("Item") or {}
        existing = item.get("key")
        if not existing:
            raise RuntimeError("signing key unavailable") from exc
        _signing_key = str(existing).encode()

    return _signing_key


# --- passwords -------------------------------------------------------------


def hash_password(password: str) -> tuple[str, str]:
    """Returns (salt, hash), both hex."""
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), PBKDF2_ROUNDS)
    return salt, digest.hex()


def verify_password(password: str, salt: str, expected: str) -> bool:
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), PBKDF2_ROUNDS)
    # Constant time: a timing difference here leaks whether the prefix matched.
    return hmac.compare_digest(digest.hex(), expected)


# --- tokens ----------------------------------------------------------------


def _b64(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


def _unb64(text: str) -> bytes:
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def issue_token(guardian_key: str, family_code: str) -> str:
    payload = {
        "sub": guardian_key,
        "fam": family_code,
        "exp": int(time.time()) + TOKEN_TTL_SECONDS,
    }
    body = _b64(json.dumps(payload, separators=(",", ":")).encode())
    signature = hmac.new(signing_key(), body.encode(), hashlib.sha256).digest()
    return f"{body}.{_b64(signature)}"


def read_token(token: str) -> dict | None:
    """Verify and decode. Returns None for anything not currently valid."""
    try:
        body, signature = token.split(".", 1)
    except (ValueError, AttributeError):
        return None

    expected = hmac.new(signing_key(), body.encode(), hashlib.sha256).digest()
    if not hmac.compare_digest(_b64(expected), signature):
        return None

    try:
        payload = json.loads(_unb64(body))
    except (ValueError, TypeError):
        return None

    if not isinstance(payload, dict) or payload.get("exp", 0) < time.time():
        return None
    return payload


def bearer_from(event: dict) -> str | None:
    headers = {k.lower(): v for k, v in (event.get("headers") or {}).items()}
    value = headers.get("authorization") or ""
    return value[7:].strip() if value.lower().startswith("bearer ") else None
