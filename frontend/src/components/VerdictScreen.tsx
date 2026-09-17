import type { Strings } from "../i18n";
import type { Verdict } from "../types";
import { Highlight } from "./Highlight";
import { ArrowLeftIcon, CrossIcon, OkIcon } from "./Icons";
import { RiskBanner } from "./RiskBanner";

interface Props {
  t: Strings;
  verdict: Verdict;
  checkedText: string;
  imagePreview: string | null;
  reported: boolean;
  onReport: () => void;
  onAlreadyPaid: () => void;
  onBack: () => void;
}

export function VerdictScreen({
  t,
  verdict,
  checkedText,
  imagePreview,
  reported,
  onReport,
  onAlreadyPaid,
  onBack,
}: Props) {
  const evidence = verdict.red_flags.map((f) => f.evidence);

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-[44px] items-center gap-2 text-[0.95rem] font-semibold text-brand"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        {t.checkAnotherButton}
      </button>

      <RiskBanner level={verdict.risk_level} score={verdict.risk_score} t={t} />

      <div className="space-y-2">
        {verdict.scam_type !== "none_detected" && (
          <span className="inline-block rounded-full bg-brand-tint px-3 py-1 text-[0.8rem] font-semibold text-brand-strong">
            {t.scamTypes[verdict.scam_type]}
          </span>
        )}
        <h2 className="text-[1.3rem] leading-snug font-bold">{verdict.headline}</h2>
        {verdict.risk_level === "no_scam_signs" && (
          <p className="text-[0.95rem] text-muted">{t.cautionLine}</p>
        )}
        {verdict.partial && (
          <p className="rounded-lg bg-suspicious-tint px-3 py-2 text-[0.85rem] text-suspicious">
            {t.partialNote}
          </p>
        )}
      </div>

      {verdict.red_flags.length > 0 && (
        <section className="rounded-2xl border border-line bg-surface p-4">
          <h3 className="text-[1.05rem] font-bold">{t.whyTitle}</h3>
          <ul className="mt-3 space-y-3">
            {verdict.red_flags.map((flag, i) => (
              <li key={i} className="border-l-4 border-scam-border pl-3">
                <p className="text-[0.95rem] font-semibold break-words">“{flag.evidence}”</p>
                <p className="mt-0.5 text-[0.9rem] text-muted">{flag.why}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {verdict.do_now.length > 0 && (
        <section className="rounded-2xl border-2 border-ok-border bg-ok-tint p-4">
          <h3 className="flex items-center gap-2 text-[1.05rem] font-bold text-ok">
            <OkIcon className="h-6 w-6" />
            {t.doNowTitle}
          </h3>
          <ol className="mt-3 space-y-2">
            {verdict.do_now.map((step, i) => (
              <li key={i} className="flex gap-3 text-[1rem]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ok text-[0.85rem] font-bold text-surface">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {verdict.dont_do.length > 0 && (
        <section className="rounded-2xl border-2 border-scam-border bg-scam-tint p-4">
          <h3 className="flex items-center gap-2 text-[1.05rem] font-bold text-scam">
            <CrossIcon className="h-6 w-6" />
            {t.dontDoTitle}
          </h3>
          <ul className="mt-3 space-y-2">
            {verdict.dont_do.map((item, i) => (
              <li key={i} className="flex gap-3 text-[1rem]">
                <CrossIcon className="mt-0.5 h-5 w-5 shrink-0 text-scam" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {verdict.community.length > 0 && (
        <section className="rounded-2xl border border-line bg-surface p-4">
          <h3 className="text-[1.05rem] font-bold">{t.communityTitle}</h3>
          <ul className="mt-2 space-y-1.5">
            {verdict.community.map((hit, i) => (
              <li key={i} className="flex items-center justify-between gap-3 text-[0.95rem]">
                <code className="truncate font-mono text-[0.9rem]">{hit.masked}</code>
                <span className="shrink-0 rounded-full bg-scam-tint px-2.5 py-0.5 text-[0.8rem] font-semibold text-scam">
                  {t.communityCount(hit.report_count)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(checkedText || imagePreview) && (
        <section className="rounded-2xl border border-line bg-surface p-4">
          <h3 className="text-[1.05rem] font-bold">{t.yourMessageTitle}</h3>
          {checkedText && (
            <p className="mt-2 rounded-xl bg-sunken p-3 text-[0.95rem] leading-relaxed break-words whitespace-pre-wrap">
              <Highlight text={checkedText} evidence={evidence} />
            </p>
          )}
          {imagePreview && (
            <img
              src={imagePreview}
              alt=""
              className="mt-2 w-full rounded-xl border border-line"
            />
          )}
        </section>
      )}

      <div className="space-y-2.5 pt-1">
        <button
          type="button"
          onClick={onReport}
          disabled={reported}
          className="min-h-[56px] w-full rounded-2xl border-2 border-scam-border bg-surface px-5 text-[1.05rem] font-bold text-scam disabled:opacity-70"
        >
          {reported ? t.reportedButton : t.reportButton}
        </button>
        <button
          type="button"
          onClick={onAlreadyPaid}
          className="min-h-[56px] w-full rounded-2xl bg-brand px-5 text-[1.05rem] font-bold text-on-brand"
        >
          {t.alreadyPaidButton}
        </button>
      </div>
    </div>
  );
}
