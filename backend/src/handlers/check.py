"""POST /check - the verdict endpoint.

Day 1: a stub that validates the request properly and returns a fixed verdict in
the real schema, so the frontend can be built against the contract straight away.
The rules engine and the Bedrock call replace the stubbed body on Day 2.
"""

from __future__ import annotations

import time
import uuid

from ruko.http import LOG, ApiError, handler_wrapper, parse_json_body, response
from ruko.verdict import MAX_TEXT_CHARS, build_verdict, normalise_language

# A fixed sample verdict, written out per language. Replaced by the model on Day 2.
_STUB = {
    "en": {
        "headline": "This looks like a fake KYC message trying to steal your bank login.",
        "red_flags": [
            {
                "evidence": "your account will be blocked today",
                "why": "Real banks do not threaten to block an account the same day over SMS.",
                "source": "rule",
            },
            {
                "evidence": "sbi-kyc-verify.in",
                "why": "This is not an SBI website. The real one is onlinesbi.sbi",
                "source": "rule",
            },
        ],
        "do_now": [
            "Do not open the link.",
            "Call the number printed on the back of your bank card.",
            "Delete the message and block the sender.",
        ],
        "dont_do": [
            "Never share an OTP, PIN or password, not even with a bank employee.",
            "Do not install any app the message asks you to install.",
        ],
    },
    "hi": {
        "headline": "यह नकली KYC संदेश लगता है जो आपका बैंक लॉगिन चुराना चाहता है।",
        "red_flags": [
            {
                "evidence": "आज आपका खाता बंद हो जाएगा",
                "why": "असली बैंक SMS पर उसी दिन खाता बंद करने की धमकी नहीं देते।",
                "source": "rule",
            },
            {
                "evidence": "sbi-kyc-verify.in",
                "why": "यह SBI की वेबसाइट नहीं है। असली वेबसाइट onlinesbi.sbi है।",
                "source": "rule",
            },
        ],
        "do_now": [
            "लिंक बिल्कुल न खोलें।",
            "अपने बैंक कार्ड के पीछे लिखे नंबर पर फ़ोन करें।",
            "संदेश हटा दें और भेजने वाले को ब्लॉक करें।",
        ],
        "dont_do": [
            "OTP, PIN या पासवर्ड किसी को न बताएं, बैंक कर्मचारी को भी नहीं।",
            "संदेश में बताया गया कोई ऐप इंस्टॉल न करें।",
        ],
    },
    "gu": {
        "headline": "આ નકલી KYC સંદેશ લાગે છે જે તમારું બેંક લૉગિન ચોરવા માગે છે.",
        "red_flags": [
            {
                "evidence": "આજે તમારું ખાતું બંધ થઈ જશે",
                "why": "સાચી બેંક SMS પર એ જ દિવસે ખાતું બંધ કરવાની ધમકી આપતી નથી.",
                "source": "rule",
            },
            {
                "evidence": "sbi-kyc-verify.in",
                "why": "આ SBI ની વેબસાઇટ નથી. સાચી વેબસાઇટ onlinesbi.sbi છે.",
                "source": "rule",
            },
        ],
        "do_now": [
            "લિંક બિલકુલ ન ખોલો.",
            "તમારા બેંક કાર્ડની પાછળ લખેલા નંબર પર ફોન કરો.",
            "સંદેશ કાઢી નાખો અને મોકલનારને બ્લોક કરો.",
        ],
        "dont_do": [
            "OTP, PIN કે પાસવર્ડ કોઈને ન આપો, બેંક કર્મચારીને પણ નહીં.",
            "સંદેશમાં કહેલી કોઈ એપ ઇન્સ્ટોલ ન કરો.",
        ],
    },
}


def _read_request(event: dict) -> tuple[str, str | None, str, str | None]:
    body = parse_json_body(event)

    text = body.get("text") or ""
    if not isinstance(text, str):
        raise ApiError(400, "bad_text", "text must be a string.")
    text = text.strip()
    if len(text) > MAX_TEXT_CHARS:
        raise ApiError(400, "text_too_long", f"Message must be under {MAX_TEXT_CHARS} characters.")

    image_key = body.get("image_key")
    if image_key is not None:
        if not isinstance(image_key, str) or not image_key.startswith("uploads/"):
            raise ApiError(400, "bad_image_key", "image_key is not a valid upload key.")

    if not text and not image_key:
        raise ApiError(400, "empty_input", "Paste a message or upload a screenshot to check.")

    family_code = body.get("family_code")
    if family_code is not None and not isinstance(family_code, str):
        raise ApiError(400, "bad_family_code", "family_code must be a string.")

    return text, image_key, normalise_language(body.get("language")), family_code


@handler_wrapper
def lambda_handler(event, context):  # noqa: ANN001, ARG001
    started = time.perf_counter()
    text, image_key, language, _family_code = _read_request(event)

    check_id = uuid.uuid4().hex
    stub = _STUB[language]

    verdict = build_verdict(
        check_id=check_id,
        risk_score=88,
        scam_type="kyc_update",
        headline=stub["headline"],
        red_flags=stub["red_flags"],
        do_now=stub["do_now"],
        dont_do=stub["dont_do"],
        language=language,
        rule_hits=["stub.fixed_verdict"],
        engine="stub",
    )

    # Log identifiers and timings only - never the message text or the image.
    LOG.info(
        "check_done check_id=%s lang=%s has_text=%s has_image=%s ms=%d engine=stub",
        check_id,
        language,
        bool(text),
        bool(image_key),
        int((time.perf_counter() - started) * 1000),
    )

    return response(200, verdict)
