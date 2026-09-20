"""POST /check - the verdict endpoint.

The pipeline, and the one rule that matters:

    final_score = max(model_score, rules_floor)

The rules can push the score up. Nothing the model says - and so nothing a
scammer can write into their own message - can push it back down.
"""

from __future__ import annotations

import os
import time
import uuid

import boto3

from ruko import family, store
from ruko.extract import extract_all
from ruko.fallback import text as fallback_text
from ruko.http import LOG, ApiError, handler_wrapper, parse_json_body, response
from ruko.model import ModelUnavailable, analyse
from ruko.ocr import OcrUnavailable, read_text
from ruko.rule_text import reason_for
from ruko.rules import SEVERITY_FLOOR, RuleHit, run_rules
from ruko.verdict import MAX_TEXT_CHARS, build_verdict, level_from_score, normalise_language

MAX_IMAGE_BYTES = 5 * 1024 * 1024

_s3 = None


def _s3_client():
    global _s3
    if _s3 is None:
        _s3 = boto3.client("s3")
    return _s3


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
        if (
            not isinstance(image_key, str)
            or not image_key.startswith("uploads/")
            or ".." in image_key
        ):
            raise ApiError(400, "bad_image_key", "image_key is not a valid upload key.")

    if not text and not image_key:
        raise ApiError(400, "empty_input", "Paste a message or upload a screenshot to check.")

    family_code = body.get("family_code")
    if family_code is not None and not isinstance(family_code, str):
        raise ApiError(400, "bad_family_code", "family_code must be a string.")

    return text, image_key, normalise_language(body.get("language")), family_code


def _load_image(image_key: str) -> tuple[bytes, str] | None:
    """Fetch the screenshot the browser uploaded. Never logged, never stored."""
    try:
        obj = _s3_client().get_object(Bucket=os.environ["UPLOADS_BUCKET"], Key=image_key)
        if obj.get("ContentLength", 0) > MAX_IMAGE_BYTES:
            raise ApiError(400, "too_large", "Screenshot must be under 5 MB.")
        body = obj["Body"].read(MAX_IMAGE_BYTES + 1)
        if len(body) > MAX_IMAGE_BYTES:
            raise ApiError(400, "too_large", "Screenshot must be under 5 MB.")
        fmt = "png" if image_key.endswith(".png") else "jpeg"
        return body, fmt
    except ApiError:
        raise
    except Exception as exc:  # noqa: BLE001
        LOG.warning("image_fetch_failed type=%s", type(exc).__name__)
        return None


def _merge_extracted(from_text: dict, from_model: dict | None) -> dict:
    """Text extraction is authoritative; the model fills in what only it can see.

    For a screenshot with no pasted text, everything comes from the model — so
    the rules are then re-run over what the model read out of the image.
    """
    merged = {k: list(v) if isinstance(v, list) else v for k, v in from_text.items()}
    if not from_model:
        return merged

    for key in ("urls", "upi_ids", "phone_numbers", "amounts", "transaction_ids"):
        for value in from_model.get(key, []):
            if value not in merged.get(key, []):
                merged.setdefault(key, []).append(value)

    # Domains are derived, so recompute them from any urls the model added.
    from ruko.extract import extract_urls

    for url in merged.get("urls", []):
        _, domains = extract_urls(url)
        for domain in domains:
            if domain not in merged.setdefault("domains", []):
                merged["domains"].append(domain)

    merged["sender_name"] = merged.get("sender_name") or from_model.get("sender_name")
    merged["platform"] = merged.get("platform") or from_model.get("platform")
    return merged


def _rule_red_flags(hits: list[RuleHit], language: str, limit: int) -> list[dict]:
    """Rule hits as red flags, most severe first, translated."""
    ranked = sorted(hits, key=lambda h: SEVERITY_FLOOR.get(h.severity, 0), reverse=True)
    return [
        {
            "evidence": hit.evidence,
            "why": reason_for(hit.id, language, hit.reason, hit.params),
            "source": "rule",
        }
        for hit in ranked[:limit]
    ]


