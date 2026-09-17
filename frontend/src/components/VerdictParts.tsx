import { useState } from "react";
import type { Strings } from "../i18n";
import type { ComplaintPack, ConsequenceStep } from "../types";

function CopyButton({ value, t }: { value: string; t: Strings }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          // Clipboard can be blocked; the text is on screen either way.
        }
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }}
      className="min-h-[48px] w-full rounded-xl bg-action px-4 text-[1rem] font-bold text-on-action"
    >
      {done ? t.copiedButton : t.copyButton}
    </button>
  );
}

/** The scammer's plan, drawn as a road they want you to walk down. The last
 *  step is the loss, and it is styled as the dead end it is. */
export function ConsequenceChain({ steps, t }: { steps: ConsequenceStep[]; t: Strings }) {
  if (steps.length === 0) return null;

  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <h3 className="text-[1.05rem] font-bold">{t.consequenceTitle}</h3>
      <p className="mt-0.5 text-[0.88rem] text-muted">{t.consequenceHint}</p>

      <ol className="relative mt-4 space-y-0">
        {steps.map((step, i) => {
          const last = i === steps.length - 1;
          const loss = step.is_loss ?? last;
          return (
            <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
              {!last && (
                <span
                  className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-line"
                  aria-hidden="true"
                />
              )}
              <span
                className={`relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.75rem] font-bold ${
                  loss
                    ? "bg-red-panel text-white"
                    : "border-2 border-line bg-surface text-muted"
                }`}
              >
                {loss ? "!" : i + 1}
              </span>
              <p
                className={`text-[0.98rem] leading-snug ${
                  loss ? "font-bold text-red-ink" : ""
                }`}
              >
                {step.step}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** Words to read out. Big, quoted, and copyable — nobody improvises well while
 *  a stranger is shouting about an arrest warrant. */
export function ScriptCard({ script, t }: { script: string; t: Strings }) {
  return (
    <section className="rounded-2xl border-2 border-action-soft bg-sunken p-4">
      <h3 className="text-[1.05rem] font-bold">{t.scriptTitle}</h3>
      <p className="mt-0.5 text-[0.88rem] text-muted">{t.scriptHint}</p>
      <blockquote className="relative mt-3 rounded-xl bg-surface p-4 pl-9 shadow-sm">
        <span
          className="absolute left-3 top-2 font-serif text-[2.4rem] leading-none text-amber"
          aria-hidden="true"
        >
          “
        </span>
        <p className="text-[1.05rem] leading-relaxed font-medium">{script}</p>
      </blockquote>
      <div className="mt-3">
        <CopyButton value={script} t={t} />
      </div>
    </section>
  );
}

/** Styled as a torn-off document, because that is what it is. */
export function ComplaintCard({ pack, t }: { pack: ComplaintPack; t: Strings }) {
  const rows: [string, string | null][] = [
    ["Date & time", pack.date_time],
    ["Amount", pack.amount],
    ["Transaction ID", pack.transaction_id],
    ["Scammer contact", pack.scammer_contact],
    ["Platform", pack.platform],
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
      <div
        className="h-2.5 w-full bg-action-soft"
        style={{
          maskImage: "radial-gradient(circle at 6px 0, transparent 5px, black 5.5px)",
          maskSize: "12px 12px",
          maskRepeat: "repeat-x",
        }}
        aria-hidden="true"
      />
      <div className="p-4">
        <h3 className="text-[1.05rem] font-bold">{t.complaintTitle}</h3>
        <p className="mt-0.5 text-[0.88rem] text-muted">{t.complaintHint}</p>

        <dl className="mt-3 divide-y divide-line border-y border-line">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 py-2">
              <dt className="text-[0.85rem] text-muted">{label}</dt>
              <dd className="text-right font-mono text-[0.85rem] font-semibold break-all">
                {value ?? "—"}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-3 text-[0.92rem] leading-relaxed">{pack.description}</p>

        <div className="mt-4">
          <CopyButton value={pack.text} t={t} />
        </div>
      </div>
    </section>
  );
}

/** One line the person keeps after they close the app. */
export function TeachCard({ lesson, t }: { lesson: string; t: Strings }) {
  return (
    <section className="flex gap-3 rounded-2xl border-2 border-amber-line bg-amber-tint p-4">
      <svg viewBox="0 0 24 24" className="mt-0.5 h-7 w-7 shrink-0 text-amber" aria-hidden="true">
        <path
          d="M12 2.6 21.4 12 12 21.4 2.6 12z"
          fill="currentColor"
          opacity="0.2"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M12 7.6v5.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="12" cy="16.3" r="1.2" fill="currentColor" />
      </svg>
      <div>
        <h3 className="text-[0.78rem] font-bold uppercase tracking-wider text-amber-ink">
          {t.teachTitle}
        </h3>
        <p className="mt-0.5 text-[1rem] leading-snug font-semibold text-amber-ink">{lesson}</p>
      </div>
    </section>
  );
}
