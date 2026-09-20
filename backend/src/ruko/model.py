"""The model call, and getting a trustworthy object back out of it.

Two providers sit behind one function. Bedrock is the default and keeps the
message inside AWS; Gemini is there because Bedrock access can take days to be
granted and the organisers confirmed any inference provider is allowed as long
as the project is deployed on AWS. Whichever answers, the reply is validated by
`_clean` and can only ever raise the risk score — a rule hit is a floor.

Set MODEL_PROVIDER to "bedrock", "gemini" or "none". "none" is honest rather than
broken: the check falls back to the rules, which is what runs today anyway.
"""

from __future__ import annotations

import os
from typing import Any

import boto3
from botocore.config import Config

from . import gemini
from .http import LOG
from .prompt import VERDICT_TOOL, build_messages, system_prompt
from .verdict import SCAM_TYPES

_MAX_TOKENS = 1400
_TEMPERATURE = 0.2

_client = None


def _bedrock():
    """One client per warm Lambda. Retries are bounded so a slow model cannot
    eat the whole 30s budget and leave the caller with nothing."""
    global _client
    if _client is None:
        _client = boto3.client(
            "bedrock-runtime",
            region_name=os.environ.get("BEDROCK_REGION", "us-east-1"),
            config=Config(
                retries={"max_attempts": 2, "mode": "standard"},
                connect_timeout=5,
                read_timeout=20,
            ),
        )
    return _client


class ModelUnavailable(Exception):
    """The model could not be reached or refused to answer usefully."""


def _extract_tool_input(response: dict) -> dict | None:
    for block in response.get("output", {}).get("message", {}).get("content", []):
        use = block.get("toolUse")
        if use and use.get("name") == "report_verdict":
            payload = use.get("input")
            return payload if isinstance(payload, dict) else None
    return None


def _clean(payload: dict) -> dict | None:
    """Validate the tool output. Returns None if it is not usable.

    The model is not trusted to get the shape right, and it is never trusted to
    decide the risk *level* - only to propose a score.
    """
    try:
        score = int(payload["risk_score"])
    except (KeyError, TypeError, ValueError):
        return None
    if not 0 <= score <= 100:
        score = max(0, min(100, score))

    headline = payload.get("headline")
    if not isinstance(headline, str) or not headline.strip():
        return None

    scam_type = payload.get("scam_type")
    if scam_type not in SCAM_TYPES:
        scam_type = "other_scam" if score >= 40 else "none_detected"

    red_flags = []
    for flag in payload.get("red_flags") or []:
        if not isinstance(flag, dict):
            continue
        evidence = str(flag.get("evidence", "")).strip()
        why = str(flag.get("why", "")).strip()
        if evidence and why:
            red_flags.append({"evidence": evidence[:200], "why": why[:300], "source": "model"})

    def strings(key: str, limit: int) -> list[str]:
        raw = payload.get(key) or []
        if not isinstance(raw, list):
            return []
        return [str(v).strip()[:200] for v in raw if str(v).strip()][:limit]

    chain = []
    for step in payload.get("consequence_chain") or []:
        if isinstance(step, dict) and str(step.get("step", "")).strip():
            chain.append(
                {"step": str(step["step"]).strip()[:200], "is_loss": bool(step.get("is_loss"))}
            )
    # The last step is the loss whether or not the model remembered to say so.
    if chain and not any(s["is_loss"] for s in chain):
        chain[-1]["is_loss"] = True

    extracted_in = payload.get("extracted")
    extracted_in = extracted_in if isinstance(extracted_in, dict) else {}

    def extracted_list(key: str) -> list[str]:
        raw = extracted_in.get(key) or []
        if not isinstance(raw, list):
            return []
        return [str(v).strip()[:120] for v in raw if str(v).strip()][:10]

    def extracted_str(key: str) -> str | None:
        value = extracted_in.get(key)
        value = str(value).strip()[:80] if value else ""
        return value or None

    return {
        "risk_score": score,
        "scam_type": scam_type,
        "headline": headline.strip()[:300],
        "red_flags": red_flags[:5],
        "do_now": strings("do_now", 4),
        "dont_do": strings("dont_do", 3),
        "consequence_chain": chain[:5],
        "callback_script": (str(payload.get("callback_script") or "").strip() or None),
        "teach_me": (str(payload.get("teach_me") or "").strip() or None),
        "ai_manipulation_detected": bool(payload.get("ai_manipulation_detected")),
        "ai_manipulation_evidence": (
            str(payload.get("ai_manipulation_evidence") or "").strip() or None
        ),
        "extracted": {
            "urls": extracted_list("urls"),
            "upi_ids": extracted_list("upi_ids"),
            "phone_numbers": extracted_list("phone_numbers"),
            "amounts": extracted_list("amounts"),
            "transaction_ids": extracted_list("transaction_ids"),
            "sender_name": extracted_str("sender_name"),
            "platform": extracted_str("platform"),
        },
    }


