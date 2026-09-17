"""Pull the checkable facts out of a message.

Deterministic and dependency-free. Whatever comes out of here is what the rules
engine runs on, and what the verdict reports back as `extracted`.
"""

from __future__ import annotations

import re

# --- domains --------------------------------------------------------------

# Two-level public suffixes we care about. Not the full Public Suffix List, but
# it covers India plus the few foreign suffixes that turn up in Indian scams.
MULTI_LABEL_SUFFIXES = frozenset(
    {
        "co.in",
        "net.in",
        "org.in",
        "gen.in",
        "firm.in",
        "ind.in",
        "gov.in",
        "nic.in",
        "ac.in",
        "edu.in",
        "res.in",
        "bank.in",
        "co.uk",
        "org.uk",
        "com.au",
        "co.nz",
        "com.sg",
    }
)

_URL_RE = re.compile(
    r"""(?xi)
    \b
    (?:https?://|www\.)?              # optional scheme or www
    (
      (?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+   # labels
      (?:[a-z]{2,24}|xn--[a-z0-9-]{2,59})            # tld, incl. punycode
    )
    (/[^\s<>"')\]]*)?                  # optional path
    """
)

_IP_URL_RE = re.compile(
    r"(?i)\b(?:https?://)?((?:\d{1,3}\.){3}\d{1,3})(?::\d{1,5})?(/[^\s<>\"')\]]*)?"
)

# A UPI handle has no dot after the @ - that is what separates it from an email.
_UPI_RE = re.compile(r"(?i)\b([a-z0-9][a-z0-9._-]{1,63})@([a-z][a-z0-9]{1,31})\b")

_PHONE_RE = re.compile(
    r"""(?x)
    (?<![0-9])
    (?:\+?91[\s-]?|0[\s-]?)?     # optional country code or trunk 0
    (                            # Indian mobiles start 6-9, and are written
      [6-9]\d{4}[\s-]?\d{5}       #   98765 43210   (the usual way)
      |[6-9]\d{2}[\s-]?\d{3}[\s-]?\d{4}  #   987 654 3210
      |[6-9]\d{9}                #   9876543210
    )
    (?![0-9])
    """
)

_AMOUNT_RE = re.compile(
    r"""(?xi)
    (?:₹|\bRs\.?|\bINR|\brupees?)\s*
    (\d[\d,]*(?:\.\d{1,2})?)
    \s*(lakh|lakhs|lac|crore|crores|k\b)?
    """
)

_TXN_RE = re.compile(
    r"""(?xi)
    \b(?:utr|txn|transaction|ref|reference|order)\s*
    (?:id|no\.?|number|\#)?\s*[:\-]?\s*
    ([A-Z0-9]{8,24})\b
    """
)

# Words that look like a TLD but are really sentence noise ("update.Your").
_NOT_A_TLD = frozenset({"your", "the", "and", "for", "please", "now", "today"})


def registrable_domain(host: str) -> str:
    """Reduce a hostname to the part someone actually registered.

    `login.sbi-kyc.co.in` -> `sbi-kyc.co.in`. Approximate, but it is the level
    at which a lookalike is judged, so getting it roughly right matters more
    than shipping the full Public Suffix List.
    """
    host = host.strip().strip(".").lower()
    labels = host.split(".")
    if len(labels) <= 2:
        return host
    if ".".join(labels[-2:]) in MULTI_LABEL_SUFFIXES:
        return ".".join(labels[-3:])
    return ".".join(labels[-2:])


def extract_urls(text: str) -> tuple[list[str], list[str]]:
    """Return (full urls as written, registrable domains), both de-duplicated."""
    urls: list[str] = []
    domains: list[str] = []

    for match in _URL_RE.finditer(text):
        host = match.group(1).lower()
        tld = host.rsplit(".", 1)[-1]
        if tld in _NOT_A_TLD:
            continue
        # An email address is not a link; skip anything preceded by "@".
        if match.start() > 0 and text[match.start() - 1] == "@":
            continue
        whole = match.group(0).strip().rstrip(".,;:!?)")
        if whole not in urls:
            urls.append(whole)
        domain = registrable_domain(host)
        if domain not in domains:
            domains.append(domain)

    for match in _IP_URL_RE.finditer(text):
        octets = match.group(1).split(".")
        if all(o.isdigit() and int(o) <= 255 for o in octets):
            whole = match.group(0).strip().rstrip(".,;:!?)")
            if whole not in urls:
                urls.append(whole)

    return urls, domains


def extract_upi_ids(text: str) -> list[str]:
    found: list[str] = []
    for match in _UPI_RE.finditer(text):
        upi = f"{match.group(1)}@{match.group(2)}".lower()
        # Followed by a dot and more letters means it was really an email.
        tail = text[match.end() : match.end() + 2]
        if tail.startswith(".") and len(tail) > 1 and tail[1].isalpha():
            continue
        if upi not in found:
            found.append(upi)
    return found


def extract_phone_numbers(text: str) -> list[str]:
    """Indian mobile numbers, normalised to the last 10 digits."""
    found: list[str] = []
    for match in _PHONE_RE.finditer(text):
        # "98765 43210" and "98765-43210" are the same number as "9876543210".
        number = re.sub(r"\D", "", match.group(1))
        if number not in found:
            found.append(number)
    return found


def extract_amounts(text: str) -> list[str]:
    found: list[str] = []
    for match in _AMOUNT_RE.finditer(text):
        value = match.group(1)
        unit = (match.group(2) or "").lower()
        label = f"₹{value}"
        if unit:
            label += f" {unit}"
        if label not in found:
            found.append(label)
    return found


def extract_transaction_ids(text: str) -> list[str]:
    found: list[str] = []
    for match in _TXN_RE.finditer(text):
        txn = match.group(1).upper()
        # All-letters is almost always a word the pattern swallowed.
        if txn.isalpha():
            continue
        if txn not in found:
            found.append(txn)
    return found


def extract_all(text: str) -> dict:
    """Everything the rules engine and the verdict need, in one pass."""
    urls, domains = extract_urls(text)
    return {
        "urls": urls,
        "domains": domains,
        "upi_ids": extract_upi_ids(text),
        "phone_numbers": extract_phone_numbers(text),
        "amounts": extract_amounts(text),
        "transaction_ids": extract_transaction_ids(text),
        "sender_name": None,
        "platform": None,
    }
