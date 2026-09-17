#!/usr/bin/env python3
"""Run every sample against a Ruko /check endpoint and score the result.

    python3 scripts/eval.py --api https://xxxx.execute-api.us-east-1.amazonaws.com/prod

The headline number is not accuracy. It is **missed scams** - scams shown to
someone as "no scam signs". That number has to be zero; everything else is a
matter of degree.

Add --local to run the pipeline in-process instead of over HTTP, which works
without a deployment (and without Bedrock, falling back to rules only).
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import statistics
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SAMPLES = ROOT / "samples"

LEVELS = ("no_scam_signs", "suspicious", "scam")

BOLD, DIM, RED, GREEN, YELLOW, RESET = (
    "\033[1m",
    "\033[2m",
    "\033[31m",
    "\033[32m",
    "\033[33m",
    "\033[0m",
)


def load_cases(include_private: bool) -> list[dict]:
    cases: list[dict] = []
    for name in ("expected.csv", "private/expected.csv"):
        path = SAMPLES / name
        if not path.exists():
            continue
        if name.startswith("private") and not include_private:
            continue
        base = path.parent
        with path.open(encoding="utf-8") as handle:
            for row in csv.DictReader(handle):
                if not row.get("file"):
                    continue
                row["_path"] = base / row["file"]
                row["_private"] = name.startswith("private")
                cases.append(row)
    return cases


def call_http(api: str, text: str, language: str) -> dict:
    payload = json.dumps({"text": text, "language": language}).encode()
    request = urllib.request.Request(
        f"{api.rstrip('/')}/check",
        data=payload,
        headers={"content-type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        return json.loads(response.read())


def call_local(text: str, language: str) -> dict:
    sys.path.insert(0, str(ROOT / "backend" / "src"))
    os.environ.setdefault("TABLE_NAME", "ruko-local-eval")
    os.environ.setdefault("UPLOADS_BUCKET", "ruko-local-eval")
    os.environ.setdefault("BEDROCK_MODEL_ID", os.environ.get("BEDROCK_MODEL_ID", "us.amazon.nova-2-lite-v1:0"))

    from handlers import check as handler
    from ruko import store

    # No table locally: community lookups return nothing and writes are dropped.
    store.report_counts = lambda indicators: []
    store.save_check = lambda *a, **k: None

    event = {"body": json.dumps({"text": text, "language": language})}
    return json.loads(handler.lambda_handler(event, None)["body"])


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--api", help="Base URL of the deployed API")
    parser.add_argument("--local", action="store_true", help="Run the pipeline in-process")
    parser.add_argument("--private", action="store_true", help="Include samples/private")
    parser.add_argument("--json", dest="json_out", help="Write the full results to this file")
    args = parser.parse_args()

    if not args.api and not args.local:
        parser.error("pass --api <url> or --local")

    cases = load_cases(args.private)
    if not cases:
        print("no samples found")
        return 1

    results = []
    print(f"\n{BOLD}Ruko eval{RESET}  {len(cases)} samples  "
          f"{'local' if args.local else args.api}\n")
    header = f"{'sample':<38} {'expected':<14} {'got':<14} {'score':>5} {'ms':>6}  type"
    print(DIM + header + RESET)
    print(DIM + "-" * len(header) + RESET)

    for case in cases:
        path = case["_path"]
        if not path.exists():
            print(f"{path.name:<38} {RED}missing file{RESET}")
            continue

        text = path.read_text(encoding="utf-8").strip()
        language = case.get("language") or "en"
        started = time.perf_counter()
        try:
            verdict = call_local(text, language) if args.local else call_http(args.api, text, language)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            print(f"{path.name:<38} {RED}request failed: {type(exc).__name__}{RESET}")
            continue
        elapsed = (time.perf_counter() - started) * 1000

        expected_level = case["expected_level"]
        got_level = verdict["risk_level"]
        expected_type = case["expected_type"]
        got_type = verdict["scam_type"]

        level_ok = got_level == expected_level
        # A scam called "suspicious" is a partial win; called "no scam signs" is a miss.
        missed = expected_level == "scam" and got_level == "no_scam_signs"
        false_alarm = expected_level == "no_scam_signs" and got_level == "scam"

        colour = GREEN if level_ok else (RED if (missed or false_alarm) else YELLOW)
        type_mark = "" if got_type == expected_type else f"  {DIM}(want {expected_type}){RESET}"
        print(
            f"{path.name:<38} {expected_level:<14} {colour}{got_level:<14}{RESET} "
            f"{verdict['risk_score']:>5} {elapsed:>6.0f}  {got_type}{type_mark}"
        )

        results.append(
            {
                "file": str(path.relative_to(SAMPLES)),
                "private": case["_private"],
                "expected_level": expected_level,
                "got_level": got_level,
                "expected_type": expected_type,
                "got_type": got_type,
                "score": verdict["risk_score"],
                "rule_hits": verdict.get("rule_hits", []),
                "engine": verdict.get("engine"),
                "ms": round(elapsed),
                "level_ok": level_ok,
                "missed_scam": missed,
                "false_alarm": false_alarm,
            }
        )

    if not results:
        return 1

    total = len(results)
    level_ok = sum(r["level_ok"] for r in results)
    type_ok = sum(r["got_type"] == r["expected_type"] for r in results)
    missed = [r for r in results if r["missed_scam"]]
    false_alarms = [r for r in results if r["false_alarm"]]
    latencies = [r["ms"] for r in results]

    print()
    print(f"{BOLD}Level accuracy{RESET}    {level_ok}/{total}  ({level_ok / total:.0%})")
    print(f"{BOLD}Scam type match{RESET}   {type_ok}/{total}  ({type_ok / total:.0%})")
    missed_colour = GREEN if not missed else RED
    print(
        f"{BOLD}Missed scams{RESET}      {missed_colour}{len(missed)}{RESET}"
        f"   {DIM}(a scam shown as 'no scam signs' — target 0){RESET}"
    )
    fa_colour = GREEN if not false_alarms else RED
    print(
        f"{BOLD}False alarms{RESET}      {fa_colour}{len(false_alarms)}{RESET}"
        f"   {DIM}(a genuine message called a scam — target 0){RESET}"
    )
    print(
        f"{BOLD}Latency{RESET}           median {statistics.median(latencies):.0f} ms, "
        f"max {max(latencies)} ms"
    )

    for row in missed:
        print(f"  {RED}MISSED{RESET} {row['file']}  score {row['score']}  rules {row['rule_hits']}")
    for row in false_alarms:
        print(f"  {RED}ALARM {RESET} {row['file']}  score {row['score']}  rules {row['rule_hits']}")

    if args.json_out:
        Path(args.json_out).write_text(json.dumps(results, indent=2), encoding="utf-8")
        print(f"\nfull results written to {args.json_out}")

    print()
    return 1 if missed or false_alarms else 0


if __name__ == "__main__":
    raise SystemExit(main())
