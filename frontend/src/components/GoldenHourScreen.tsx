import type { Strings } from "../i18n";
import { buildComplaint } from "../lib/complaint";
import type { Verdict } from "../types";
import { ArrowLeftIcon } from "./Icons";
import { ComplaintCard } from "./VerdictParts";

interface Props {
  t: Strings;
  /** Present whenever the person came here from a verdict, which is the usual
   *  path. Without it the checklist still works; only the complaint pack is
   *  missing, because there is nothing to fill it in from. */
  verdict: Verdict | null;
  onBack: () => void;
}

export function GoldenHourScreen({ t, verdict, onBack }: Props) {
  const steps = [
    {
      title: t.step1930Title,
      body: t.step1930Body,
      action: { label: t.step1930Action, href: "tel:1930" },
    },
    {
      title: t.stepPortalTitle,
      body: t.stepPortalBody,
      action: { label: t.stepPortalAction, href: "https://cybercrime.gov.in" },
    },
    { title: t.stepBankTitle, body: t.stepBankBody, action: null },
  ];

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-[44px] items-center gap-2 text-[0.95rem] font-bold text-muted"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        {t.backButton}
      </button>

      <header className="ruko-rise space-y-1.5">
        <h1 className="text-[1.7rem] leading-tight font-extrabold tracking-tight">
          {t.goldenHourTitle}
        </h1>
        <p className="text-[0.98rem] text-muted">{t.goldenHourSub}</p>
      </header>

      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li
            key={i}
            className="ruko-rise rounded-3xl border border-line bg-surface p-4 shadow-sm"
            style={{ "--rise-delay": `${80 + i * 80}ms` } as React.CSSProperties}
          >
            <div className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-action text-[1rem] font-extrabold text-on-action">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[1.15rem] font-extrabold">{step.title}</h2>
                <p className="mt-0.5 text-[0.95rem] text-muted">{step.body}</p>
                {step.action && (
                  <a
                    href={step.action.href}
                    target={step.action.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="mt-3 flex min-h-[54px] w-full items-center justify-center rounded-2xl bg-action px-4 text-[1.05rem] font-extrabold text-on-action"
                  >
                    {step.action.label}
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {verdict && (
        <div className="ruko-rise" style={{ "--rise-delay": "340ms" } as React.CSSProperties}>
          <ComplaintCard pack={buildComplaint(verdict)} t={t} />
        </div>
      )}

      <p className="rounded-2xl border border-line bg-sunken px-4 py-3 text-[0.9rem] text-muted">
        {t.goldenHourNote}
      </p>
    </div>
  );
}
