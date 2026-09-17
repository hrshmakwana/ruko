"""The verdict contract.

Everything the API returns from /check goes through here, so the frontend only
ever has to understand one shape.
"""

from __future__ import annotations

from typing import Any

LANGUAGES = ("en", "hi", "gu")

# Never the word "safe" - the strongest thing Ruko will say is "no scam signs".
RISK_LEVELS = ("no_scam_signs", "suspicious", "scam")

SCAM_TYPES = (
    "digital_arrest",
    "kyc_update",
    "electricity_bill",
    "parcel_customs",
    "upi_refund_collect",
    "investment_trading",
    "task_job",
    "lottery_prize",
    "loan_app",
    "fake_customer_care",
    "relative_in_trouble",
    "blackmail",
    "other_scam",
    "none_detected",
)

RED_FLAG_SOURCES = ("rule", "model")

MAX_TEXT_CHARS = 4000
MAX_RED_FLAGS = 5
MAX_CONSEQUENCE_STEPS = 5


def level_from_score(score: int) -> str:
    """Score bands, fixed in one place so the model can never invent a level."""
    if score >= 75:
        return "scam"
    if score >= 40:
        return "suspicious"
    return "no_scam_signs"


def empty_extracted() -> dict[str, Any]:
    return {
        "urls": [],
        "upi_ids": [],
        "phone_numbers": [],
        "amounts": [],
        "transaction_ids": [],
        "sender_name": None,
        "platform": None,
    }


def normalise_language(value: Any) -> str:
    lang = (value or "en") if isinstance(value, str) else "en"
    lang = lang.strip().lower()[:2]
    return lang if lang in LANGUAGES else "en"


def build_verdict(
    *,
    check_id: str,
    risk_score: int,
    scam_type: str,
    headline: str,
    red_flags: list[dict],
    do_now: list[str],
    dont_do: list[str],
    language: str,
    consequence_chain: list[dict] | None = None,
    callback_script: str | None = None,
    teach_me: str | None = None,
    complaint: dict | None = None,
    extracted: dict | None = None,
    community: list[dict] | None = None,
    rule_hits: list[str] | None = None,
    partial: bool = False,
    engine: str = "model",
) -> dict:
    """Assemble a verdict, clamping every field to the contract."""
    score = max(0, min(100, int(risk_score)))
    return {
        "check_id": check_id,
        "risk_level": level_from_score(score),
        "risk_score": score,
        "scam_type": scam_type if scam_type in SCAM_TYPES else "other_scam",
        "headline": headline,
        "red_flags": [
            {
                "evidence": str(f.get("evidence", ""))[:200],
                "why": str(f.get("why", ""))[:300],
                "source": f.get("source") if f.get("source") in RED_FLAG_SOURCES else "model",
            }
            for f in (red_flags or [])[:MAX_RED_FLAGS]
        ],
        "do_now": [str(s)[:200] for s in (do_now or [])[:4]],
        "dont_do": [str(s)[:200] for s in (dont_do or [])[:3]],
        # What the scammer is trying to make happen. The last step is the loss,
        # which is what actually lands with someone who shrugs off a score.
        "consequence_chain": [
            {
                "step": str(s.get("step", ""))[:200],
                "is_loss": bool(s.get("is_loss", False)),
            }
            for s in (consequence_chain or [])[:MAX_CONSEQUENCE_STEPS]
        ],
        "callback_script": str(callback_script)[:400] if callback_script else None,
        "teach_me": str(teach_me)[:240] if teach_me else None,
        "complaint": complaint,
        "extracted": extracted or empty_extracted(),
        "community": community or [],
        "language": normalise_language(language),
        "rule_hits": rule_hits or [],
        "partial": partial,
        # Which path produced this: "stub", "rules", or "model". Debug/eval only.
        "engine": engine,
    }
