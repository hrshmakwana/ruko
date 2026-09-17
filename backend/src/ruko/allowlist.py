"""Official domains, and the brand words scammers borrow.

This file is the one most likely to cause real harm if it is wrong. Telling
someone their actual bank's website is a scam teaches them to ignore Ruko, so
the allowlist is deliberately generous and every entry is a domain the brand
genuinely operates.

Two things make it safer than a plain list:

1. `.gov.in`, `.nic.in` and `.bank.in` are **restricted** suffixes - you cannot
   buy one. Anything under them is treated as official.
2. A brand word only counts when it starts a label, so `sbi-kyc-verify.in`
   matches but `disbursement.example.com` does not.
"""

from __future__ import annotations

# Suffixes that cannot be bought by the public, so a match under them is real.
TRUSTED_SUFFIXES = (".gov.in", ".nic.in", ".bank.in", ".rbi.org.in")

# Brand word -> the domains that brand actually uses.
BRAND_DOMAINS: dict[str, frozenset[str]] = {
    "sbi": frozenset(
        {
            "sbi.co.in",
            "onlinesbi.sbi",
            "onlinesbi.com",
            "sbicard.com",
            "sbigeneral.in",
            "sbilife.co.in",
            "sbimf.com",
            "yonosbi.com",
        }
    ),
    "hdfc": frozenset(
        {
            "hdfcbank.com",
            "hdfc.com",
            "hdfcsec.com",
            "hdfclife.com",
            "hdfcfund.com",
            "hdfcergo.com",
        }
    ),
    "icici": frozenset(
        {
            "icicibank.com",
            "icicidirect.com",
            "icicilombard.com",
            "iciciprulife.com",
            "icicipruamc.com",
        }
    ),
    "axis": frozenset({"axisbank.com", "axisdirect.in", "axismf.com", "axismaxlife.com"}),
    "kotak": frozenset({"kotak.com", "kotaksecurities.com", "kotaklife.com", "kotakmf.com"}),
    "paytm": frozenset({"paytm.com", "paytm.in", "paytmbank.com", "paytmmall.com"}),
    "phonepe": frozenset({"phonepe.com", "phon.pe"}),
    "npci": frozenset({"npci.org.in", "bhimupi.org.in", "upichalega.com"}),
    "bhim": frozenset({"bhimupi.org.in", "npci.org.in"}),
    "uidai": frozenset({"uidai.gov.in"}),
    "aadhaar": frozenset({"uidai.gov.in"}),
    "incometax": frozenset({"incometax.gov.in", "incometaxindia.gov.in", "tin-nsdl.com"}),
    "epfo": frozenset({"epfindia.gov.in", "epfigms.gov.in"}),
    "indiapost": frozenset({"indiapost.gov.in", "ippbonline.com"}),
    "amazon": frozenset(
        {
            "amazon.in",
            "amazon.com",
            "amazon.co.uk",
            "amazonpay.in",
            "amazonaws.com",
            "primevideo.com",
        }
    ),
    "flipkart": frozenset({"flipkart.com", "flipkart.net", "flipkarthealthplus.com"}),
    "airtel": frozenset(
        {"airtel.in", "airtel.com", "airtelbank.com", "airtelxstream.in", "airtelpaymentsbank.com"}
    ),
    # Reliance runs a lot of jio* domains, so this list is kept wide on purpose.
    "jio": frozenset(
        {
            "jio.com",
            "jiopay.in",
            "reliancejio.com",
            "jiomart.com",
            "jiocinema.com",
            "jiosaavn.com",
            "jiofinance.com",
            "jiofiber.com",
        }
    ),
    "irctc": frozenset({"irctc.co.in", "irctc.com"}),
    "rbi": frozenset({"rbi.org.in"}),
    # Electricity boards: the disconnection-threat scam is one of the big ones.
    "mahadiscom": frozenset({"mahadiscom.in"}),
    "bses": frozenset({"bsesdelhi.com", "bses.com", "bsesbyplbill.com"}),
    "tatapower": frozenset({"tatapower.com", "tatapower-ddl.com"}),
    "torrentpower": frozenset({"torrentpower.com"}),
    "adanielectricity": frozenset({"adanielectricity.com"}),
    "cesc": frozenset({"cesc.co.in"}),
    "uppcl": frozenset({"uppcl.org", "uppclonline.com"}),
    "bescom": frozenset({"bescom.co.in", "bescom.org"}),
    "pspcl": frozenset({"pspcl.in"}),
    "kseb": frozenset({"kseb.in"}),
    # Gujarat's four boards run on .com, all on the same state hosting block
    # (103.160.190.x, checked with dig on 17 Sept). The .co.in look-alikes resolve
    # to parking and unrelated hosts. They were in this list by mistake, which
    # would have handed a squatter a free pass, so they are deliberately absent.
    "dgvcl": frozenset({"dgvcl.com"}),
    "mgvcl": frozenset({"mgvcl.com"}),
    "pgvcl": frozenset({"pgvcl.com"}),
    "ugvcl": frozenset({"ugvcl.com"}),
    "guvnl": frozenset({"guvnl.com"}),
}

