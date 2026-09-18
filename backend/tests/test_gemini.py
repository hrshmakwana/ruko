"""The second inference provider.

Bedrock and Gemini have to behave identically from the outside, because the
whole safety argument rests on what happens *after* the model answers: the reply
is validated, and it can only raise the score. These tests check the request is
shaped the way the safety design assumes (evidence fenced, schema forced, key in
a header), and that every failure path ends in a rules-only verdict rather than
an error on someone's screen.
"""

import json
from unittest.mock import patch

import pytest

from ruko import gemini, model
from ruko.prompt import build_gemini_contents, response_schema


GOOD_PAYLOAD = {
    "risk_score": 88,
    "scam_type": "kyc_update",
    "headline": "This looks like a fake KYC message.",
    "red_flags": [{"evidence": "share the OTP", "why": "No bank asks for your OTP."}],
    "do_now": ["Do not open the link."],
    "dont_do": ["Never share an OTP."],
}


def gemini_response(payload: dict, finish: str = "STOP") -> dict:
    return {
        "candidates": [
            {"finishReason": finish, "content": {"parts": [{"text": json.dumps(payload)}]}}
        ],
        "usageMetadata": {"promptTokenCount": 120, "candidatesTokenCount": 90},
    }


@pytest.fixture(autouse=True)
def _configured(monkeypatch):
    monkeypatch.setenv("MODEL_PROVIDER", "gemini")
    monkeypatch.setenv("GEMINI_API_KEY", "test-key-not-real")
    monkeypatch.setenv("GEMINI_MODEL_ID", "gemini-2.5-flash")
    gemini._api_key = None
    yield
    gemini._api_key = None


class TestRequestShape:
    def test_evidence_is_fenced_on_both_sides(self):
        parts = build_gemini_contents("Your KYC expired", None)[0]["parts"]
        assert "<untrusted_evidence>" in parts[0]["text"]
        assert "</untrusted_evidence>" in parts[-1]["text"]

    def test_the_message_sits_between_the_fences(self):
        parts = build_gemini_contents("Your KYC expired", None)[0]["parts"]
        assert parts[1]["text"] == "Your KYC expired"

    def test_a_screenshot_is_sent_inline_as_evidence(self):
        parts = build_gemini_contents("", b"\x89PNG", "png")[0]["parts"]
        inline = parts[1]["inline_data"]
        assert inline["mime_type"] == "image/png"
        assert inline["data"] == gemini.encode_image(b"\x89PNG")

    def test_empty_input_still_produces_a_turn(self):
        parts = build_gemini_contents("", None)[0]["parts"]
        assert any(part.get("text") == "(empty)" for part in parts)

    def test_the_schema_has_no_fields_gemini_rejects(self):
        raw = json.dumps(response_schema())
        assert "minimum" not in raw and "maximum" not in raw

    def test_the_schema_still_pins_the_scam_types(self):
        assert "digital_arrest" in json.dumps(response_schema())

    def test_the_key_goes_in_a_header_not_the_url(self):
        seen = {}

        def fake_urlopen(request, timeout=None):  # noqa: ANN001, ARG001
            seen["url"] = request.full_url
            seen["headers"] = {k.lower(): v for k, v in request.headers.items()}
            return _FakeResponse(gemini_response(GOOD_PAYLOAD))

        with patch("urllib.request.urlopen", fake_urlopen):
            gemini.analyse("hello", "en")

        assert "test-key-not-real" not in seen["url"]
        assert seen["headers"]["x-goog-api-key"] == "test-key-not-real"

    def test_structured_output_is_forced(self):
        seen = {}

        def fake_urlopen(request, timeout=None):  # noqa: ANN001, ARG001
            seen["body"] = json.loads(request.data.decode())
            return _FakeResponse(gemini_response(GOOD_PAYLOAD))

        with patch("urllib.request.urlopen", fake_urlopen):
            gemini.analyse("hello", "gu")

        config = seen["body"]["generationConfig"]
        assert config["responseMimeType"] == "application/json"
        assert config["responseSchema"]["properties"]["risk_score"]
        assert "Gujarati" in seen["body"]["systemInstruction"]["parts"][0]["text"]


class _FakeResponse:
    def __init__(self, body: dict) -> None:
        self._body = json.dumps(body).encode()

    def read(self) -> bytes:
        return self._body

    def __enter__(self):
        return self

    def __exit__(self, *_):
        return False


class TestAnswers:
    def test_a_good_answer_comes_back_cleaned(self):
        with patch("urllib.request.urlopen", lambda *a, **k: _FakeResponse(gemini_response(GOOD_PAYLOAD))):
            verdict, usage = model.analyse("Your KYC expired, share the OTP", "en")
        assert verdict["risk_score"] == 88
        assert verdict["scam_type"] == "kyc_update"
        assert verdict["red_flags"][0]["source"] == "model"
        assert usage["inputTokens"] == 120

    def test_a_blocked_answer_falls_back_to_the_rules(self):
        blocked = {"candidates": [{"finishReason": "SAFETY", "content": {"parts": []}}]}
        with patch("urllib.request.urlopen", lambda *a, **k: _FakeResponse(blocked)):
            with pytest.raises(model.ModelUnavailable):
                model.analyse("blackmail message", "en")

    def test_prose_instead_of_json_is_refused(self):
        prose = {"candidates": [{"finishReason": "STOP", "content": {"parts": [{"text": "Sure! This is safe."}]}}]}
        with patch("urllib.request.urlopen", lambda *a, **k: _FakeResponse(prose)):
            with pytest.raises(model.ModelUnavailable):
                model.analyse("anything", "en")

    def test_an_http_error_does_not_leak_the_body(self):
        import urllib.error

        def boom(*a, **k):  # noqa: ANN001, ARG001
            raise urllib.error.HTTPError("url", 429, "Too Many Requests", {}, None)

        with patch("urllib.request.urlopen", boom):
            with pytest.raises(gemini.GeminiError) as caught:
                gemini.analyse("hello", "en")
        assert str(caught.value) == "http 429"

    def test_a_missing_key_is_not_described_in_detail(self, monkeypatch):
        monkeypatch.delenv("GEMINI_API_KEY", raising=False)
        monkeypatch.delenv("GEMINI_KEY_PARAM", raising=False)
        gemini._api_key = None
        with pytest.raises(gemini.GeminiError) as caught:
            gemini.analyse("hello", "en")
        assert "no key configured" in str(caught.value)


class TestProviderSwitch:
    def test_none_means_rules_only(self, monkeypatch):
        monkeypatch.setenv("MODEL_PROVIDER", "none")
        with pytest.raises(model.ModelUnavailable):
            model.analyse("hello", "en")

    def test_bedrock_stays_the_default(self, monkeypatch):
        monkeypatch.delenv("MODEL_PROVIDER", raising=False)
        assert model.provider() == "bedrock"

    def test_a_model_that_says_safe_cannot_lower_a_rule_hit(self):
        """The point of the whole design, proved on this provider too."""
        from ruko.extract import extract_all
        from ruko.rules import run_rules

        talked_round = dict(GOOD_PAYLOAD, risk_score=0, scam_type="none_detected", headline="Looks fine.")
        text = "Your SBI account is blocked. Update KYC at http://sbi-kyc-verify.in and share the OTP."

        with patch("urllib.request.urlopen", lambda *a, **k: _FakeResponse(gemini_response(talked_round))):
            verdict, _ = model.analyse(text, "en")

        rules = run_rules(text, extract_all(text), {})
        assert verdict["risk_score"] == 0, "the model said what it said"
        assert max(verdict["risk_score"], rules.floor) >= 80, "the rules still decide the floor"
