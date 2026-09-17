"""Reading the words out of a screenshot, with Amazon Textract.

Why this exists at all: the rules engine is the part of Ruko that cannot be
talked out of a verdict, and it works on **text**. Without OCR, a scam that
arrives as a screenshot is invisible to it — the whole deterministic layer is
skipped and the answer rests entirely on the model being available and right.

So every screenshot is read here first, and the rules run on what comes out.
The model still sees the original image, because it catches what OCR cannot:
a fake bank logo, a spoofed caller ID, the layout of a fake payment page.
"""

from __future__ import annotations

import os

import boto3
from botocore.config import Config

from .http import LOG

MAX_BYTES = 5 * 1024 * 1024
MAX_CHARS = 4000

_client = None


def _textract():
    global _client
    if _client is None:
        _client = boto3.client(
            "textract",
            region_name=os.environ.get("AWS_REGION", "us-east-1"),
            config=Config(retries={"max_attempts": 2, "mode": "standard"}, read_timeout=15),
        )
    return _client


class OcrUnavailable(Exception):
    """Textract could not read the image."""


def read_text(image_bytes: bytes) -> str:
    """Return the text in the image, one line per detected line.

    Raises OcrUnavailable rather than returning "" — an empty string and a
    failure mean very different things, and confusing them is how a screenshot
    nobody could read ends up reported as "no scam signs".
    """
    if not image_bytes or len(image_bytes) > MAX_BYTES:
        raise OcrUnavailable("image missing or too large")

    try:
        result = _textract().detect_document_text(Document={"Bytes": image_bytes})
    except Exception as exc:  # noqa: BLE001
        LOG.warning("ocr_failed type=%s", type(exc).__name__)
        raise OcrUnavailable(type(exc).__name__) from exc

    lines = [
        block.get("Text", "")
        for block in result.get("Blocks", [])
        if block.get("BlockType") == "LINE"
    ]
    text = "\n".join(line for line in lines if line.strip())[:MAX_CHARS]

    # Count only; the text itself is never logged.
    LOG.info("ocr_ok lines=%d chars=%d", len(lines), len(text))
    return text
