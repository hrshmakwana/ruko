import { LANGUAGES } from "../i18n/languages";
import type { Language } from "../types";

interface Props {
  value: Language;
  onChange: (next: Language) => void;
  label: string;
  /** The dark hero on the landing page needs light-on-dark. */
  tone?: "light" | "dark";
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3.2 9.6h17.6M3.2 14.4h17.6M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

/** A native <select>, deliberately.
 *
 * Fifteen options do not fit in a row of pills, and a custom dropdown would
 * mean re-implementing keyboard handling, scrolling and screen-reader support.
 * A native select gets the phone's own picker — big, familiar, and already
 * accessible to the person we are building for.
 */
export function LanguageSelect({ value, onChange, label, tone = "light" }: Props) {
  const dark = tone === "dark";
  return (
    <div
      className={[
        "relative flex items-center gap-2 rounded-full ps-3 pe-2 ring-1",
        dark ? "bg-white/10 text-white ring-white/25" : "bg-surface text-ink ring-line",
      ].join(" ")}
    >
      <GlobeIcon className="pointer-events-none h-5 w-5 shrink-0 opacity-70" />
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as Language)}
        className={[
          "min-h-[44px] cursor-pointer appearance-none bg-transparent py-1 pe-6 text-[0.95rem] font-bold",
          "focus:outline-none",
          dark ? "text-white" : "text-ink",
        ].join(" ")}
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code} className="text-ink">
            {language.endonym}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute end-3 h-4 w-4 opacity-70"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="m6 9 6 6 6-6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
