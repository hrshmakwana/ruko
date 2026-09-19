"""Live call mode: the signed URL, and the rules over a call transcript.

The two things worth guarding here are privacy and honesty. Nothing about a call
may be stored or logged, and the language the URL asks Transcribe for must be one
Transcribe actually speaks — otherwise the socket closes and the screen looks
broken with no explanation.
"""

import json

import pytest

from handlers import live


def call(path: str, body: dict) -> dict:
    event = {"rawPath": f"/prod{path}", "body": json.dumps(body)}
    result = live.lambda_handler(event, None)
    return {"status": result["statusCode"], "body": json.loads(result["body"])}


class TestStreamingLanguages:
    def test_every_ruko_language_has_a_stream_language(self):
        from ruko.verdict import LANGUAGES

        missing = [lang for lang in LANGUAGES if lang not in live.STREAMING_LANGUAGES]
        assert not missing, f"no Transcribe language for: {missing}"

    def test_only_codes_transcribe_accepted_are_used(self):
        """ur-IN and as-IN were refused by the live service, so they must not appear."""
        accepted = {
            "en-IN", "hi-IN", "bn-IN", "mr-IN", "te-IN", "ta-IN", "gu-IN",
            "kn-IN", "or-IN", "ml-IN", "pa-IN", "ne-NP",
        }
        assert set(live.STREAMING_LANGUAGES.values()) <= accepted

    def test_borrowed_languages_are_declared(self):
        """A language listening in another script must say so on screen."""
        for language, code in live.BORROWED_LANGUAGES.items():
            assert live.STREAMING_LANGUAGES[language] == code


class TestToken:
    @pytest.fixture(autouse=True)
    def _fake_signing(self, monkeypatch):
        monkeypatch.setattr(
            live, "_presigned_websocket_url", lambda code: f"wss://example/{code}?X-Amz-Signature=x"
        )

    def test_returns_a_websocket_url_for_the_language(self):
        out = call("/live/token", {"language": "ta"})
        assert out["status"] == 200
        assert out["body"]["stream_language"] == "ta-IN"
        assert out["body"]["url"].startswith("wss://")

    def test_unknown_language_falls_back_to_english(self):
        assert call("/live/token", {"language": "xx"})["body"]["stream_language"] == "en-IN"

    def test_urdu_is_marked_as_borrowed(self):
        out = call("/live/token", {"language": "ur"})["body"]
        assert out["stream_language"] == "hi-IN"
        assert out["borrowed"] is True

    def test_a_language_with_its_own_model_is_not_borrowed(self):
        assert call("/live/token", {"language": "gu"})["body"]["borrowed"] is False

    def test_the_url_expires(self):
        assert call("/live/token", {"language": "en"})["body"]["expires_in"] <= 300


class TestAnalyse:
    def test_otp_request_in_a_call_is_flagged(self):
        out = call(
            "/live/analyse",
            {"text": "Sir I am calling from the bank, please tell me the OTP you just got.", "language": "en"},
        )
        assert out["status"] == 200
        assert out["body"]["risk_level"] == "scam"
        assert any(a["rule"] == "payment.otp_request" for a in out["body"]["alerts"])

    def test_digital_arrest_in_a_call_is_flagged(self):
        out = call(
            "/live/analyse",
            {"text": "This is CBI. You are under digital arrest, do not cut the video call.", "language": "en"},
        )
        assert out["body"]["scam_type"] == "digital_arrest"

    def test_an_ordinary_call_is_not_flagged(self):
        out = call(
            "/live/analyse",
            {"text": "Hello beta, did you eat? I will send the sweets with your uncle tomorrow.", "language": "en"},
        )
        assert out["body"]["risk_level"] == "no_scam_signs"
        assert out["body"]["alerts"] == []

    def test_reasons_come_back_in_the_chosen_language(self):
        out = call("/live/analyse", {"text": "अभी जो OTP आया है वो बता दीजिए", "language": "hi"})
        why = out["body"]["alerts"][0]["why"]
        assert why and not why.isascii(), "expected the Hindi reason, got English"

    def test_empty_transcript_is_rejected(self):
        assert call("/live/analyse", {"text": "   "})["status"] == 400

    def test_only_the_recent_transcript_is_considered(self):
        """A long call must not grow the request without bound."""
        out = call("/live/analyse", {"text": "hello " * 5000 + "tell me the OTP", "language": "en"})
        assert out["status"] == 200
        assert any(a["rule"] == "payment.otp_request" for a in out["body"]["alerts"])

    def test_the_transcript_is_never_echoed_back(self):
        """Only evidence snippets may come back, never the whole transcript."""
        secret = "my account number is 123456789012"
        out = call("/live/analyse", {"text": f"{secret} and tell me the OTP", "language": "en"})
        assert secret not in json.dumps(out["body"])


class TestPrivacy:
    def test_nothing_is_written_down(self):
        """No storage import at all: a call leaves no trace by construction."""
        source = (live.__file__).replace(".pyc", ".py")
        with open(source, encoding="utf-8") as handle:
            code = handle.read()
        assert "from ruko.store" not in code and "import store" not in code

    def test_the_log_line_carries_no_words(self, caplog):
        text = "please tell me the OTP now"
        with caplog.at_level("INFO"):
            call("/live/analyse", {"text": text, "language": "en"})
        logged = " ".join(record.getMessage() for record in caplog.records)
        assert "OTP now" not in logged
        assert "live_analyse" in logged


class TestOneAlertPerCall:
    """A call is analysed every second; the guardian must be told once.

    Without this the alarm fires on every sentence the scammer says, and an
    alarm that fires thirty times is an alarm nobody looks at again.
    """

    def test_repeat_live_alerts_collapse_into_one(self, monkeypatch):
        from ruko import family

        written = []
        now = [1_000_000]

        class FakeTable:
            def get_item(self, Key):  # noqa: N803, ARG002
                return {"Item": {"alerts": list(written)}} if written else {}

            def put_item(self, Item):  # noqa: N803
                written.clear()
                written.extend(Item["alerts"])

        monkeypatch.setattr(family, "table", lambda: FakeTable())
        monkeypatch.setattr(family.notify, "publish_alert", lambda *a, **k: None)
        monkeypatch.setattr(family.time, "time", lambda: now[0])

        alert = {"kind": "live_call", "risk_level": "scam", "risk_score": 80, "headline": "heard it"}
        first = family.add_alert("BCD234", alert)
        second = family.add_alert("BCD234", alert)

        assert first == second, "the second alert should reuse the first"
        assert len(written) == 1

        # A new call, two minutes later, is a new event.
        now[0] += family.REPEAT_WINDOW_SECONDS + 1
        family.add_alert("BCD234", alert)
        assert len(written) == 2

    def test_a_checked_message_is_never_deduped(self, monkeypatch):
        """Two scam messages in a row are two things worth knowing about."""
        from ruko import family

        written = []

        class FakeTable:
            def get_item(self, Key):  # noqa: N803, ARG002
                return {"Item": {"alerts": list(written)}} if written else {}

            def put_item(self, Item):  # noqa: N803
                written.clear()
                written.extend(Item["alerts"])

        monkeypatch.setattr(family, "table", lambda: FakeTable())
        monkeypatch.setattr(family.notify, "publish_alert", lambda *a, **k: None)

        alert = {"kind": "scam", "risk_level": "scam", "risk_score": 90, "headline": "a scam"}
        family.add_alert("BCD234", alert)
        family.add_alert("BCD234", alert)
        assert len(written) == 2
