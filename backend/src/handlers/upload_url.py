"""POST /upload-url - a presigned S3 PUT for exactly one screenshot.

The browser uploads straight to S3, so the image never passes through Lambda.
The bucket is private and everything under uploads/ is deleted after one day.
"""

from __future__ import annotations

import os
import uuid

import boto3
from botocore.config import Config

from ruko.http import ApiError, handler_wrapper, parse_json_body, response

ALLOWED_TYPES = {"image/jpeg": "jpg", "image/png": "png"}
MAX_BYTES = 5 * 1024 * 1024
URL_TTL_SECONDS = 300

_s3 = boto3.client("s3", config=Config(signature_version="s3v4"))


@handler_wrapper
def lambda_handler(event, context):  # noqa: ANN001, ARG001
    body = parse_json_body(event)

    content_type = str(body.get("content_type", "")).lower().strip()
    if content_type not in ALLOWED_TYPES:
        raise ApiError(400, "bad_content_type", "Only JPEG or PNG screenshots are accepted.")

    size = body.get("size_bytes")
    params = {
        "Bucket": os.environ["UPLOADS_BUCKET"],
        "Key": f"uploads/{uuid.uuid4().hex}.{ALLOWED_TYPES[content_type]}",
        "ContentType": content_type,
    }
    if size is not None:
        try:
            size = int(size)
        except (TypeError, ValueError):
            raise ApiError(400, "bad_size", "size_bytes must be a number.")
        if size <= 0 or size > MAX_BYTES:
            raise ApiError(400, "too_large", "Screenshot must be under 5 MB.")
        # Signing the length pins the upload to the size the client declared.
        params["ContentLength"] = size

    url = _s3.generate_presigned_url("put_object", Params=params, ExpiresIn=URL_TTL_SECONDS)

    return response(
        200,
        {
            "upload_url": url,
            "key": params["Key"],
            "expires_in": URL_TTL_SECONDS,
            "headers": {"content-type": content_type},
        },
    )
