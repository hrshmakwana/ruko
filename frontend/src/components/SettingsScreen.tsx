import { ChevronRightIcon, OkIcon, PhoneIcon, ShieldCheckIcon } from "./Icons";
import { InstallCard } from "./InstallCard";
import { LanguageSelect } from "./LanguageSelect";
import type { Strings } from "../i18n";
import type { FamilyStrings } from "../i18n/family";
import type { InstallStrings } from "../i18n/install";
import type { NavStrings } from "../i18n/nav";
import { forgetChecks, recentChecks } from "../lib/recent";
import type { Language } from "../types";

interface Props {
  t: Strings;
  nav: NavStrings;
  f: FamilyStrings;
  install: InstallStrings;
  language: Language;
  onLanguage: (language: Language) => void;
  parentMode: boolean;
  onParentMode: (on: boolean) => void;
  micState: "unknown" | "granted" | "denied";
  onAskMic: () => void;
  /** Back to the first question: this phone is now someone else's. */
  onSwitchRole: () => void;
  /** Which of the three ways in this phone is using. */
  roleLabel: string;
}

/** Everything that is a choice rather than a check.
 *
 * It exists because the language picker, Parent Mode and the microphone
 * permission were scattered across three screens, and the one thing a person
 * looks for when the app feels wrong — "where do I change this?" — had no
 * address. Now it has one, in the bar at the bottom.
 */
export function SettingsScreen({
  t,
  nav,
  f,
  install,
  language,
  onLanguage,
  parentMode,
  onParentMode,
  micState,
  onAskMic,
  onSwitchRole,
  roleLabel,
}: Props) {
  const hasHistory = recentChecks().length > 0;

  return (
    <div className="space-y-4">
      <header className="ruko-rise">
        <h1 className="text-[1.5rem] leading-tight font-bold tracking-tight">{nav.settings}</h1>
      </header>

      {/* --------------------------------------------------- language --- */}
      <section className="rounded-xl bg-surface-container-low p-4 shadow-sm">
        <h2 className="text-headline-md font-semibold">{t.languageLabel}</h2>
        <p className="mt-0.5 text-[0.85rem] text-muted">{nav.meansStop}</p>
        <div className="mt-3">
          <LanguageSelect value={language} onChange={onLanguage} label={t.languageLabel} />
        </div>
      </section>

      {/* ------------------------------------------------ parent mode --- */}
      <section className="rounded-xl bg-surface-container-low p-4 shadow-sm">
        <h2 className="text-headline-md font-semibold">{nav.modeParent}</h2>
        <p className="mt-0.5 text-[0.85rem] text-muted">{f.roleProtectedBody}</p>
        <div className="mt-3 flex items-center rounded-full bg-surface-container p-1">
          {[
            { on: false, label: nav.modeGuardian },
            { on: true, label: nav.modeParent },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={parentMode === option.on}
              onClick={() => onParentMode(option.on)}
              className={`min-h-[48px] flex-1 rounded-full px-3 text-[0.95rem] font-semibold transition-colors ${
                parentMode === option.on ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-secondary"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ permissions --- */}
      <section className="rounded-xl bg-surface-container-low p-4 shadow-sm">
        <h2 className="text-headline-md font-semibold">{f.permsTitle}</h2>
        <div className="mt-3 flex items-start gap-3">
          <PhoneIcon className="mt-0.5 h-6 w-6 shrink-0 text-muted" />
          <div className="min-w-0 flex-1">
            <p className="text-[0.98rem] font-semibold">{f.micTitle}</p>
            <p className="mt-0.5 text-[0.88rem] leading-relaxed text-muted">{f.micBody}</p>
            {micState === "granted" ? (
              <p className="mt-2 flex items-center gap-1.5 text-[0.9rem] font-semibold text-green-ink">
                <OkIcon className="h-5 w-5 text-green" />
                {f.micAllowed}
              </p>
            ) : micState === "denied" ? (
              <p className="mt-2 text-[0.9rem] font-semibold text-amber-ink">{f.micBlocked}</p>
            ) : (
              <button
                type="button"
                onClick={onAskMic}
                className="mt-3 min-h-[48px] rounded-xl bg-primary px-4 text-body-md font-semibold text-on-primary"
              >
                {f.allowMic}
              </button>
            )}
          </div>
        </div>
      </section>

      <InstallCard s={install} />

      {/* --------------------------------------------------- the rest --- */}
      <section className="overflow-hidden rounded-xl bg-surface-container-low shadow-sm">
        <button
          type="button"
          onClick={onSwitchRole}
          className="flex min-h-[56px] w-full items-center gap-3 border-b border-outline-variant/30 px-4 py-3 text-left"
        >
          <ShieldCheckIcon className="h-5 w-5 shrink-0 text-muted" />
          <span className="min-w-0 flex-1 text-[0.98rem] font-semibold">{roleLabel}</span>
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted" />
        </button>
        <a
          href="/guardian"
          className="flex min-h-[56px] items-center gap-3 px-4 py-3 text-left"
        >
          <ShieldCheckIcon className="h-5 w-5 shrink-0 text-muted" />
          <span className="min-w-0 flex-1 text-[0.98rem] font-semibold">{f.createCode}</span>
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted" />
        </a>
        <a
          href="/attack"
          className="flex min-h-[56px] items-center gap-3 border-t border-line px-4 py-3 text-left"
        >
          <span className="min-w-0 flex-1 text-[0.98rem] font-semibold">{nav.attack}</span>
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted" />
        </a>
        {hasHistory && (
          <button
            type="button"
            onClick={() => {
              forgetChecks();
              // The list is read on render, so a re-render is all it takes.
              onParentMode(parentMode);
            }}
            className="flex min-h-[56px] w-full items-center gap-3 border-t border-line px-4 py-3 text-left text-[0.98rem] font-semibold text-red-ink"
          >
            {t.recentTitle} · {t.removeImageButton}
          </button>
        )}
      </section>

      <footer className="space-y-2 pb-2 text-center text-[0.8rem] text-muted">
        <p>{t.footerDisclaimer}</p>
        <p className="flex flex-wrap items-center justify-center gap-x-4">
          <a href="tel:1930" className="font-semibold text-ink">
            {t.footerHelpline}
          </a>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-ink"
          >
            {t.footerPortal}
          </a>
        </p>
      </footer>
    </div>
  );
}
