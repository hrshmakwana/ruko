"""Screenshots must never be reported as clear when nothing read them.

This file exists because of a real failure: uploading a blatant fake-SBI
screenshot returned "We found no scam signs in this message." The image could
only be read by the model, the model was unavailable, so the rules saw an empty
string and scored it 0 — and Ruko told someone a scam looked fine.
"""

import json
import os

import pytest

os.environ.setdefault("TABLE_NAME", "ruko-test")
os.environ.setdefault("UPLOADS_BUCKET", "ruko-test-bucket")
os.environ.setdefault("BEDROCK_MODEL_ID", "test-model")

from handlers import check as check_handler  # noqa: E402
from ruko import family, store  # noqa: E402
from ruko.model import ModelUnavailable  # noqa: E402
from ruko.ocr import OcrUnavailable  # noqa: E402

SCAM_SCREENSHOT_TEXT = (
    "Dear Customer, your SBI account will be BLOCKED\n"
    "today as your KYC has expired. Update immediately\n"
    "at http://sbi-kyc-verify.in to avoid deactivation. For\n"
    "help call 9876543210. -SBI"
)


@pytest.fixture(autouse=True)
def isolate(monkeypatch):
    monkeypatch.setattr(store, "report_counts", lambda indicators: [])
    monkeypatch.setattr(store, "save_check", lambda *a, **k: None)
    monkeypatch.setattr(family, "add_alert", lambda *a, **k: None)
    # No model anywhere in this file: this is the Bedrock-is-down path.
    monkeypatch.setattr(
        check_handler, "analyse", lambda *a, **k: (_ for _ in ()).throw(ModelUnavailable("down"))
    )
    monkeypatch.setattr(check_handler, "_load_image", lambda key: (b"fake-image-bytes", "png"))


def call(body: dict) -> dict:
    result = check_handler.lambda_handler({"body": json.dumps(body)}, None)
    return json.loads(result["body"])


class TestOcrReadsTheScreenshot:
    @pytest.fixture(autouse=True)
    def ocr_works(self, monkeypatch):
        monkeypatch.setattr(check_handler, "read_text", lambda b: SCAM_SCREENSHOT_TEXT)

    def test_scam_screenshot_is_caught_without_the_model(self):
        """The bug, in one assertion."""
        verdict = call({"image_key": "uploads/x.png", "language": "en"})
        assert verdict["risk_level"] == "scam"
        assert verdict["risk_score"] >= 80

    def test_rules_run_on_the_screenshot_text(self):
        verdict = call({"image_key": "uploads/x.png", "language": "en"})
        assert "link.brand_lookalike" in verdict["rule_hits"]
        assert "phrase.kyc_threat" in verdict["rule_hits"]

    def test_indicators_are_extracted_from_the_image(self):
        verdict = call({"image_key": "uploads/x.png", "language": "en"})
        assert "http://sbi-kyc-verify.in" in verdict["extracted"]["urls"]
        assert "9876543210" in verdict["extracted"]["phone_numbers"]

    def test_what_was_read_is_returned(self):
        """Shown back to the person, so "checked" is distinguishable from "not read"."""
        verdict = call({"image_key": "uploads/x.png", "language": "en"})
        assert verdict["screenshot_text"] == SCAM_SCREENSHOT_TEXT
        assert verdict["image_unread"] is False

    def test_pasted_text_and_screenshot_are_both_used(self):
        verdict = call(
            {"text": "Also they want my OTP", "image_key": "uploads/x.png", "language": "en"}
        )
        assert "payment.otp_request" in verdict["rule_hits"]
        assert "link.brand_lookalike" in verdict["rule_hits"]


class TestUnreadableScreenshot:
    @pytest.fixture(autouse=True)
    def ocr_fails(self, monkeypatch):
        def boom(_bytes):
            raise OcrUnavailable("textract down")

        monkeypatch.setattr(check_handler, "read_text", boom)

    def test_never_claims_no_scam_signs(self):
        verdict = call({"image_key": "uploads/x.png", "language": "en"})
        assert verdict["image_unread"] is True
        assert "no scam signs" not in verdict["headline"].lower()

    def test_says_it_could_not_read_it(self):
        verdict = call({"image_key": "uploads/x.png", "language": "en"})
        assert "could not read" in verdict["headline"].lower()

    def test_marked_partial(self):
        assert call({"image_key": "uploads/x.png", "language": "en"})["partial"] is True

    def test_translated(self):
        verdict = call({"image_key": "uploads/x.png", "language": "ta"})
        assert verdict["image_unread"] is True
        assert any("஀" <= ch <= "௿" for ch in verdict["headline"]), "expected Tamil"

    def test_pasted_text_still_judged_on_its_own(self):
        """A failed OCR must not throw away the text they typed."""
        verdict = call(
            {
                "text": "Your KYC expired, update at http://sbi-kyc-verify.in",
                "image_key": "uploads/x.png",
                "language": "en",
            }
        )
        assert verdict["risk_level"] == "scam"
        # There was text to judge, so this is a real verdict, not an unread image.
        assert verdict["image_unread"] is False


class TestTextOnlyUnaffected:
    def test_no_image_means_no_unread_flag(self, monkeypatch):
        monkeypatch.setattr(check_handler, "read_text", lambda b: "")
        verdict = call({"text": "Are we still meeting at 6pm?", "language": "en"})
        assert verdict["image_unread"] is False
        assert verdict["screenshot_text"] is None
        assert verdict["risk_level"] == "no_scam_signs"
