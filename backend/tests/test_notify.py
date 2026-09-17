"""Guardian alert emails.

Two things matter here and nothing else does:

- the email never carries the message that was checked
- an email failing must never break the check that produced it
"""

import os

import pytest

os.environ.setdefault("TABLE_NAME", "ruko-test")

from ruko import family, notify  # noqa: E402

ALERT = {
    "kind": "scam",
    "risk_level": "scam",
    "risk_score": 88,
    "scam_type": "kyc_update",
    "headline": "This is a fake SBI message trying to steal your bank login.",
    "language": "en",
}

SECRET_MESSAGE = "Dear customer your KYC expired, update at http://sbi-kyc-verify.in"


class FakeSns:
    def __init__(self, fail: bool = False):
        self.published: list[dict] = []
        self.subscribed: list[dict] = []
        self.fail = fail

    def publish(self, **kwargs):
        if self.fail:
            raise RuntimeError("sns is down")
        self.published.append(kwargs)
        return {"MessageId": "m-1"}

    def subscribe(self, **kwargs):
        if self.fail:
            raise RuntimeError("sns is down")
        self.subscribed.append(kwargs)
        return {"SubscriptionArn": "arn:aws:sns:...:sub-1"}


@pytest.fixture
def sns(monkeypatch):
    fake = FakeSns()
    monkeypatch.setattr(notify, "_sns", lambda: fake)
    monkeypatch.setenv("ALERT_TOPIC_ARN", "arn:aws:sns:us-east-1:1:ruko-alerts-prod")
    return fake


class TestSubscription:
    def test_filter_policy_scopes_to_one_family(self, sns):
        notify.subscribe_guardian("guardian@example.com", "PMPFKR")
        attrs = sns.subscribed[0]["Attributes"]
        assert '"family_code": ["PMPFKR"]' in attrs["FilterPolicy"]
        assert attrs["FilterPolicyScope"] == "MessageAttributes"

    def test_subscribes_by_email(self, sns):
        notify.subscribe_guardian("guardian@example.com", "PMPFKR")
        assert sns.subscribed[0]["Protocol"] == "email"
        assert sns.subscribed[0]["Endpoint"] == "guardian@example.com"

    def test_failure_is_survivable(self, monkeypatch):
        monkeypatch.setattr(notify, "_sns", lambda: FakeSns(fail=True))
        monkeypatch.setenv("ALERT_TOPIC_ARN", "arn:topic")
        assert notify.subscribe_guardian("g@example.com", "PMPFKR") is None

    def test_no_topic_configured_is_not_an_error(self, monkeypatch):
        monkeypatch.delenv("ALERT_TOPIC_ARN", raising=False)
        assert notify.subscribe_guardian("g@example.com", "PMPFKR") is None


class TestPublish:
    def test_routes_on_family_code(self, sns):
        notify.publish_alert("PMPFKR", ALERT)
        attrs = sns.published[0]["MessageAttributes"]
        assert attrs["family_code"]["StringValue"] == "PMPFKR"

    def test_headline_is_included(self, sns):
        notify.publish_alert("PMPFKR", ALERT)
        assert ALERT["headline"] in sns.published[0]["Message"]

    def test_links_to_the_guardian_page(self, sns):
        notify.publish_alert("PMPFKR", ALERT)
        assert "/guardian" in sns.published[0]["Message"]

    def test_panic_says_so_in_the_subject(self, sns):
        notify.publish_alert("PMPFKR", {**ALERT, "kind": "panic"})
        assert "panic" in sns.published[0]["Subject"].lower()

    def test_subject_fits_the_sns_limit(self, sns):
        notify.publish_alert("PMPFKR", {**ALERT, "kind": "panic"})
        assert len(sns.published[0]["Subject"]) <= 100

    def test_the_checked_message_is_never_emailed(self, sns):
        """The guardian is told a scam was found, never what it said."""
        notify.publish_alert("PMPFKR", {**ALERT, "raw_text": SECRET_MESSAGE})
        body = sns.published[0]["Message"]
        assert SECRET_MESSAGE not in body
        assert "sbi-kyc-verify.in" not in body

    def test_failure_is_survivable(self, monkeypatch):
        monkeypatch.setattr(notify, "_sns", lambda: FakeSns(fail=True))
        monkeypatch.setenv("ALERT_TOPIC_ARN", "arn:topic")
        assert notify.publish_alert("PMPFKR", ALERT) is False

    def test_no_topic_configured_is_not_an_error(self, monkeypatch):
        monkeypatch.delenv("ALERT_TOPIC_ARN", raising=False)
        assert notify.publish_alert("PMPFKR", ALERT) is False


class TestAlertStillWorksWithoutEmail:
    def test_add_alert_survives_a_dead_sns(self, monkeypatch):
        """The in-app alarm must fire even when the email cannot be sent."""
        written = {}

        class FakeTable:
            def get_item(self, **k):
                return {}

            def put_item(self, **k):
                written.update(k)

        monkeypatch.setattr(family, "table", lambda: FakeTable())
        monkeypatch.setattr(notify, "_sns", lambda: FakeSns(fail=True))
        monkeypatch.setenv("ALERT_TOPIC_ARN", "arn:topic")

        alert_id = family.add_alert("PMPFKR", ALERT)
        assert alert_id, "the alert should still be recorded"
        assert written["Item"]["alerts"][0]["headline"] == ALERT["headline"]
