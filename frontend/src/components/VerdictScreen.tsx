import type { Strings } from "../i18n";
import { screenshotFor } from "../i18n/screenshot";
import { whatsappWarningUrl } from "../i18n/warn";
import type { Verdict } from "../types";
import { ArrowLeftIcon, CrossIcon, OkIcon, SuspiciousIcon, WhatsAppIcon } from "./Icons";
import { MessageBubble } from "./MessageBubble";
import { SignalBanner } from "./SignalBanner";
import { ConsequenceChain, ScriptCard, TeachCard } from "./VerdictParts";

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

/** Sections rise in one after another so the eye is led down the argument
 *  instead of meeting a wall of cards. */
function Rise({
  delay,
  span,
  children,
}: {
  delay: number;
  /** Full width on a laptop: the banner, the headline and the message itself. */
  span?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`ruko-rise ${span ? "lg:col-span-2" : ""}`}
      style={{ "--rise-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
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
  const shot = screenshotFor(verdict.language);
  let delay = 120;
  const next = () => (delay += 90);

  return (
    // On a laptop the verdict reads as two columns — the argument on the left,
    // what to do on the right — with the banner and the message across the top.
    // On a phone the grid collapses and nothing moves.
    <div className="space-y-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-4 lg:space-y-0 [&>*]:min-w-0">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-[44px] items-center gap-2 text-[0.95rem] font-bold text-muted lg:col-span-2"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        {t.checkAnotherButton}
      </button>

      {verdict.image_unread ? (
        <section className="ruko-slam rounded-xl bg-warn-container p-5 shadow-sm lg:col-span-2">
          <div className="flex items-start gap-3">
            <SuspiciousIcon className="h-10 w-10 shrink-0 text-amber" />
            <div>
              <p className="text-[1.3rem] leading-tight font-extrabold text-amber-ink">
                {shot.unreadTitle}
              </p>
              <p className="mt-1.5 text-[0.98rem] leading-snug font-medium text-amber-ink">
                {verdict.headline}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="lg:col-span-2">
          <SignalBanner level={verdict.risk_level} score={verdict.risk_score} t={t} />
        </div>
      )}

      <Rise delay={next()} span>
        <div className={`space-y-2 ${verdict.image_unread ? "hidden" : ""}`}>
          {verdict.scam_type !== "none_detected" && (
            <span className="inline-block rounded-full bg-surface-container-low px-3 py-1 text-[0.78rem] font-bold uppercase tracking-wider text-muted">
              {t.scamTypes[verdict.scam_type]}
            </span>
          )}
          <h2 className="text-[1.35rem] leading-snug font-extrabold">{verdict.headline}</h2>
          {verdict.risk_level === "no_scam_signs" && (
            <p className="text-[0.95rem] text-muted">{t.cautionLine}</p>
          )}
          {verdict.partial && (
            <p className="rounded-lg bg-amber-tint px-3 py-2 text-[0.85rem] text-amber-ink">
              {t.partialNote}
            </p>
          )}
        </div>
      </Rise>

      {(checkedText || imagePreview) && (
        <Rise delay={next()} span>
          <MessageBubble
            text={checkedText}
            imagePreview={imagePreview}
            flags={verdict.red_flags}
            label={t.receivedLabel}
            screenshotText={verdict.screenshot_text}
            screenshotLabel={shot.readLabel}
          />
        </Rise>
      )}

      {verdict.red_flags.length > 0 && (
        <Rise delay={next()}>
          <section className="rounded-xl bg-surface-container p-4 shadow-sm">
            <h3 className="text-[1.05rem] font-bold">{t.whyTitle}</h3>
            <ul className="mt-3 space-y-3">
              {verdict.red_flags.map((flag, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-panel text-[0.72rem] font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.95rem] font-semibold break-words">{flag.evidence}</p>
                    <p className="mt-0.5 text-[0.9rem] text-muted">{flag.why}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </Rise>
      )}

      {verdict.consequence_chain.length > 0 && (
        <Rise delay={next()}>
          <ConsequenceChain steps={verdict.consequence_chain} t={t} />
        </Rise>
      )}

      {verdict.do_now.length > 0 && (
        <Rise delay={next()}>
          <section className="rounded-xl bg-clear-container p-4 shadow-sm">
            <h3 className="flex items-center gap-2 text-[1.05rem] font-bold text-on-clear-container">
              <OkIcon className="h-6 w-6" />
              {t.doNowTitle}
            </h3>
            <ol className="mt-3 space-y-2">
              {verdict.do_now.map((step, i) => (
                <li key={i} className="flex gap-3 text-[1rem] text-on-clear-container">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green text-[0.8rem] font-bold text-white">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        </Rise>
      )}

      {verdict.dont_do.length > 0 && (
        <Rise delay={next()}>
          <section className="rounded-xl bg-error-container p-4 shadow-sm">
            <h3 className="flex items-center gap-2 text-[1.05rem] font-bold text-on-error-container">
              <CrossIcon className="h-6 w-6" />
              {t.dontDoTitle}
            </h3>
            <ul className="mt-3 space-y-2">
              {verdict.dont_do.map((item, i) => (
                <li key={i} className="flex gap-3 text-[1rem] text-on-error-container">
                  <CrossIcon className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </Rise>
      )}

      {verdict.callback_script && (
        <Rise delay={next()}>
          <ScriptCard script={verdict.callback_script} t={t} />
        </Rise>
      )}

      {verdict.community.length > 0 && (
        <Rise delay={next()}>
          <section className="rounded-xl bg-surface-container p-4 shadow-sm">
            <h3 className="text-[1.05rem] font-bold">{t.communityTitle}</h3>
            <ul className="mt-2 space-y-1.5">
              {verdict.community.map((hit, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <code className="truncate font-mono text-[0.88rem]">{hit.masked}</code>
                  <span className="shrink-0 rounded-full bg-red-tint px-2.5 py-0.5 text-[0.78rem] font-bold text-on-error-container">
                    {t.communityCount(hit.report_count)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </Rise>
      )}

      {verdict.teach_me && (
        <Rise delay={next()}>
          <TeachCard lesson={verdict.teach_me} t={t} />
        </Rise>
      )}

      <Rise delay={next()}>
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={onAlreadyPaid}
            className="min-h-[58px] w-full rounded-xl bg-primary px-5 text-[1.05rem] font-bold text-on-primary"
          >
            {t.alreadyPaidButton}
          </button>
          {/* People already forward scams to the family group. This gives them
              the warning to forward instead of the scam itself. */}
          {verdict.risk_level !== "no_scam_signs" && (
            <a
              href={whatsappWarningUrl(
                verdict.language,
                verdict.headline,
                t.scamTypes[verdict.scam_type],
              )}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-clear-container px-5 text-[1.02rem] font-bold text-on-clear-container"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {t.warnFamilyButton}
            </a>
          )}
          <button
            type="button"
            onClick={onReport}
            disabled={reported}
            className="min-h-[54px] w-full rounded-xl bg-surface-container px-5 text-[1.02rem] font-bold text-ink disabled:opacity-60"
          >
            {reported ? t.reportedButton : t.reportButton}
          </button>
        </div>
      </Rise>
    </div>
  );
}
