import { useCallback, useEffect, useRef, useState } from "react";
import { ScamIcon, OkIcon, CrossIcon, ShieldIcon, SuspiciousIcon } from "../components/Icons";
import { primeAlarm, startAlarm, vibrate } from "../lib/alarm";
import {
  fetchAlerts,
  loadSession,
  login,
  saveSession,
  sendDirective,
  signup,
  type Alert,
  type Session,
} from "../lib/guardian";

const POLL_MS = 5000;

function timeAgo(seconds: number): string {
  const delta = Math.max(0, Math.floor(Date.now() / 1000) - seconds);
  if (delta < 60) return "just now";
  if (delta < 3600) return `${Math.floor(delta / 60)} min ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)} h ago`;
  return `${Math.floor(delta / 86400)} d ago`;
}

/** The other side of Ruko: the son or daughter who gets told.
 *
 * English only for now — this half is used by the family member who set Ruko
 * up, not by the person it protects. The protected person's screens are in all
 * fifteen languages.
 */
export default function Guardian() {
  const [session, setSession] = useState<Session | null>(loadSession);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<"stop" | "safe" | null>(null);
  const [emailDismissed, setEmailDismissed] = useState(() => {
    try {
      return localStorage.getItem("ruko.guardian.emailNoticeDone") === "1";
    } catch {
      return false;
    }
  });
  const lastSeen = useRef<number>(0);

  const poll = useCallback(async () => {
    if (!session) return;
    try {
      const data = await fetchAlerts(session.token);
      setAlerts(data.alerts);
      const newest = data.alerts[0];
      if (newest && newest.at > lastSeen.current) {
        // Skip the alarm on the very first load, or signing in at breakfast
        // would set off a siren about last night's alert.
        if (lastSeen.current !== 0) {
          startAlarm(newest.kind === "panic" ? 8 : 4);
          vibrate();
        }
        lastSeen.current = newest.at;
      }
    } catch (err) {
      if (err instanceof Error && "code" in err && err.code === "unauthorised") {
        saveSession(null);
        setSession(null);
      }
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    void poll();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void poll();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [session, poll]);

  async function respond(action: "stop" | "safe") {
    if (!session) return;
    setBusy(true);
    try {
      await sendDirective(session.token, action, { alert_id: alerts[0]?.id });
      setSent(action);
      setTimeout(() => setSent(null), 4000);
      void poll();
    } finally {
      setBusy(false);
    }
  }

  if (!session) {
    return <SignIn onSignedIn={setSession} />;
  }

  const live = alerts.filter((a) => !a.acknowledged);

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <span className="flex min-h-[44px] items-center gap-2">
            <ShieldIcon className="h-8 w-8 text-action" />
            <span className="text-[1.3rem] font-extrabold tracking-tight">Ruko · Family</span>
          </span>
          <button
            type="button"
            onClick={() => {
              saveSession(null);
              setSession(null);
            }}
            className="min-h-[44px] text-[0.9rem] font-bold text-muted"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 space-y-5 px-4 py-5">
        {/* The code is the whole setup: read it out, they type it in. */}
        <section className="rounded-3xl border-2 border-action-soft bg-surface p-5 text-center">
          <p className="text-[0.78rem] font-bold uppercase tracking-wider text-muted">
            Your family code
          </p>
          <p className="mt-2 font-mono text-[2.6rem] leading-none font-extrabold tracking-[0.25em]">
            {session.family_code}
          </p>
          <p className="mx-auto mt-3 max-w-sm text-[0.92rem] text-muted">
            Read this out to the person you want to protect. They enter it once in Ruko, and you
            are told the moment Ruko finds a scam.
          </p>
          <button
            type="button"
            onClick={() => void navigator.clipboard?.writeText(session.family_code)}
            className="mt-3 min-h-[44px] rounded-xl border border-line px-4 text-[0.9rem] font-bold"
          >
            Copy code
          </button>
        </section>

        {/* SNS drops mail to an unconfirmed address silently, so say it rather
            than letting them assume they are covered. */}
        {!emailDismissed && (
          <section className="flex items-start gap-3 rounded-2xl border-2 border-amber-line bg-amber-tint p-4">
            <SuspiciousIcon className="mt-0.5 h-6 w-6 shrink-0 text-amber" />
            <div className="min-w-0 flex-1">
              <p className="text-[0.98rem] font-bold text-amber-ink">
                Confirm your email to get alerts when this page is closed
              </p>
              <p className="mt-1 text-[0.88rem] text-amber-ink/85">
                AWS has sent you a “Subscription Confirmation” email. Tap the link in it once, and
                we can reach you even when Ruko is not open.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmailDismissed(true);
                  try {
                    localStorage.setItem("ruko.guardian.emailNoticeDone", "1");
                  } catch {
                    /* private browsing */
                  }
                }}
                className="mt-2 inline-flex min-h-[44px] items-center text-[0.88rem] font-bold text-amber-ink underline"
              >
                I have confirmed it
              </button>
            </div>
          </section>
        )}

        {live.length > 0 && (
          <section className="ruko-slam rounded-3xl border-2 border-transparent bg-red-panel p-5 text-white">
            <div className="flex items-start gap-3">
              <ScamIcon className="h-9 w-9 shrink-0" />
              <div className="min-w-0">
                <p className="text-[0.78rem] font-bold uppercase tracking-wider opacity-90">
                  {live[0].kind === "panic" ? "They pressed the panic button" : "Scam detected"}
                  {" · "}
                  {timeAgo(live[0].at)}
                </p>
                <p className="mt-1 text-[1.2rem] leading-snug font-extrabold">{live[0].headline}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <button
                type="button"
                onClick={() => void respond("stop")}
                disabled={busy}
                className="min-h-[58px] w-full rounded-2xl bg-white px-5 text-[1.05rem] font-extrabold text-red-panel disabled:opacity-60"
              >
                {sent === "stop" ? "Sent — it is on their screen" : "Tell them to STOP"}
              </button>
              <button
                type="button"
                onClick={() => void respond("safe")}
                disabled={busy}
                className="min-h-[52px] w-full rounded-2xl border-2 border-white/40 px-5 text-[1rem] font-bold text-white disabled:opacity-60"
              >
                {sent === "safe" ? "Sent" : "Tell them it is fine"}
              </button>
              <a
                href="tel:"
                className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-black/25 px-5 text-[1rem] font-bold text-white"
              >
                Call them
              </a>
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-2 text-[0.78rem] font-bold uppercase tracking-wider text-muted">
            Recent activity
          </h2>
          {alerts.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-6 text-center">
              <OkIcon className="mx-auto h-9 w-9 text-green" />
              <p className="mt-2 text-[1rem] font-bold">Nothing yet</p>
              <p className="mt-1 text-[0.9rem] text-muted">
                This page checks every few seconds. Leave it open, or open it when you get a call.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="flex gap-3 rounded-2xl border border-line bg-surface p-4"
                >
                  {alert.kind === "panic" ? (
                    <CrossIcon className="mt-0.5 h-6 w-6 shrink-0 text-red" />
                  ) : (
                    <ScamIcon className="mt-0.5 h-6 w-6 shrink-0 text-red" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.98rem] font-semibold">{alert.headline}</p>
                    <p className="mt-0.5 text-[0.82rem] text-muted">
                      {timeAgo(alert.at)}
                      {alert.risk_score > 0 && ` · risk ${alert.risk_score}/100`}
                      {alert.acknowledged && " · handled"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="rounded-2xl bg-sunken px-4 py-3 text-[0.85rem] text-muted">
          You see that something was flagged and what kind of scam it was. You never see the message
          itself — Ruko does not store it.
        </p>
      </main>
    </div>
  );
}

function SignIn({ onSignedIn }: { onSignedIn: (session: Session) => void }) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    // Browsers only allow sound after a real interaction — prime it here so the
    // alarm can fire later without asking.
    primeAlarm();
    try {
      const session = await (mode === "signup" ? signup : login)(email.trim(), password);
      saveSession(session);
      onSignedIn(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="bg-housing px-4 py-10 text-white">
        <div className="mx-auto max-w-md">
          <span className="flex items-center gap-2">
            <ShieldIcon className="h-8 w-8" />
            <span className="text-[1.3rem] font-extrabold tracking-tight">Ruko · Family</span>
          </span>
          <h1 className="mt-5 text-[1.9rem] leading-tight font-extrabold tracking-tight">
            Be there when they are targeted.
          </h1>
          <p className="mt-3 text-[1rem] leading-relaxed text-white/80">
            Create an account, read your family code out to your parent, and Ruko tells you the
            moment it finds a scam on their phone. You can send “stop” straight to their screen.
          </p>
        </div>
      </div>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <div className="flex gap-1 rounded-full bg-sunken p-1">
          {(["signup", "login"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setMode(option);
                setError(null);
              }}
              className={`min-h-[44px] flex-1 rounded-full text-[0.95rem] font-bold ${
                mode === option ? "bg-action text-on-action" : "text-muted"
              }`}
            >
              {option === "signup" ? "Create account" : "Sign in"}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3 rounded-3xl border border-line bg-surface p-5">
          <div>
            <label htmlFor="email" className="block text-[0.85rem] font-bold">
              Your email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1.5 min-h-[52px] w-full rounded-xl border border-line bg-sunken px-3 text-[1rem] focus:border-action focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-[0.85rem] font-bold">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="mt-1.5 min-h-[52px] w-full rounded-xl border border-line bg-sunken px-3 text-[1rem] focus:border-action focus:outline-none"
            />
            {mode === "signup" && (
              <p className="mt-1 text-[0.82rem] text-muted">At least 8 characters.</p>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-line bg-red-tint px-3 py-2 text-[0.9rem] font-semibold text-red-ink"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={busy || !email || !password}
            className="min-h-[58px] w-full rounded-2xl bg-action px-5 text-[1.05rem] font-extrabold text-on-action disabled:opacity-50"
          >
            {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </div>

        <p className="mt-4 text-center text-[0.85rem] text-muted">
          An account is only needed here. The person you are protecting never has to sign in.
        </p>
        <p className="mt-2 text-center">
          <a href="/check" className="text-[0.9rem] font-bold text-action">
            ← Back to Ruko
          </a>
        </p>
      </main>
    </div>
  );
}
