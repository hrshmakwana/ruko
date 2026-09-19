import type { ReactNode } from "react";
import { PhoneIcon, ScamIcon, SettingsIcon, ShieldIcon, ShieldCheckIcon } from "./Icons";
import type { NavStrings } from "../i18n/nav";
import type { Language } from "../types";

export type Destination = "check" | "call" | "family" | "settings";

interface Props {
  nav: NavStrings;
  active: Destination;
  onNavigate: (destination: Destination) => void;
  appName: string;
  /** The one-line strapline under the logo, in the chosen language. */
  tagline: string;
  /** Shown in the header pill; tapping it goes to settings, where the picker is. */
  languageName: string;
  language: Language;
  parentMode: boolean;
  onParentMode: (on: boolean) => void;
  parentLabel: string;
  guardianLabel: string;
  /** Set when a family is linked, so the sync bar can say who is watching. */
  familyCode?: string | null;
  familyLinkedLabel?: string;
  children: ReactNode;
}

const ITEMS: { id: Destination; icon: typeof ScamIcon; key: keyof NavStrings }[] = [
  { id: "check", icon: ShieldCheckIcon, key: "check" },
  { id: "call", icon: PhoneIcon, key: "call" },
  { id: "family", icon: ShieldIcon, key: "family" },
  { id: "settings", icon: SettingsIcon, key: "settings" },
];

/** The frame: a fixed header, a single column, a bar along the bottom.
 *
 * The column is capped at 480px on every screen size, on purpose. Ruko is an
 * emergency utility held in one hand, and a 1400px-wide version of it would be
 * a different, worse product — so a laptop shows the same thumb-sized app,
 * centred, rather than a stretched one.
 *
 * Colour is quarantined here too: this chrome is monochrome, so the only thing
 * on screen that can turn red is a verdict.
 */
export function Shell({
  nav,
  active,
  onNavigate,
  appName,
  tagline,
  languageName,
  parentMode,
  onParentMode,
  parentLabel,
  guardianLabel,
  familyCode,
  familyLinkedLabel,
  children,
}: Props) {
  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-surface/92 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[480px] px-4 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between gap-2 py-2.5">
            <a href="/" className="flex min-h-[48px] items-center gap-2.5">
              <ScamIcon className="h-8 w-8 shrink-0 text-ink" />
              <span className="flex flex-col leading-none">
                {/* One language, never two: the name is written the way the
                    person reading it writes. */}
                <span className="text-[1.3rem] font-bold tracking-tight">{appName}</span>
                <span className="mt-1 text-[0.72rem] font-medium text-muted">{tagline}</span>
              </span>
            </a>

            <button
              type="button"
              onClick={() => onNavigate("settings")}
              className="ruko-compact flex min-h-[44px] items-center gap-1.5 rounded-full bg-sunken px-3 text-[0.8rem] font-semibold text-ink"
            >
              <TranslateGlyph className="h-4 w-4 text-muted" />
              {languageName}
            </button>
          </div>

          {/* Guardian ⇄ Parent: one switch, always in the same place, because a
              son hands the phone over and needs it back in two taps. */}
          <div className="flex items-center justify-between gap-2 pb-2">
            {familyCode && familyLinkedLabel ? (
              <div className="flex min-w-0 items-center gap-1.5">
                <ShieldCheckIcon className="h-4 w-4 shrink-0 text-muted" />
                <span className="truncate text-[0.78rem] font-semibold text-muted">
                  {familyLinkedLabel}
                </span>
              </div>
            ) : (
              <span />
            )}
            <div className="ruko-compact flex shrink-0 items-center rounded-full bg-sunken p-0.5">
              {[
                { on: false, label: guardianLabel },
                { on: true, label: parentLabel },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={parentMode === option.on}
                  onClick={() => onParentMode(option.on)}
                  className={`ruko-compact min-h-[40px] rounded-full px-3.5 text-[0.8rem] font-semibold transition-colors ${
                    parentMode === option.on
                      ? "bg-surface text-ink shadow-sm"
                      : "text-muted"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* The header is fixed and its height changes with Parent Mode, so the
          spacer is a scaling rem rather than a fixed pixel gap. */}
      <main className="mx-auto w-full max-w-[480px] flex-1 px-4 pt-[7.4rem] pb-[6.5rem]">
        {children}
      </main>

      <nav
        aria-label={nav.menu}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
      >
        <div className="mx-auto grid max-w-[480px] grid-cols-4">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const current = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={current ? "page" : undefined}
                onClick={() => onNavigate(item.id)}
                className={`flex min-h-[60px] flex-col items-center justify-center gap-1 px-1 py-2 text-[0.7rem] font-semibold transition-colors ${
                  current ? "text-ink" : "text-muted"
                }`}
              >
                <span
                  className={`flex h-7 w-14 items-center justify-center rounded-full transition-colors ${
                    current ? "bg-action-soft" : ""
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span className="max-w-full truncate">{nav[item.key]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function TranslateGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M4 6h9M8.5 6c0 4.5-2 7.5-5 9m2-5.5c1.6 2.8 3.6 4.6 6 5.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="m12.5 20 4-9 4 9m-6.6-2.4h5.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
