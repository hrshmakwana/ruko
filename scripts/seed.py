#!/usr/bin/env python3
"""Seed the community indicator table with clearly-labelled demo reports.

    python3 scripts/seed.py --table ruko-prod --region us-east-1

Without this the community counts are empty on day one, and "reported 0 times"
tells nobody anything. These are demo values taken from the synthetic samples,
not real reports, and the video says so out loud.

Pass --clear to remove exactly what this script seeds.
"""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend" / "src"))

import boto3  # noqa: E402

from ruko.store import INDICATOR_TTL_SECONDS, indicator_key, mask  # noqa: E402

# (kind, value, report_count). Values come from samples/synthetic so a demo
# check lights up the community section.
SEED = [
    ("url", "sbi-kyc-verify.in", 14),
    ("url", "bijli-bill-update.xyz", 9),
    ("url", "fedex-india-customs.top", 7),
    ("url", "dailyearn-task.xyz", 11),
    ("url", "rupee-instant-loan.click", 6),
    ("url", "sbionline-update.xyz", 5),
    ("url", "hdfc-secure-login.com", 8),
    ("url", "paytm-refund.xyz", 12),
    ("url", "icici-kyc.top", 4),
    ("url", "uidai-aadhaar-update.in", 6),
    ("phone", "9876543210", 21),
    ("phone", "9812345678", 8),
    ("phone", "9765432100", 13),
    ("phone", "9988776655", 5),
    ("phone", "9123456780", 9),
    ("upi", "refund@okaxis", 17),
    ("upi", "refunds.desk@okicici", 10),
    ("upi", "hospital.help@ybl", 4),
    ("upi", "kbcprize@paytm", 6),
    ("upi", "quickloan.help@ybl", 3),
]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--table", required=True)
    parser.add_argument("--region", default="us-east-1")
    parser.add_argument("--clear", action="store_true", help="Delete the seeded rows instead")
    args = parser.parse_args()

    table = boto3.resource("dynamodb", region_name=args.region).Table(args.table)
    now = int(time.time())

    if args.clear:
        for kind, value, _ in SEED:
            table.delete_item(Key={"pk": indicator_key(kind, value)})
        print(f"removed {len(SEED)} seeded indicators from {args.table}")
        return 0

    with table.batch_writer() as batch:
        for kind, value, count in SEED:
            batch.put_item(
                Item={
                    "pk": indicator_key(kind, value),
                    "kind": kind,
                    "masked": mask(kind, value),
                    "report_count": count,
                    "last_reported": now,
                    "last_scam_type": "other_scam",
                    "seeded": True,
                    "ttl": now + INDICATOR_TTL_SECONDS,
                }
            )

    print(f"seeded {len(SEED)} demo indicators into {args.table}")
    for kind, value, count in SEED[:5]:
        print(f"  {kind:<6} {mask(kind, value):<26} {count} reports")
    print("  ...")
    print("\nThese are demo values, not real reports. Say so in the video.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
