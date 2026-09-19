import type { ReactNode } from "react";
import {
  AppFileIcon,
  DialIcon,
  MessageIcon,
  PhoneIcon,
  ScamIcon,
  ShieldIcon,
} from "./Icons";
import { LanguageSelect } from "./LanguageSelect";
import type { NavStrings } from "../i18n/nav";
import type { Language } from "../types";

export type Destination = "message" | "call" | "app" | "number" | "family";

interface Props {
  nav: NavStrings;
  active: Destination;
  onNavigate: (destination: Destination) => void;
  language: Language;
  onLanguage: (language: Language) => void;
  languageLabel: string;
  appName: string;
  children: ReactNode;
  footer?: ReactNode;
  /** A verdict fills the width on a laptop; a form should not. */
  wide?: boolean;
}

const ITEMS: { id: Destination; icon: typeof MessageIcon; key: keyof NavStrings }[] = [
  { id: "message", icon: MessageIcon, key: "message" },
  { id: "call", icon: PhoneIcon, key: "call" },
  { id: "app", icon: AppFileIcon, key: "app" },
  { id: "number", icon: DialIcon, key: "number" },
  { id: "family", icon: ShieldIcon, key: "family" },
];

/** The frame every screen sits in.
 *
 * The old build hid call mode, the app checker and lookup behind cards and tabs
 * on one long page: you had to scroll to find out Ruko could do them. They are
 * destinations now, and the frame changes shape rather than the content:
 *
 *   phone    a bar across the bottom, where a thumb already is
 *   tablet   the same bar, roomier, content centred
 *   laptop   a rail down the left, because the bottom of a 1440px screen is far
 *            from the eye and a thumb is not involved at all
 *
 * One list of destinations drives both, so they cannot drift apart.
 */
export function Shell({
  nav,
  active,
  onNavigate,
  language,
  onLanguage,
  languageLabel,
  appName,
  children,
  footer,
  wide = false,
}: Props) {
  return (
    <div className="min-h-dvh lg:flex">
      {/* ------------------------------------------------ rail, laptop up --- */}
      <aside className="hidden shrink-0 border-r border-line bg-surface lg:flex lg:w-[16.5rem] lg:flex-col lg:justify-between">
        <div>
          <a href="/" className="flex min-h-[56px] items-center gap-2 px-5 py-4">
            <ScamIcon className="h-8 w-8 text-red" />
            <span className="text-[1.3rem] font-extrabold tracking-tight">{appName}</span>
          </a>

          <nav aria-label={nav.menu} className="mt-2 flex flex-col gap-1 px-3">
            {ITEMS.map((item) => {
              const Icon = item.icon;
              const current = active === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={current ? "page" : undefined}
                  onClick={() => onNavigate(item.id)}
                  className={`flex min-h-[52px] items-center gap-3 rounded-2xl px-3.5 text-left text-[1rem] font-bold transition-colors ${
                    current
                      ? "bg-action text-on-action"
                      : "text-muted hover:bg-sunken hover:text-ink"
                  }`}
                >
                  <Icon className="h-6 w-6 shrink-0" />
                  {nav[item.key]}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 px-4 pb-5">
          <LanguageSelect value={language} onChange={onLanguage} label={languageLabel} />
          <a
            href="/attack"
            className="block min-h-[44px] rounded-xl px-1 py-2 text-[0.88rem] font-bold text-muted hover:text-ink"
          >
            {nav.attack} →
          </a>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ------------------------------------------ top bar, below laptop --- */}
        <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-2.5">
            <a href="/" className="flex min-h-[44px] items-center gap-2">
              <ScamIcon className="h-7 w-7 text-red" />
              <span className="text-[1.25rem] font-extrabold tracking-tight">{appName}</span>
            </a>
            <LanguageSelect value={language} onChange={onLanguage} label={languageLabel} />
          </div>
        </header>

        <main
          className={`mx-auto w-full flex-1 px-4 pt-5 pb-28 lg:px-8 lg:pt-8 lg:pb-12 ${
            wide ? "max-w-5xl" : "max-w-3xl"
          }`}
        >
          {children}
        </main>

        {footer && <div className="hidden lg:block">{footer}</div>}

        {/* --------------------------------------------- bottom bar, phone --- */}
        <nav
          aria-label={nav.menu}
          className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/97 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        >
          <div className="mx-auto grid max-w-3xl grid-cols-5">
            {ITEMS.map((item) => {
              const Icon = item.icon;
              const current = active === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={current ? "page" : undefined}
                  onClick={() => onNavigate(item.id)}
                  className={`flex min-h-[60px] flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[0.7rem] font-bold transition-colors ${
                    current ? "text-action" : "text-muted"
                  }`}
                >
                  <span
                    className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
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
    </div>
  );
}
