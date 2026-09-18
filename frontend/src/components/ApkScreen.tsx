import { useRef, useState } from "react";
import { CrossIcon, OkIcon, ScamIcon, SuspiciousIcon, UploadIcon } from "./Icons";
import type { ApkStrings } from "../i18n/apk";
import { assess, readApk, NotAnApk, type ApkReport } from "../lib/apk";

interface Props {
  s: ApkStrings;
  onBack: () => void;
  /** An .apk that arrived through the share sheet, already chosen for us. */
  initialFile?: File | null;
}

/** "Someone sent me an app — is it safe to install?"
 *
 * The answer is built from the app's own manifest, read on the phone. Nothing is
 * uploaded, so this works on a train with no signal, and the file a stranger
 * sent never leaves the device.
 */
export function ApkScreen({ s, onBack, initialFile }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ApkReport | null>(null);
  const [name, setName] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const done = useRef(false);

  async function inspect(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    setReport(null);
    setName(file.name);
    try {
      setReport(assess(await readApk(file)));
    } catch (err) {
      setError(err instanceof NotAnApk ? s.notApk : s.notApk);
    } finally {
      setBusy(false);
    }
  }

  if (initialFile && !done.current) {
    done.current = true;
    void inspect(initialFile);
  }

  const danger = report?.flags.some((flag) => flag.level === "danger") ?? false;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-[44px] items-center gap-2 text-[0.95rem] font-bold text-muted"
      >
        ← {s.back}
      </button>

      <header className="space-y-1.5">
        <h1 className="text-[1.6rem] leading-tight font-extrabold tracking-tight">{s.heading}</h1>
        <p className="text-[0.98rem] text-muted">{s.sub}</p>
      </header>

      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className="flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-action px-5 text-[1.08rem] font-extrabold text-on-action disabled:opacity-60"
      >
        <UploadIcon className="h-6 w-6" />
        {busy ? s.checking : s.pick}
      </button>
      <input
        ref={input}
        type="file"
        // Deliberately no accept list. iOS has no file type registered for an
        // APK, so any filter greys the file out in the Files picker and the
        // person cannot choose the thing they came to check. Anything that is
        // not an Android app is caught when it is read, a moment later.
        className="sr-only"
        onChange={(event) => {
          void inspect(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-amber-line bg-amber-tint px-3 py-2 text-[0.92rem] font-semibold text-amber-ink"
        >
          {error}
        </p>
      )}

      {report && (
        <>
          <section
            className={`ruko-slam rounded-3xl border-2 p-5 ${
              danger
                ? "border-transparent bg-red-panel text-white"
                : report.flags.length
                  ? "border-amber-line bg-amber-tint"
                  : "border-green-line bg-green-tint"
            }`}
          >
            <div className="flex items-start gap-3">
              {danger ? (
                <ScamIcon className="h-10 w-10 shrink-0" />
              ) : report.flags.length ? (
                <SuspiciousIcon className="h-10 w-10 shrink-0 text-amber" />
              ) : (
                <OkIcon className="h-10 w-10 shrink-0 text-green" />
              )}
              <div className="min-w-0">
                <p
                  className={`text-[1.3rem] leading-tight font-extrabold ${
                    report.flags.length && !danger ? "text-amber-ink" : ""
                  }`}
                >
                  {danger ? s.dangerTitle : report.flags.length ? s.warnTitle : s.cleanTitle}
                </p>
                {report.drainsAccounts && (
                  <p className="mt-1.5 text-[0.98rem] leading-snug font-semibold">{s.drainWarning}</p>
                )}
                {!report.flags.length && (
                  <p className="mt-1.5 text-[0.95rem] text-green-ink">{s.cleanBody}</p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-4">
            <h2 className="text-[0.78rem] font-bold uppercase tracking-wider text-muted">
              {s.appLabel}
            </h2>
            <p className="mt-1 font-mono text-[0.92rem] break-all">
              {report.packageName ?? name}
            </p>
          </section>

          {report.flags.length > 0 && (
            <section className="rounded-2xl border border-line bg-surface p-4">
              <h2 className="text-[1.05rem] font-bold">{s.canDoLabel}</h2>
              <ul className="mt-3 space-y-2.5">
                {report.flags.map((flag) => (
                  <li key={flag.id} className="flex gap-3">
                    {flag.level === "danger" ? (
                      <CrossIcon className="mt-0.5 h-5 w-5 shrink-0 text-red" />
                    ) : (
                      <SuspiciousIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber" />
                    )}
                    <span
                      className={`text-[0.98rem] ${
                        flag.level === "danger" ? "font-semibold text-red-ink" : ""
                      }`}
                    >
                      {s.perms[flag.id] ?? flag.permission}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <p className="rounded-2xl bg-sunken px-4 py-3 text-[0.85rem] text-muted">{s.privacy}</p>
    </div>
  );
}
