"""Every supported language must be supported everywhere.

A language in the dropdown with no fallback text behind it means someone picks
their own language and gets English safety advice. These tests make that a
build failure rather than a surprise.
"""

import pytest

from ruko.fallback import _TEXT
from ruko.prompt import LANGUAGE_NAMES, system_prompt
from ruko.rule_text import REASONS, reason_for
from ruko.rules import run_rules
from ruko.extract import extract_all
from ruko.verdict import LANGUAGES, normalise_language

# Every rule that can reach the screen must have a translation in every
# language. Collected from the *engine*, not from the translations file: reading
# it from REASONS["en"] let two new rules ship with no translation at all,
# because a rule missing from English was never asked about.
from ruko.rules import _PHRASE_RULES  # noqa: E402

_ENGINE_RULE_IDS = {rule_id for rule_id, *_ in _PHRASE_RULES} | {
    "link.shortener", "link.brand_lookalike", "link.punycode", "link.risky_tld",
    "link.raw_ip", "link.apk_download", "payment.otp_request",
    "payment.upi_collect_trap", "community.reported", "ai.injection",
}
ALL_RULE_IDS = sorted(_ENGINE_RULE_IDS | set(REASONS["en"]))

REQUIRED_FALLBACK_KEYS = {
    "scam",
    "suspicious",
    "no_scam_signs",
    "do_now",
    "dont_do",
    "do_now_clean",
    "dont_do_clean",
}


def test_fifteen_languages():
    assert len(LANGUAGES) == 15
    assert len(set(LANGUAGES)) == 15, "duplicate language code"


@pytest.mark.parametrize("language", LANGUAGES)
class TestEveryLanguage:
    def test_has_fallback_text(self, language):
        assert language in _TEXT, f"{language} has no rules-only fallback text"

    def test_fallback_is_complete(self, language):
        assert REQUIRED_FALLBACK_KEYS <= set(_TEXT[language])

    def test_fallback_is_not_left_in_english(self, language):
        """A copy-paste of the English block would silently ship English."""
        if language == "en":
            return
        assert _TEXT[language]["scam"] != _TEXT["en"]["scam"]

    def test_has_a_prompt_name(self, language):
        assert language in LANGUAGE_NAMES

    def test_prompt_names_the_language(self, language):
        assert LANGUAGE_NAMES[language] in system_prompt(language)

    def test_has_every_rule_reason(self, language):
        missing = [rule for rule in ALL_RULE_IDS if rule not in REASONS.get(language, {})]
        assert not missing, f"{language} is missing rule reasons: {missing}"

    def test_rule_reasons_are_not_left_in_english(self, language):
        if language == "en":
            return
        same = [
            rule
            for rule in ALL_RULE_IDS
            if REASONS[language][rule] == REASONS["en"][rule]
        ]
        assert not same, f"{language} still has the English text for: {same}"

    def test_templates_keep_their_placeholders(self, language):
        """A dropped {real} would render "The real one is ." to a real person."""
        for rule in ALL_RULE_IDS:
            for field in ("{brand}", "{real}", "{tld}", "{count}"):
                if field in REASONS["en"][rule]:
                    assert field in REASONS[language][rule], f"{language}/{rule} lost {field}"


class TestRenderedReasons:
    def test_brand_lookalike_fills_in_both_names(self):
        rendered = reason_for(
            "link.brand_lookalike", "ta", "fallback", {"brand": "SBI", "real": "sbi.co.in"}
        )
        assert "SBI" in rendered and "sbi.co.in" in rendered
        assert "{" not in rendered

    def test_every_fired_rule_can_be_rendered_in_every_language(self):
        """Walk a message that trips a lot of rules, in all 15 languages."""
        text = (
            "Your KYC expired, account blocked today. Share your OTP. "
            "Update at http://sbi-kyc-verify.in/app.apk within 10 minutes. "
            "Do not tell anyone."
        )
        result = run_rules(text, extract_all(text), {"98xxxxxx10": 7})
        assert len(result.hits) >= 5, "expected this message to trip several rules"
        for language in LANGUAGES:
            for hit in result.hits:
                rendered = reason_for(hit.id, language, hit.reason, hit.params)
                assert rendered, f"{language}/{hit.id} rendered empty"
                assert "{" not in rendered, f"{language}/{hit.id} left a placeholder: {rendered}"


class TestNormalisation:
    def test_regional_tag_is_stripped(self):
        assert normalise_language("ta-IN") == "ta"

    def test_three_letter_code_survives(self):
        """Truncating to two characters would turn Maithili into Marathi."""
        assert normalise_language("mai") == "mai"

    def test_case_insensitive(self):
        assert normalise_language("MR") == "mr"

    def test_unknown_falls_back_to_english(self):
        assert normalise_language("xx") == "en"
        assert normalise_language(None) == "en"
        assert normalise_language(123) == "en"
