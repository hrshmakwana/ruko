"""Emailing the guardian, with Amazon SNS.

The gap this closes: the dashboard alarm only fires if the dashboard is open,
and in real life it will not be. Email reaches them anyway.

One topic for everyone, with a **filter policy per subscription** on
`family_code`. SNS then does the routing itself — a guardian only ever receives
their own family's alerts, and Ruko never has to keep a list of who to mail.

Free tier is 1,000 email notifications a month, which is far more than a
hackathon demo will ever send.

What is in the email: the headline, the kind of scam, and a link. Never the
message that was checked — that is the same rule the dashboard follows.
"""

from __future__ import annotations

import os

import boto3

from .http import LOG

APP_URL = os.environ.get("APP_URL", "https://main.d1qvcci82uzrvx.amplifyapp.com")

_client = None


def _sns():
    global _client
    if _client is None:
        _client = boto3.client("sns")
    return _client


def _topic() -> str | None:
    return os.environ.get("ALERT_TOPIC_ARN") or None


def subscribe_guardian(email: str, family_code: str) -> str | None:
    """Subscribe a guardian to their own family's alerts.

    AWS sends a confirmation email that they must click; until they do, SNS
    silently drops messages to them. The dashboard says so rather than letting
    them assume they are covered.
    """
    topic = _topic()
    if not topic:
        return None

    try:
        result = _sns().subscribe(
            TopicArn=topic,
            Protocol="email",
            Endpoint=email,
            Attributes={
                # The whole routing model: SNS only delivers messages whose
                # family_code attribute matches this subscription.
                "FilterPolicy": f'{{"family_code": ["{family_code}"]}}',
                "FilterPolicyScope": "MessageAttributes",
            },
            ReturnSubscriptionArn=True,
        )
        LOG.info("guardian_subscribed family=%s", family_code)
        return result.get("SubscriptionArn")
    except Exception as exc:  # noqa: BLE001 - signup must not fail over email
        LOG.warning("subscribe_failed family=%s type=%s", family_code, type(exc).__name__)
        return None


def _subject(kind: str) -> str:
    return (
        "Ruko: they pressed the panic button"
        if kind == "panic"
        else "Ruko: a scam was detected on their phone"
    )


def _body(alert: dict, family_code: str) -> str:
    if alert.get("kind") == "panic":
        opening = (
            "Someone in your family has pressed the panic button in Ruko.\n"
            "They are being pressured right now. Call them."
        )
    else:
        opening = (
            "Ruko found a scam on the phone of someone in your family.\n"
            "They have been shown the warning, but they may still be on the call."
        )

    lines = [
        opening,
        "",
        f"What Ruko said: {alert.get('headline', '')}",
    ]
    if alert.get("scam_type") and alert["scam_type"] != "none_detected":
        lines.append(f"Kind of scam:   {alert['scam_type'].replace('_', ' ')}")
    if alert.get("risk_score"):
        lines.append(f"Risk score:     {alert['risk_score']}/100")

    lines += [
        "",
        "Open Ruko to send them a STOP that appears on their screen:",
        f"{APP_URL}/guardian",
        "",
        f"Family code: {family_code}",
        "",
        "Ruko never sends you the message itself, and never stores it.",
        "If money has already gone, call 1930 and file at cybercrime.gov.in.",
    ]
    return "\n".join(lines)


def publish_alert(family_code: str, alert: dict) -> bool:
    """Email this family's guardians. Never raises."""
    topic = _topic()
    if not topic or not family_code:
        return False

    try:
        _sns().publish(
            TopicArn=topic,
            Subject=_subject(alert.get("kind", "scam"))[:100],
            Message=_body(alert, family_code),
            MessageAttributes={
                "family_code": {"DataType": "String", "StringValue": family_code}
            },
        )
        LOG.info("alert_emailed family=%s kind=%s", family_code, alert.get("kind"))
        return True
    except Exception as exc:  # noqa: BLE001 - an alert failing to send must not
        # break the check that produced it; the in-app alarm still fires.
        LOG.warning("publish_failed family=%s type=%s", family_code, type(exc).__name__)
        return False