def provider() -> str:
    return os.environ.get("MODEL_PROVIDER", "bedrock").strip().lower()


def analyse(
    text: str,
    language: str,
    image_bytes: bytes | None = None,
    image_format: str = "jpeg",
) -> tuple[dict, dict[str, Any]]:
    """Ask the configured provider to analyse the evidence.

    Returns (verdict fields, usage). Raises ModelUnavailable if nothing usable
    comes back - the caller then falls back to a rules-only verdict rather than
    showing an error.
    """
    chosen = provider()
    if chosen == "none":
        raise ModelUnavailable("no model configured")
    if chosen == "gemini":
        return _analyse_with_gemini(text, language, image_bytes, image_format)
    return _analyse_with_bedrock(text, language, image_bytes, image_format)


def _analyse_with_gemini(
    text: str, language: str, image_bytes: bytes | None, image_format: str
) -> tuple[dict, dict[str, Any]]:
    last_error: Exception | None = None
    # One pass: gemini.analyse already walks its own model chain with a pause.
    for attempt in (1,):
        try:
            payload, usage = gemini.analyse(text, language, image_bytes, image_format)
        except gemini.GeminiError as exc:
            last_error = exc
            LOG.warning("gemini_call_failed attempt=%d detail=%s", attempt, exc)
            continue
        cleaned = _clean(payload)
        if cleaned:
            LOG.info(
                "gemini_ok attempt=%d in_tokens=%s out_tokens=%s",
                attempt,
                usage.get("inputTokens"),
                usage.get("outputTokens"),
            )
            return cleaned, usage
        LOG.warning("gemini_bad_output attempt=%d", attempt)

    raise ModelUnavailable(str(last_error) if last_error else "invalid model output")


def _analyse_with_bedrock(
    text: str,
    language: str,
    image_bytes: bytes | None = None,
    image_format: str = "jpeg",
) -> tuple[dict, dict[str, Any]]:
    messages = build_messages(text, image_bytes, image_format)
    request = {
        "modelId": os.environ["BEDROCK_MODEL_ID"],
        "messages": messages,
        "system": [{"text": system_prompt(language)}],
        "inferenceConfig": {"maxTokens": _MAX_TOKENS, "temperature": _TEMPERATURE},
        "toolConfig": {
            "tools": [VERDICT_TOOL],
            # Force the tool: there is then no prose path for the model to take.
            "toolChoice": {"tool": {"name": "report_verdict"}},
        },
    }

    last_error: Exception | None = None
    for attempt in (1, 2):
        try:
            response = _bedrock().converse(**request)
        except Exception as exc:  # noqa: BLE001 - surfaced as ModelUnavailable below
            last_error = exc
            LOG.warning("bedrock_call_failed attempt=%d type=%s", attempt, type(exc).__name__)
            continue

        payload = _extract_tool_input(response)
        cleaned = _clean(payload) if payload else None
        if cleaned:
            usage = response.get("usage", {})
            LOG.info(
                "bedrock_ok attempt=%d in_tokens=%s out_tokens=%s",
                attempt,
                usage.get("inputTokens"),
                usage.get("outputTokens"),
            )
            return cleaned, usage

        LOG.warning("bedrock_bad_output attempt=%d", attempt)

    raise ModelUnavailable(str(last_error) if last_error else "invalid model output")
