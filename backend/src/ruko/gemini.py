"""The Google Gemini call, for when Bedrock is not available.

The hackathon organisers confirmed on day 2 that the inference provider does not
have to be Bedrock as long as the project is deployed on AWS. Bedrock is still
the preferred path — it keeps the message inside AWS — so this is a second
implementation of the same contract, not a replacement:

  * the same system prompt and the same evidence fencing as Bedrock,
  * the same verdict schema, enforced by Gemini's structured output,
  * the same `_clean` validation afterwards, in model.py,
  * the same rule: the model may only raise the score, never lower a rule hit.

The API key never appears in code, in the template, or in a log line. It lives in
SSM Parameter Store as a SecureString and is read once per cold start.

One honest note that belongs in the README and on the screen: with this provider
the message being checked leaves AWS and is sent to Google. Bedrock does not do
that, which is why switching back is a single parameter.
"""

from __future__ import annotations

import base64
import json
import os
import urllib.error
import urllib.request
from typing import Any

import boto3

from .http import LOG
from .prompt import build_gemini_contents, response_schema, system_prompt

_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
_TIMEOUT_SECONDS = 20
# Gemini 3.x thinks before it answers, and those thoughts are billed against the
# same budget as the reply. A verdict costs ~600 tokens and the thinking ran to
# ~700 on the first real message, so 1400 silently truncated every answer: a
# STOP finish, a part with no text, and a fall back to rules that looked like
# the model was unreachable.
_MAX_TOKENS = 4000
_TEMPERATURE = 0.2

# Scam messages are full of threats, blackmail and police impersonation. That is
# the material, not the intent, so the safety filters are set to block only the
# most extreme content. A blocked response is handled as "model unavailable" and
# falls back to the rules rather than showing an error.
_SAFETY = [
    {"category": category, "threshold": "BLOCK_ONLY_HIGH"}
    for category in (
        "HARM_CATEGORY_HARASSMENT",
        "HARM_CATEGORY_HATE_SPEECH",
        "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "HARM_CATEGORY_DANGEROUS_CONTENT",
    )
]

_api_key: str | None = None


class GeminiError(Exception):
    """Raised for anything that stops a usable answer coming back."""


def _key() -> str:
    """The API key, read once per cold start from SSM Parameter Store."""
    global _api_key
    if _api_key:
        return _api_key

    inline = os.environ.get("GEMINI_API_KEY")
    if inline:
        _api_key = inline
        return _api_key

    name = os.environ.get("GEMINI_KEY_PARAM")
    if not name:
        raise GeminiError("no key configured")
    try:
        client = boto3.client("ssm")
        value = client.get_parameter(Name=name, WithDecryption=True)["Parameter"]["Value"]
    except Exception as exc:  # noqa: BLE001
        # Never include the exception text: it can echo the parameter name and,
        # on some error paths, its value.
        raise GeminiError(f"key unavailable ({type(exc).__name__})") from None
    if not value.strip():
        raise GeminiError("key is empty")
    _api_key = value.strip()
    return _api_key


def _request_body(text: str, language: str, image_bytes: bytes | None, image_format: str) -> dict:
    return {
        "systemInstruction": {"parts": [{"text": system_prompt(language)}]},
        "contents": build_gemini_contents(text, image_bytes, image_format),
        "safetySettings": _SAFETY,
        "generationConfig": {
            "temperature": _TEMPERATURE,
            "maxOutputTokens": _MAX_TOKENS,
            # Structured output is this provider's equivalent of forcing a tool:
            # there is no prose path for the model to wander down.
            "responseMimeType": "application/json",
            "responseSchema": response_schema(),
        },
    }


def _post(body: dict) -> dict:
    model = os.environ.get("GEMINI_MODEL_ID", "gemini-3.6-flash")
    request = urllib.request.Request(
        _ENDPOINT.format(model=model),
        data=json.dumps(body).encode("utf-8"),
        headers={
            "content-type": "application/json",
            # A header, not a query parameter: a key in a URL ends up in logs.
            "x-goog-api-key": _key(),
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=_TIMEOUT_SECONDS) as handle:
            return json.loads(handle.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        # The body can quote the request back, so only the status is kept.
        raise GeminiError(f"http {exc.code}") from None
    except Exception as exc:  # noqa: BLE001
        raise GeminiError(type(exc).__name__) from None


def _payload_from(response: dict) -> dict | None:
    candidates = response.get("candidates") or []
    if not candidates:
        return None
    candidate = candidates[0]
    finish = candidate.get("finishReason")
    if finish in {"SAFETY", "RECITATION", "BLOCKLIST", "PROHIBITED_CONTENT"}:
        LOG.warning("gemini_blocked reason=%s", finish)
        return None
    if finish == "MAX_TOKENS":
        LOG.warning("gemini_truncated: raise _MAX_TOKENS")
        return None
    for part in candidate.get("content", {}).get("parts", []):
        raw = part.get("text")
        if not raw:
            continue
        try:
            parsed = json.loads(raw)
        except ValueError:
            continue
        if isinstance(parsed, dict):
            return parsed
    return None


def analyse(
    text: str,
    language: str,
    image_bytes: bytes | None = None,
    image_format: str = "jpeg",
) -> tuple[dict, dict[str, Any]]:
    """Return (raw payload, usage). Raises GeminiError if nothing usable came back."""
    body = _request_body(text, language, image_bytes, image_format)
    response = _post(body)
    payload = _payload_from(response)
    if payload is None:
        raise GeminiError("no usable candidate")

    usage_in = response.get("usageMetadata", {})
    usage = {
        "inputTokens": usage_in.get("promptTokenCount"),
        "outputTokens": usage_in.get("candidatesTokenCount"),
    }
    return payload, usage


def encode_image(image_bytes: bytes) -> str:
    """Base64 for an inline image part, kept here so tests can check the shape."""
    return base64.b64encode(image_bytes).decode("ascii")
