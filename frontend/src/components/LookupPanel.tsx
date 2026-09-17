import { useState } from "react";
import type { Strings } from "../i18n";
import type { LookupStrings } from "../i18n/lookup";
import { checkMessage, reportScam } from "../lib/api";
import type { Language, Verdict } from "../types";
import { ScamIcon, ShieldIcon, SuspiciousIcon } from "./Icons";

interface Props {
  t: Strings;
  l: LookupStrings;
  language: Language;
}

/** Check a bare number, UPI ID or website before calling back or paying.
 *
 * It reuses /check rather than a separate endpoint: the backend already pulls
 * the identifier out, runs the domain rules on it, and attaches community
 * counts. What changes is the question being answered, so the result is its
 * own compact card rather than the full message verdict.
 *
 * The family code is deliberately not sent. A lookup is a precaution taken
 * before any contact, and alarming a guardian every time someone checks a
 * number would teach them to ignore the alarm that matters.
 */
export function LookupPanel({ t, l, language }: Props) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reported, setReported] = useState(false);

  async function lookUp() {
    const value = input.trim();
    if (!value) return;
    setBusy(true);
    setError(null);
    setReported(false);
    try {
      setVerdict(await checkMessage({ text: value, language }));
    } catch {
      setError(t.networkError);
      setVerdict(null);
    } finally {
      setBusy(false);
    }
  }

  const found =
    verdict &&
    (verdict.extracted.phone_numbers.length > 0 ||
      verdict.extracted.upi_ids.length > 0 ||
      verdict.extracted.urls.length > 0);
  const totalReports = verdict?.community.reduce((sum, hit) => sum + hit.report_count, 0) ?? 0;
  // One clear reason beats two overlapping ones for a single identifier: a
  // domain like "kyc-verify" trips both the lookalike rule and the KYC phrase
  // rule. The backend sorts by severity, so the first is the strongest.
  const ruleFlags = (verdict?.red_flags.filter((flag) => flag.source === "rule") ?? []).slice(0, 1);

  return (
    <div className="space-y-5">
      <header className="ruko-rise space-y-1.5">
        <h1 className="text-[1.75rem] leading-tight font-extrabold tracking-tight">{l.heading}</h1>
        <p className="text-[0.98rem] text-muted">{l.sub}</p>
      </header>

      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm">
        <input
          id="lookup-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setVerdict(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") void lookUp();
          }}
          placeholder={l.placeholder}
          inputMode="text"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label={l.modeLookup}
          className="min-h-[60px] w-full rounded-2xl border border-line bg-sunken px-4 font-mono text-[1.15rem] tracking-wide focus:border-action focus:outline-none"
        />
        <button
          type="button"
          onClick={() => void lookUp()}
          disabled={busy || !input.trim()}
          className="mt-3 min-h-[58px] w-full rounded-2xl bg-action px-5 text-[1.1rem] font-extrabold text-on-action disabled:opacity-50"
        >
          {busy ? l.checking : l.button}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-2xl border-2 border-red-line bg-red-tint px-4 py-3 text-[0.95rem] font-semibold text-red-ink"
        >
          {error}
        </p>
      )}

      {verdict && !found && (
        <p className="ruko-rise rounded-2xl border border-line bg-sunken px-4 py-3 text-[0.98rem] font-semibold">
          {l.nothingFound}
        </p>
      )}

      {verdict && found && totalReports > 0 && (
        <section
          aria-live="polite"
          className="ruko-slam rounded-3xl border-2 border-transparent bg-red-panel p-5 text-white"
        >
          <div className="flex items-start gap-3">
            <ScamIcon className="h-10 w-10 shrink-0" />
            <div className="min-w-0">
              <p className="text-[1.35rem] leading-tight font-extrabold">
                {l.reported(totalReports)}
              </p>
              <ul className="mt-2 space-y-1">
                {verdict.community.map((hit) => (
                  <li key={hit.masked} className="font-mono text-[0.95rem] opacity-90">
                    {hit.masked} · {hit.report_count}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[1rem] leading-snug font-bold">{l.reportedAdvice}</p>
            </div>
          </div>
        </section>
      )}

      {/* No community reports, but the rules still caught something — a
          lookalike bank domain, a shortener, an .apk link. */}
      {verdict && found && totalReports === 0 && ruleFlags.length > 0 && (
        <section
          aria-live="polite"
          className="ruko-rise rounded-3xl border-2 border-amber-line bg-amber-tint p-5"
        >
          <div className="flex items-start gap-3">
            <SuspiciousIcon className="h-9 w-9 shrink-0 text-amber" />
            <ul className="min-w-0 space-y-2">
              {ruleFlags.map((flag, i) => (
                <li key={i} className="text-[1rem] leading-snug font-bold text-amber-ink">
                  {flag.why}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {verdict && found && totalReports === 0 && ruleFlags.length === 0 && (
        <section
          aria-live="polite"
          className="ruko-rise rounded-3xl border border-line bg-surface p-5"
        >
          <div className="flex items-start gap-3">
            <ShieldIcon className="h-9 w-9 shrink-0 text-muted" />
            <div>
              <p className="text-[1.2rem] font-extrabold">{l.noReports}</p>
              <p className="mt-1 text-[0.95rem] leading-snug text-muted">{l.noReportsAdvice}</p>
            </div>
          </div>
        </section>
      )}

      {verdict && found && (
        <button
          type="button"
          disabled={reported}
          onClick={async () => {
            setReported(true);
            try {
              await reportScam(verdict.check_id);
            } catch {
              // Best effort, as on the verdict screen.
            }
          }}
          className="min-h-[54px] w-full rounded-2xl border-2 border-line bg-surface px-5 text-[1.02rem] font-bold disabled:opacity-60"
        >
          {reported ? l.reportedThanks : l.report}
        </button>
      )}
    </div>
  );
}
