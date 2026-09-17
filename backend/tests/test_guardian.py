"""Guardian accounts, tokens, and the JSON encoding that broke once.

The Decimal test exists because DynamoDB returns Decimal for every number, so a
handler that works when a field is unset 500s the moment it is set. That bug
only appeared on the live API, on one endpoint, once a directive existed.
"""

import json
import os
from decimal import Decimal

import pytest

os.environ.setdefault("TABLE_NAME", "ruko-test")

from ruko import auth, family  # noqa: E402
from ruko.http import response  # noqa: E402


@pytest.fixture(autouse=True)
def fixed_signing_key(monkeypatch):
    monkeypatch.setattr(auth, "_signing_key", b"test-key-not-a-real-one")


class TestPasswords:
    def test_round_trip(self):
        salt, digest = auth.hash_password("correct-horse-battery")
        assert auth.verify_password("correct-horse-battery", salt, digest)

    def test_wrong_password_rejected(self):
        salt, digest = auth.hash_password("correct-horse-battery")
        assert not auth.verify_password("wrong-password", salt, digest)

    def test_salt_makes_hashes_differ(self):
        _, a = auth.hash_password("same-password")
        _, b = auth.hash_password("same-password")
        assert a != b, "identical hashes mean the salt is not being used"

    def test_password_is_never_stored(self):
        salt, digest = auth.hash_password("my-secret-password")
        assert "my-secret-password" not in salt + digest


class TestTokens:
    def test_round_trip(self):
        token = auth.issue_token("GUA#abc", "PMPFKR")
        payload = auth.read_token(token)
        assert payload["sub"] == "GUA#abc"
        assert payload["fam"] == "PMPFKR"

    def test_tampered_payload_rejected(self):
        token = auth.issue_token("GUA#abc", "PMPFKR")
        body, signature = token.split(".")
        forged = auth._b64(b'{"sub":"GUA#evil","fam":"AAAAAA","exp":9999999999}')
        assert auth.read_token(f"{forged}.{signature}") is None

    def test_garbage_rejected(self):
        for bad in ["", "nonsense", "a.b", "....", None]:
            assert auth.read_token(bad) is None

    def test_expired_rejected(self, monkeypatch):
        monkeypatch.setattr(auth, "TOKEN_TTL_SECONDS", -1)
        assert auth.read_token(auth.issue_token("GUA#abc", "PMPFKR")) is None

    def test_bearer_header_is_case_insensitive(self):
        event = {"headers": {"Authorization": "Bearer abc123"}}
        assert auth.bearer_from(event) == "abc123"
        assert auth.bearer_from({"headers": {"authorization": "bearer xyz"}}) == "xyz"

    def test_missing_header(self):
        assert auth.bearer_from({}) is None
        assert auth.bearer_from({"headers": {"authorization": "Basic abc"}}) is None


class TestFamilyCodes:
    def test_code_shape(self):
        code = family.new_family_code()
        assert len(code) == family.CODE_LENGTH
        assert all(c in family.CODE_ALPHABET for c in code)

    def test_code_avoids_confusable_characters(self):
        """Codes get read out over the phone, so 0/O and 1/I are excluded."""
        for confusable in "01OI":
            assert confusable not in family.CODE_ALPHABET

    def test_normalise_accepts_lowercase_and_spaces(self):
        assert family.normalise_code(" pmp fkr ") == "PMPFKR"

    def test_normalise_drops_unusable_characters(self):
        assert family.normalise_code("PMP-FKR!") == "PMPFKR"


class TestEmailMasking:
    def test_masks_the_local_part(self):
        assert family.mask_email("harsh@example.com") == "ha****@example.com"

    def test_short_name_masked_harder(self):
        assert family.mask_email("ab@example.com") == "a****@example.com"

    def test_guardian_key_is_a_hash(self):
        key = family.guardian_key("harsh@example.com")
        assert key.startswith("GUA#")
        assert "harsh" not in key
        assert "example.com" not in key

    def test_guardian_key_is_case_insensitive(self):
        assert family.guardian_key("A@b.com") == family.guardian_key("a@B.com")


class TestJsonEncoding:
    def test_decimal_survives_serialisation(self):
        """DynamoDB returns Decimal for every stored number."""
        body = json.loads(response(200, {"at": Decimal("1789622928")})["body"])
        assert body["at"] == 1789622928

    def test_fractional_decimal_becomes_float(self):
        body = json.loads(response(200, {"score": Decimal("1.5")})["body"])
        assert body["score"] == 1.5

    def test_nested_decimal(self):
        payload = {"directive": {"at": Decimal("12"), "action": "stop"}}
        body = json.loads(response(200, payload)["body"])
        assert body["directive"]["at"] == 12

    def test_unserialisable_still_raises(self):
        with pytest.raises(TypeError):
            response(200, {"bad": object()})


class TestDirectiveCleaning:
    def test_decimal_timestamps_are_cast(self):
        cleaned = family._clean_directive(
            {"action": "stop", "note": "hang up", "by": "abc", "at": Decimal("99")}
        )
        assert cleaned == {"action": "stop", "note": "hang up", "by": "abc", "at": 99}

    def test_none_stays_none(self):
        assert family._clean_directive(None) is None