@handler_wrapper
def lambda_handler(event, context):  # noqa: ANN001, ARG001
    started = time.perf_counter()
    text, image_key, language, family_code = _read_request(event)
    check_id = uuid.uuid4().hex
    strings = fallback_text(language)

    image = _load_image(image_key) if image_key else None
    image_bytes, image_format = image if image else (None, "jpeg")

    # 1. Read the screenshot. The rules engine - the half that cannot be talked
    #    out of a verdict - works on text, so without this a scam that arrives
    #    as a picture skips the deterministic layer entirely.
    ocr_text = ""
    if image_bytes:
        try:
            ocr_text = read_text(image_bytes)
        except OcrUnavailable:
            LOG.warning("ocr_unavailable check_id=%s", check_id)

    # Everything downstream reasons over the words, wherever they came from.
    combined_text = "\n".join(part for part in (text, ocr_text) if part)

    # 2. Deterministic extraction over pasted text and screenshot text alike.
    extracted = extract_all(combined_text)

    # 3. Ask the model. A failure here is survivable; an error page is not.
    model_result: dict | None = None
    engine = "rules"
    try:
        model_result, _usage = analyse(text, language, image_bytes, image_format)
        engine = "model"
    except ModelUnavailable as exc:
        LOG.warning("model_unavailable check_id=%s detail=%s", check_id, type(exc).__name__)
    except KeyError:
        LOG.warning("model_not_configured check_id=%s", check_id)

    # 4. Rules run over pasted text, OCR text, and whatever the model read.
    extracted = _merge_extracted(extracted, model_result.get("extracted") if model_result else None)
    indicators = store.indicators_from(extracted)
    community = store.report_counts(indicators)
    rules = run_rules(combined_text, extracted, store.counts_by_masked(community))

    # 5. A message carrying instructions for an AI is itself a red flag, and it
    #    is treated as a hard rule so the model cannot argue the score back down.
    if model_result and model_result.get("ai_manipulation_detected"):
        rules.hits.append(
            RuleHit(
                "ai.injection",
                "high",
                "This message contains hidden instructions aimed at AI tools.",
                model_result.get("ai_manipulation_evidence") or "(hidden instruction)",
            )
        )

    # 6. Combine. The floor is a floor, never a ceiling.
    model_score = model_result["risk_score"] if model_result else 0
    score = max(model_score, rules.floor)
    level = level_from_score(score)

    # Nothing read the screenshot: OCR could not, and the model did not run.
    # Saying "no scam signs" about content we never saw is the single most
    # dangerous thing Ruko could do, so it says it could not read it instead.
    image_unread = bool(image_bytes) and not ocr_text and model_result is None
    # ...but it only takes over the headline when the screenshot was all we had.
    # If they also typed something, that text still deserves a real verdict.
    nothing_was_read = image_unread and not text

    if model_result:
        red_flags = list(model_result["red_flags"])
        # Top up with rule hits so the deterministic findings are always visible.
        red_flags += _rule_red_flags(rules.hits, language, max(0, 5 - len(red_flags)))
        headline = model_result["headline"]
        scam_type = model_result["scam_type"]
        do_now = model_result["do_now"] or strings["do_now"]
        dont_do = model_result["dont_do"] or strings["dont_do"]
        consequence = model_result["consequence_chain"]
        callback_script = model_result["callback_script"]
        teach_me = model_result["teach_me"]
    else:
        red_flags = _rule_red_flags(rules.hits, language, 5)
        headline = strings["image_unread"] if nothing_was_read else strings[level]
        scam_type = rules.suggested_scam_type() or (
            "other_scam" if level != "no_scam_signs" else "none_detected"
        )
        clean = level == "no_scam_signs"
        do_now = strings["do_now_clean"] if clean else strings["do_now"]
        dont_do = strings["dont_do_clean"] if clean else strings["dont_do"]
        if nothing_was_read:
            do_now = strings["do_now_clean"]
            dont_do = strings["dont_do_clean"]
        consequence = []
        callback_script = None
        teach_me = None

    # A rules-driven scam verdict should not be announced with a calm headline.
    if model_result and score > model_score and level == "scam":
        headline = strings["scam"]

    # And a clean verdict is always said in Ruko's own words. The prompt forbids
    # "safe", but a model writing in fifteen languages will slip eventually, and
    # this is the one promise the whole product rests on.
    if level == "no_scam_signs" and not nothing_was_read:
        headline = strings["no_scam_signs"]

    verdict = build_verdict(
        check_id=check_id,
        risk_score=score,
        scam_type=scam_type,
        headline=headline,
        red_flags=red_flags,
        do_now=do_now,
        dont_do=dont_do,
        consequence_chain=consequence,
        callback_script=callback_script,
        teach_me=teach_me,
        language=language,
        extracted={
            "urls": extracted.get("urls", []),
            "upi_ids": extracted.get("upi_ids", []),
            "phone_numbers": extracted.get("phone_numbers", []),
            "amounts": extracted.get("amounts", []),
            "transaction_ids": extracted.get("transaction_ids", []),
            "sender_name": extracted.get("sender_name"),
            "platform": extracted.get("platform"),
        },
        community=community,
        rule_hits=rules.ids,
        partial=model_result is None,
        engine=engine,
    )

    # What Ruko actually read out of the picture. Showing it back is how someone
    # can tell the difference between "checked and clear" and "never read".
    verdict["screenshot_text"] = ocr_text or None
    verdict["image_unread"] = nothing_was_read

    store.save_check(check_id, verdict, indicators, family_code)

    # If this person has a guardian linked and it is a scam, tell the guardian.
    # Only the headline travels - never the message they checked.
    if family_code and verdict["risk_level"] == "scam":
        family.add_alert(
            family.normalise_code(family_code),
            {
                "kind": "scam",
                "risk_level": verdict["risk_level"],
                "risk_score": verdict["risk_score"],
                "scam_type": verdict["scam_type"],
                "headline": verdict["headline"],
                "language": language,
                "check_id": check_id,
            },
        )

    # Identifiers, timings and rule ids only. Never the text, never the image.
    LOG.info(
        "check_done check_id=%s lang=%s has_text=%s has_image=%s ocr_chars=%d "
        "unread=%s level=%s score=%d model_score=%d floor=%d engine=%s rules=%s ms=%d",
        check_id,
        language,
        bool(text),
        bool(image_bytes),
        len(ocr_text),
        image_unread,
        verdict["risk_level"],
        score,
        model_score,
        rules.floor,
        engine,
        ",".join(rules.ids) or "-",
        int((time.perf_counter() - started) * 1000),
    )

    return response(200, verdict)
