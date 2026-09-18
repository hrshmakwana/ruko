"""Live call mode: Ruko listens while a scammer is on speakerphone.

Calls are where the money is actually lost, and a web app cannot see a phone
call. This is the closest honest thing: the person puts the call on speaker and
Ruko listens through the microphone, like a relative sitting next to them.

Two endpoints, because the audio never touches our servers:

  POST /live/token    a presigned WebSocket URL for Amazon Transcribe streaming.
                      The browser opens it and streams microphone audio straight
                      to Transcribe. The URL is signed with this function's own
                      short-lived role credentials and expires in five minutes.

  POST /live/analyse  the text Transcribe sent back, run through the same rules
                      engine as a pasted message. Returns only what should
                      appear on screen.

Nothing here is written down. No audio reaches Lambda, no transcript is stored,
and the log line carries counts, never words.
"""

from __future__ import annotations

import os
import time

import boto3
from botocore.auth import SigV4QueryAuth
from botocore.awsrequest import AWSRequest

from ruko.extract import extract_all
from ruko.http import ApiError, LOG, handler_wrapper, parse_json_body, response
from ruko.rule_text import reason_for
from ruko.rules import SEVERITY_FLOOR, run_rules
from ruko.verdict import level_from_score, normalise_language

# Which of Ruko's fifteen languages Transcribe can stream. Every code below was
# opened against the live service on 18 Sept; ur-IN and as-IN were refused, so
# those two fall back to the nearest language Transcribe does speak. Urdu and
# Hindi are the same spoken language in different scripts, so a Hindi model
# hears an Urdu call correctly and writes it in Devanagari; Assamese and Bengali
# are close enough for the words that matter here (OTP, KYC, block, arrest).
# The UI says which language is actually being listened to, rather than implying
# support we do not have.
STREAMING_LANGUAGES = {
    "en": "en-IN",
    "hi": "hi-IN",
    "bn": "bn-IN",
    "mr": "mr-IN",
    "te": "te-IN",
    "ta": "ta-IN",
    "gu": "gu-IN",
    "kn": "kn-IN",
    "or": "or-IN",
    "ml": "ml-IN",
    "pa": "pa-IN",
    "ne": "ne-NP",
    "mai": "hi-IN",  # Maithili: no model, and it is written in Devanagari
    "ur": "hi-IN",  # Urdu: no model, same spoken language as Hindi
    "as": "bn-IN",  # Assamese: no model, nearest neighbour
}

# The languages above where the transcript comes back in a different script than
# the person chose, so the screen can say so instead of looking broken.
BORROWED_LANGUAGES = {"mai": "hi-IN", "ur": "hi-IN", "as": "bn-IN"}

SAMPLE_RATE = "16000"
URL_TTL_SECONDS = 300

# A call check is a few minutes, not an hour. Transcribe bills by the minute, so
# the cap is both a cost guard and a promise we can make out loud.
MAX_SECONDS = 300

MAX_TRANSCRIPT_CHARS = 4000

_session = None


def _region() -> str:
    return os.environ.get("TRANSCRIBE_REGION") or os.environ["AWS_REGION"]


def _presigned_websocket_url(language_code: str) -> str:
    """Sign a Transcribe streaming WebSocket URL with this role's credentials.

    Query signing (rather than a header) is what lets a browser open the socket:
    a WebSocket handshake cannot carry an Authorization header.
    """
    global _session
    if _session is None:
        _session = boto3.Session()
    credentials = _session.get_credentials()
    if credentials is None:  # pragma: no cover - only outside Lambda
        raise ApiError(500, "no_credentials", "This service is not configured.")

    region = _region()
    host = f"transcribestreaming.{region}.amazonaws.com:8443"
    url = (
        f"https://{host}/stream-transcription-websocket"
        f"?language-code={language_code}"
        f"&media-encoding=pcm"
        f"&sample-rate={SAMPLE_RATE}"
    )
    request = AWSRequest(method="GET", url=url)
    SigV4QueryAuth(
        credentials.get_frozen_credentials(), "transcribe", region, expires=URL_TTL_SECONDS
    ).add_auth(request)
    return request.url.replace("https://", "wss://", 1)


def _token(event: dict) -> dict:
    body = parse_json_body(event)
    language = normalise_language(body.get("language"))
    language_code = STREAMING_LANGUAGES.get(language, "en-IN")
    url = _presigned_websocket_url(language_code)
    LOG.info("live_token language=%s stream_language=%s", language, language_code)
    return response(
        200,
        {
            "url": url,
            "language": language,
            "stream_language": language_code,
            "borrowed": language in BORROWED_LANGUAGES,
            "sample_rate": int(SAMPLE_RATE),
            "expires_in": URL_TTL_SECONDS,
            "max_seconds": MAX_SECONDS,
        },
    )


def _analyse(event: dict) -> dict:
    body = parse_json_body(event)
    text = body.get("text")
    if not isinstance(text, str) or not text.strip():
        raise ApiError(400, "empty_input", "There is nothing to check yet.")
    text = text[-MAX_TRANSCRIPT_CHARS:]
    language = normalise_language(body.get("language"))

    started = time.perf_counter()
    extracted = extract_all(text)
    rules = run_rules(text, extracted, {})
    score = rules.floor
    level = level_from_score(score)

    alerts = [
        {
            "rule": hit.id,
            "evidence": hit.evidence,
            "why": reason_for(hit.id, language, hit.reason, hit.params),
            "severity": hit.severity,
        }
        for hit in sorted(
            rules.hits, key=lambda h: SEVERITY_FLOOR.get(h.severity, 0), reverse=True
        )
    ]

    # Words are never logged: only how many, and what fired.
    LOG.info(
        "live_analyse chars=%d hits=%s score=%d ms=%d",
        len(text),
        ",".join(rules.ids) or "-",
        score,
        int((time.perf_counter() - started) * 1000),
    )

    return response(
        200,
        {
            "risk_level": level,
            "risk_score": score,
            "scam_type": rules.suggested_scam_type() or "none_detected",
            "alerts": alerts,
            "language": language,
        },
    )


@handler_wrapper
def lambda_handler(event, context):  # noqa: ANN001, ARG001
    path = (event.get("rawPath") or "").rstrip("/")
    if path.endswith("/live/token"):
        return _token(event)
    if path.endswith("/live/analyse"):
        return _analyse(event)
    raise ApiError(404, "not_found", "Unknown path.")