BRAND_TOKENS = tuple(BRAND_DOMAINS)

# The domain to name when telling someone "the real one is ___". Alphabetical
# order would offer onlinesbi.com for SBI, which is real but is not the address
# people are told to remember.
BRAND_PRIMARY: dict[str, str] = {
    "sbi": "sbi.co.in",
    "hdfc": "hdfcbank.com",
    "icici": "icicibank.com",
    "axis": "axisbank.com",
    "kotak": "kotak.com",
    "paytm": "paytm.com",
    "phonepe": "phonepe.com",
    "npci": "npci.org.in",
    "bhim": "bhimupi.org.in",
    "uidai": "uidai.gov.in",
    "aadhaar": "uidai.gov.in",
    "incometax": "incometax.gov.in",
    "epfo": "epfindia.gov.in",
    "indiapost": "indiapost.gov.in",
    "amazon": "amazon.in",
    "flipkart": "flipkart.com",
    "airtel": "airtel.in",
    "jio": "jio.com",
    "irctc": "irctc.co.in",
    "rbi": "rbi.org.in",
}


def primary_domain(brand: str) -> str:
    """The address worth telling someone to remember for this brand."""
    if brand in BRAND_PRIMARY:
        return BRAND_PRIMARY[brand]
    return sorted(BRAND_DOMAINS[brand])[0]

# Every official domain in one set, so a brand word borrowed by another brand's
# real domain (say "amazonpay.in" containing "pay") is never flagged.
OFFICIAL_DOMAINS: frozenset[str] = frozenset().union(*BRAND_DOMAINS.values())

URL_SHORTENERS = frozenset(
    {
        "bit.ly",
        "tinyurl.com",
        "t.co",
        "goo.gl",
        "cutt.ly",
        "rb.gy",
        "is.gd",
        "shorturl.at",
        "ow.ly",
        "tiny.cc",
        "bit.do",
        "rebrand.ly",
        "short.gy",
        "t.ly",
        "shorte.st",
        "urlz.fr",
        "clck.ru",
        "surl.li",
    }
)

# Cheap TLDs that turn up far more often in scams than in anything legitimate.
RISKY_TLDS = frozenset(
    {"xyz", "top", "icu", "cyou", "buzz", "click", "link", "rest", "quest", "sbs", "cfd", "bond"}
)


def is_official(domain: str) -> bool:
    """True if this is a domain the real organisation operates."""
    domain = domain.lower().strip(".")
    if domain in OFFICIAL_DOMAINS:
        return True
    return any(domain == suffix.lstrip(".") or domain.endswith(suffix) for suffix in TRUSTED_SUFFIXES)


# Words that turn a brand name into bait. A domain with both is not ambiguous.
BAIT_WORDS = frozenset(
    {
        "kyc",
        "verify",
        "verification",
        "update",
        "login",
        "signin",
        "secure",
        "security",
        "refund",
        "cashback",
        "claim",
        "reward",
        "prize",
        "win",
        "offer",
        "bill",
        "pay",
        "payment",
        "otp",
        "account",
        "alert",
        "block",
        "unblock",
        "support",
        "help",
        "care",
        "service",
        "online",
        "net",
        "netbanking",
        "bank",
        "app",
        "download",
    }
)


def _label_starts_with(label: str, token: str) -> bool:
    """A brand word counts where a name would start, not in the middle.

    `sbi-kyc-verify`, `sbionline-update` and `axisbank-verify` all match, because
    each begins with the brand. `disbursement` does not, because "sbi" is buried
    inside it — which is exactly the false alarm this guard exists to prevent.
    """
    return label.startswith(token)


def bait_words_in_domain(domain: str) -> list[str]:
    """Bait words appearing as their own part of the domain."""
    parts: list[str] = []
    for label in domain.lower().split("."):
        parts.extend(p for p in label.split("-") if p)
    return [p for p in parts if p in BAIT_WORDS]


def brands_in_domain(domain: str) -> list[str]:
    """Brand words that appear at the start of any label in this domain."""
    labels = domain.lower().split(".")
    hits: list[str] = []
    for token in BRAND_TOKENS:
        for label in labels:
            # Hyphenated labels are several words: check each part too.
            parts = [label, *label.split("-")]
            if any(_label_starts_with(part, token) for part in parts if part):
                if token not in hits:
                    hits.append(token)
                break
    return hits
