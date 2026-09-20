import { useState } from "react";
import { Icon } from "./Icon";
import type { Strings } from "../i18n";
import type { FamilyStrings } from "../i18n/family";
import { LANGUAGES } from "../i18n/languages";
import type { WelcomeStrings } from "../i18n/welcome";
import { linkFamily, saveFamilyCode } from "../lib/guardian";
import type { Language } from "../types";
import type { Role } from "../lib/role";

interface Props {
  t: Strings;
  f: FamilyStrings;
  w: WelcomeStrings;
  language: Language;
  onLanguage: (next: Language) => void;
  onChoose: (role: Role, familyCode?: string) => void;
}

/** The door: sign in as the phone being protected, sign in as the family member
 *  watching, or skip and just check things.
 *
 * Skip is deliberately one tap and top-right, where a dismissal belongs. The
 * person who opens Ruko because something is happening *right now* must never
 * be made to make an account first.
 */
export function Welcome({ t, f, w, language, onLanguage, onChoose }: Props) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithCode() {
    const cleaned = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cleaned.length !== 6) {
      setError(f.familyBadCode);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await linkFamily(cleaned);
      saveFamilyCode(result.family_code);
      onChoose("guardian", result.family_code);
    } catch {
      setError(f.familyBadCode);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-surface px-4 py-5">
      <div className="mx-auto flex w-full max-w-[480px] flex-col md:max-w-[680px]">
        <div className="flex items-start justify-between gap-3">
          <span className="flex items-center gap-2.5">
            <Octagon className="h-9 w-9 text-on-surface" />
            <span className="flex flex-col leading-none">
              <span className="text-headline-lg font-bold tracking-tight">{t.appName}</span>
              <span className="mt-1 text-caption text-secondary">{t.tagline}</span>
            </span>
          </span>

          {/* Top right, as a dismissal should be. */}
          <button
            type="button"
            onClick={() => onChoose("guest")}
            className="flex min-h-[44px] shrink-0 items-center gap-1 rounded-full bg-surface-container px-3.5 text-caption font-semibold text-on-surface"
          >
            {w.skip}
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <h1 className="text-headline-lg font-bold tracking-tight">{w.title}</h1>
          <div className="relative shrink-0">
            <span className="pointer-events-none flex min-h-[44px] items-center gap-1 rounded-full bg-surface-container px-3 text-caption font-medium">
              <Icon name="translate" className="text-[18px] text-secondary" />
              {LANGUAGES.find((l) => l.code === language)?.endonym}
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

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {/* --------------------------------------------- the protected phone --- */}
          <section className="flex flex-col rounded-xl bg-surface-container-low p-5 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container">
              <Icon name="phone_iphone" className="text-[26px]" />
            </span>
            <h2 className="mt-3 text-headline-md font-semibold">{f.roleProtectedTitle}</h2>
            <p className="mt-1 text-body-md text-secondary">{f.roleProtectedBody}</p>

            <label htmlFor="welcome-code" className="mt-4 text-caption font-semibold">
              {f.familyCodeLabel}
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                id="welcome-code"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder={f.familyCodePlaceholder}
                maxLength={8}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                className="min-h-[52px] w-full rounded-xl bg-surface-container-lowest px-3 font-mono text-[1.1rem] tracking-[0.2em] uppercase ring-1 ring-outline-variant focus:outline-none focus:ring-2 focus:ring-on-surface"
              />
              <button
                type="button"
                onClick={() => void signInWithCode()}
                disabled={busy}
                className="min-h-[52px] shrink-0 rounded-xl bg-primary px-5 text-body-md font-semibold text-on-primary disabled:opacity-60"
              >
                {busy ? f.familyLinking : w.signIn}
              </button>
            </div>
            {error && (
              <p role="alert" className="mt-2 text-body-md font-semibold text-on-error-container">
                {error}
              </p>
            )}
          </section>

          {/* ------------------------------------------------ the one watching --- */}
          <section className="flex flex-col rounded-xl bg-surface-container-low p-5 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container">
              <Icon name="admin_panel_settings" className="text-[26px]" />
            </span>
            <h2 className="mt-3 text-headline-md font-semibold">{f.roleGuardianTitle}</h2>
            <p className="mt-1 text-body-md text-secondary">{f.roleGuardianBody}</p>
            <a
              href="/guardian"
              onClick={() => onChoose("admin")}
              className="mt-auto flex min-h-[52px] items-center justify-center rounded-xl bg-primary px-5 text-body-lg font-semibold text-on-primary"
            >
              {f.createCode}
            </a>
          </section>
        </div>

        <p className="mt-5 text-center text-caption text-secondary">{w.lockedBody}</p>
        <p className="mt-3 pb-2 text-center text-caption text-secondary">{t.footerDisclaimer}</p>
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
