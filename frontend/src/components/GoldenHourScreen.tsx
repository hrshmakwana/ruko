import type { Strings } from "../i18n";
import { ArrowLeftIcon } from "./Icons";

interface Props {
  t: Strings;
  onBack: () => void;
}

/** Day 1 version: the three calls that actually matter in the first hour.
 *  The prefilled complaint summary is added once /check extracts amounts and
 *  transaction ids from the screenshot. */
export function GoldenHourScreen({ t, onBack }: Props) {
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
        className="inline-flex min-h-[44px] items-center gap-2 text-[0.95rem] font-semibold text-brand"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        {t.backButton}
      </button>

      <header className="space-y-1.5">
        <h1 className="text-[1.6rem] leading-tight font-bold">{t.goldenHourTitle}</h1>
        <p className="text-[0.95rem] text-muted">{t.goldenHourSub}</p>
      </header>

      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-[1rem] font-bold text-on-brand">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[1.1rem] font-bold">{step.title}</h2>
                <p className="mt-0.5 text-[0.95rem] text-muted">{step.body}</p>
                {step.action && (
                  <a
                    href={step.action.href}
                    target={step.action.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="mt-3 flex min-h-[52px] w-full items-center justify-center rounded-xl bg-brand px-4 text-[1.05rem] font-bold text-on-brand"
                  >
                    {step.action.label}
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <p className="rounded-xl bg-sunken px-4 py-3 text-[0.9rem] text-muted">
        {t.goldenHourNote}
      </p>
    </div>
  );
}
