import { useCallback, useEffect, useRef, useState } from "react";
import { CrossIcon, OkIcon, ScamIcon, SuspiciousIcon } from "./Icons";
import type { ListenStrings } from "../i18n/listen";
import { liveAnalyse, type LiveAlert } from "../lib/api";
import { startListening, type ListenSession, type ListenSource } from "../lib/listen";
import type { Language } from "../types";

interface Props {
  l: ListenStrings;
  language: Language;
  onBack: () => void;
  /** Set once a family is linked: the guardian is told during the call, not after. */
  familyCode?: string | null;
  familyToldLabel?: string;
}

/** Ruko listening to a call on speakerphone.
 *
 * The screen has one job while a scammer is talking: be readable at arm's
 * length by someone who is frightened. So the state of the call is one line and
 * one colour, the newest warning is on top, and the transcript — the part that
 * is interesting to build but useless in the moment — sits at the bottom.
 */
export function ListenScreen({ l, language, onBack, familyCode, familyToldLabel }: Props) {
  const [phase, setPhase] = useState<"idle" | "listening" | "stopped">("idle");
  const [source, setSource] = useState<{ kind: ListenSource; borrowed: boolean } | null>(null);
  const [settled, setSettled] = useState("");
  const [partial, setPartial] = useState("");
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [familyTold, setFamilyTold] = useState(false);

  const session = useRef<ListenSession | null>(null);
  const analysing = useRef(false);
  const lastAnalysed = useRef("");

  // Stop the microphone if the person navigates away mid-call.
  useEffect(() => () => session.current?.stop(), []);

  useEffect(() => {
    if (phase !== "listening") return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  /** Send what has been heard to the rules. Only the tail is sent: a long call
   *  does not need re-checking from the beginning, and shorter is cheaper. */
  const analyse = useCallback(
    async (text: string) => {
      if (analysing.current || text.length < 12 || text === lastAnalysed.current) return;
      analysing.current = true;
      lastAnalysed.current = text;
      try {
        const verdict = await liveAnalyse(text.slice(-1500), language, familyCode);
        if (verdict.family_told) setFamilyTold(true);
        setScore((previous) => Math.max(previous, verdict.risk_score));
        setAlerts((previous) => {
          const seen = new Set(previous.map((alert) => alert.rule));
          const fresh = verdict.alerts.filter((alert) => !seen.has(alert.rule));
          return fresh.length ? [...fresh, ...previous] : previous;
        });
      } catch {
        // A dropped check is not worth interrupting a live call for.
      } finally {
        analysing.current = false;
      }
    },
    [language, familyCode],
  );

  useEffect(() => {
    if (phase !== "listening" || !settled) return;
    const id = window.setTimeout(() => void analyse(settled), 900);
    return () => window.clearTimeout(id);
  }, [settled, phase, analyse]);

  async function start() {
    setError(null);
    setAlerts([]);
    setScore(0);
    setSettled("");
    setPartial("");
    setSeconds(0);
    setFamilyTold(false);
    lastAnalysed.current = "";
    setPhase("listening");

    session.current = await startListening(language, {
      onTranscript: (next, live) => {
        setSettled(next);
        setPartial(live);
      },
      onSource: (kind, _streamLanguage, borrowed) => setSource({ kind, borrowed }),
      onError: (kind) => {
        setError(
          kind === "mic_denied"
            ? l.micDenied
            : kind === "unsupported"
              ? l.unsupported
              : l.streamError,
        );
      },
      onStopped: (reason) => {
        setPhase("stopped");
        if (reason === "limit") setError(l.limitReached);
      },
    });
  }

  function stop() {
    session.current?.stop();
    session.current = null;
    setPhase("stopped");
    if (settled) void analyse(settled);
  }

  const danger = score >= 75;
  const warn = !danger && score >= 40;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => {
          session.current?.stop();
          onBack();
        }}
        className="inline-flex min-h-[44px] items-center gap-2 text-[0.95rem] font-bold text-muted"
      >
        ← {l.back}
      </button>

      <header className="space-y-1.5">
        <h1 className="text-[1.6rem] leading-tight font-extrabold tracking-tight">{l.heading}</h1>
        <p className="text-[0.98rem] text-muted">{l.sub}</p>
      </header>

      {/* The state of the call: one line, one colour, readable across a room. */}
      <section
        className={`rounded-3xl border-2 p-5 ${
          danger
            ? "ruko-slam border-transparent bg-red-panel text-white"
            : warn
              ? "border-amber-line bg-amber-tint"
              : "border-line bg-surface"
        }`}
      >
        <div className="flex items-start gap-3">
          {danger ? (
            <ScamIcon className="h-10 w-10 shrink-0" />
          ) : warn ? (
            <SuspiciousIcon className="h-10 w-10 shrink-0 text-amber" />
          ) : (
            <OkIcon className="h-10 w-10 shrink-0 text-green" />
          )}
          <div className="min-w-0">
            <p
              className={`text-[1.25rem] leading-snug font-extrabold ${
                warn ? "text-amber-ink" : ""
              }`}
            >
              {danger ? l.dangerTitle : warn ? l.warnTitle : l.nothingYet}
            </p>
            {phase === "listening" && (
              <p
                className={`mt-1 flex items-center gap-2 text-[0.92rem] font-semibold ${
                  danger ? "text-white/85" : "text-muted"
                }`}
              >
                <span className="ruko-lamp-live inline-block h-2.5 w-2.5 rounded-full bg-red" />
                {l.listening} {Math.floor(seconds / 60)}:
                {String(seconds % 60).padStart(2, "0")}
              </p>
            )}
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={phase === "listening" ? stop : () => void start()}
        className={`min-h-[64px] w-full rounded-2xl px-5 text-[1.15rem] font-extrabold ${
          phase === "listening"
            ? "border-2 border-line bg-surface text-ink"
            : "bg-action text-on-action"
        }`}
      >
        {phase === "listening" ? l.stop : l.start}
      </button>

      {source && phase === "listening" && (
        <p className="text-center text-[0.85rem] text-muted">
          {source.kind === "transcribe" ? l.sourceTranscribe : l.sourceDevice}
          {source.borrowed && <span className="block">{l.borrowedNote}</span>}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-amber-line bg-amber-tint px-3 py-2 text-[0.92rem] font-semibold text-amber-ink"
        >
          {error}
        </p>
      )}

      {familyTold && familyToldLabel && (
        <p className="ruko-rise rounded-2xl border-2 border-green-line bg-green-tint px-4 py-3 text-[0.95rem] font-bold text-green-ink">
          {familyToldLabel}
        </p>
      )}

      {alerts.length > 0 && (
        <section className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.rule}
              className="ruko-rise flex gap-3 rounded-2xl border-2 border-red-line bg-red-tint p-4"
            >
              <CrossIcon className="mt-0.5 h-6 w-6 shrink-0 text-red" />
              <div className="min-w-0">
                <p className="text-[0.98rem] font-bold break-words text-red-ink">
                  “{alert.evidence}”
                </p>
                <p className="mt-0.5 text-[0.93rem] text-red-ink/90">{alert.why}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {(settled || partial) && (
        <section className="rounded-2xl border border-line bg-sunken p-4">
          <h2 className="text-[0.78rem] font-bold uppercase tracking-wider text-muted">
            {l.heardLabel}
          </h2>
          <p className="mt-2 text-[0.95rem] leading-relaxed">
            {settled} <span className="text-muted">{partial}</span>
          </p>
        </section>
      )}

      <p className="rounded-2xl bg-sunken px-4 py-3 text-[0.85rem] text-muted">{l.privacy}</p>
    </div>
  );
}
