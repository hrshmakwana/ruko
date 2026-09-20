import { Icon } from "./Icon";
import type { FamilyStrings } from "../i18n/family";
import type { Strings } from "../i18n";
import { LANGUAGES } from "../i18n/languages";
import type { Language } from "../types";
import type { Role } from "../lib/role";

interface Props {
  t: Strings;
  f: FamilyStrings;
  language: Language;
  onLanguage: (next: Language) => void;
  onChoose: (role: Role) => void;
}

/** The first question Ruko asks, once: which of the two people are you?
 *
 * It comes before anything else because every screen after it differs. The
 * language picker sits on this screen too — someone who cannot read English
 * must be able to answer the first question in their own language.
 */
export function RoleGate({ t, f, language, onLanguage, onChoose }: Props) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface px-4 py-6">
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col md:max-w-[620px]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2.5">
            <Octagon className="h-9 w-9 text-on-surface" />
            <span className="flex flex-col leading-none">
              <span className="text-headline-lg font-bold tracking-tight">{t.appName}</span>
              <span className="mt-1 text-caption text-secondary">{t.tagline}</span>
            </span>
          </span>

          <div className="relative">
            <span className="pointer-events-none flex min-h-[44px] items-center gap-1 rounded-full bg-surface-container px-3 text-caption font-medium">
              <Icon name="translate" className="text-[18px] text-secondary" />
              {LANGUAGES.find((l) => l.code === language)?.endonym}
              <Icon name="expand_more" className="text-[16px] text-secondary" />
            </span>
            <select
              aria-label={t.languageLabel}
              value={language}
              onChange={(event) => onLanguage(event.target.value as Language)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            >
              {LANGUAGES.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.endonym}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h1 className="mt-10 text-headline-lg font-bold tracking-tight">{f.familyTitle}</h1>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => onChoose("parent")}
            className="flex flex-col rounded-xl bg-surface-container-low p-5 text-left shadow-sm transition-transform active:scale-[0.99]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container">
              <Icon name="phone_iphone" className="text-[26px]" />
            </span>
            <span className="mt-3 text-headline-md font-semibold">{f.roleProtectedTitle}</span>
            <span className="mt-1 text-body-md text-secondary">{f.roleProtectedBody}</span>
            <span className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-primary px-5 text-body-lg font-semibold text-on-primary">
              {t.checkHeading}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChoose("guardian")}
            className="flex flex-col rounded-xl bg-surface-container-low p-5 text-left shadow-sm transition-transform active:scale-[0.99]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container">
              <Icon name="diversity_3" className="text-[26px]" />
            </span>
            <span className="mt-3 text-headline-md font-semibold">{f.roleGuardianTitle}</span>
            <span className="mt-1 text-body-md text-secondary">{f.roleGuardianBody}</span>
            <span className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-primary px-5 text-body-lg font-semibold text-on-primary">
              {f.createCode}
            </span>
          </button>
        </div>

        <p className="mt-auto pt-8 text-center text-caption text-secondary">{t.footerDisclaimer}</p>
      </div>
    </div>
  );
}

function Octagon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M30.6 4h38.8L96 30.6v38.8L69.4 96H30.6L4 69.4V30.6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
      />
      <path d="M50 26v30" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      <circle cx="50" cy="72" r="5.5" fill="currentColor" />
    </svg>
  );
}
