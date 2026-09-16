"""GET /health - liveness, plus just enough config to debug a deploy."""

from __future__ import annotations

import os

from ruko.http import handler_wrapper, response


@handler_wrapper
def lambda_handler(event, context):  # noqa: ANN001, ARG001
    return response(
        200,
        {
            "ok": True,
            "service": "ruko",
            # Safe to expose: a model id and a region name are not secrets.
            "bedrock_region": os.environ.get("BEDROCK_REGION"),
            "bedrock_model_id": os.environ.get("BEDROCK_MODEL_ID"),
        },
    )
