import {
  AppFileIcon,
  ChevronRightIcon,
  DialIcon,
  MessageIcon,
  PhoneIcon,
  UploadIcon,
} from "./Icons";
import type { Strings } from "../i18n";
import type { ApkStrings } from "../i18n/apk";
import type { ListenStrings } from "../i18n/listen";
import type { LookupStrings } from "../i18n/lookup";
import type { NavStrings } from "../i18n/nav";
import { recentChecks, timeAgo, type RecentCheck } from "../lib/recent";

export type HubTarget = "message" | "screenshot" | "call" | "number" | "app";

interface Props {
  t: Strings;
  language: string;
  nav: NavStrings;
  listen: ListenStrings;
  apk: ApkStrings;
  lookup: LookupStrings;
  onOpen: (target: HubTarget) => void;
  onExample: (text: string) => void;
  onAlreadyPaid: () => void;
  onRecent: (check: RecentCheck) => void;
}

const LEVEL_DOT: Record<string, string> = {
  scam: "bg-red",
  suspicious: "bg-amber",
  no_scam_signs: "bg-green",
};

/** The first screen: one question, then the ways to answer it.
 *
 * The old build put a paste box at the top and buried call mode, the app
 * checker and lookup below it, so most of Ruko was invisible unless you
 * scrolled. Here every way in is a tile you can see without moving your thumb —
 * which is the whole point when something is happening right now.
 */
export function ScanHub({
  t,
  language,
  nav,
  listen,
  apk,
  lookup,
  onOpen,
  onExample,
  onAlreadyPaid,
  onRecent,
}: Props) {
  const recent = recentChecks();

  const tiles: { id: HubTarget; icon: typeof MessageIcon; title: string; sub: string }[] = [
    { id: "message", icon: MessageIcon, title: nav.message, sub: t.pastePlaceholder },
    { id: "screenshot", icon: UploadIcon, title: nav.screenshot, sub: t.uploadButton },
    { id: "call", icon: PhoneIcon, title: nav.call, sub: listen.entryHint },
    { id: "number", icon: DialIcon, title: nav.number, sub: lookup.sub },
  ];

  return (
    <div className="space-y-5">
      <header className="ruko-rise">
        <h1 className="text-[1.5rem] leading-tight font-bold tracking-tight">{t.checkHeading}</h1>
        <p className="mt-1 text-[0.95rem] text-muted">{t.checkSubheading}</p>
      </header>

      <div
        className="ruko-rise grid grid-cols-2 gap-3"
        style={{ "--rise-delay": "60ms" } as React.CSSProperties}
      >
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => onOpen(tile.id)}
              className="group flex min-h-[9.5rem] flex-col rounded-[12px] border border-line bg-surface p-4 text-left transition-transform active:scale-[0.98]"
            >
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-[12px] bg-sunken text-ink transition-colors group-hover:bg-action group-hover:text-on-action">
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-[1.05rem] leading-snug font-semibold">{tile.title}</span>
              <span className="mt-0.5 line-clamp-2 text-[0.8rem] leading-snug text-muted">
                {tile.sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* The app file gets a full-width row: it is the least expected of the
          five, and a stranger's APK is the fastest way to lose everything. */}
      <button
        type="button"
        onClick={() => onOpen("app")}
        className="ruko-rise flex w-full items-center gap-3 rounded-[12px] border border-line bg-surface p-4 text-left transition-transform active:scale-[0.99]"
        style={{ "--rise-delay": "120ms" } as React.CSSProperties}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-sunken">
          <AppFileIcon className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[1.05rem] font-semibold">{nav.app}</span>
          <span className="mt-0.5 block truncate text-[0.8rem] text-muted">{apk.entryHint}</span>
        </span>
        <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted" />
      </button>

      <section className="ruko-rise" style={{ "--rise-delay": "180ms" } as React.CSSProperties}>
        <h2 className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-muted">
          {t.examplesLabel}
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {t.examples.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => onExample(example.text)}
              className="min-h-[44px] rounded-full border border-line bg-surface px-4 text-[0.85rem] font-semibold"
            >
              {example.label}
            </button>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="ruko-rise" style={{ "--rise-delay": "220ms" } as React.CSSProperties}>
          <h2 className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-muted">
            {t.recentTitle}
          </h2>
          <ul className="mt-2 overflow-hidden rounded-[12px] border border-line bg-surface">
            {recent.map((check, i) => (
              <li key={check.id} className={i > 0 ? "border-t border-line" : ""}>
                <button
                  type="button"
                  onClick={() => onRecent(check)}
                  className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${LEVEL_DOT[check.level] ?? "bg-muted"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.95rem] font-medium">
                      {check.headline}
                    </span>
                    <span className="mt-0.5 block text-[0.78rem] text-muted">
                      {levelName(check.level, t)} · {timeAgo(check.at, language)}
                    </span>
                  </span>
                  <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Always reachable, never shouting: the person who needs it is not
          browsing, they are frightened and looking for the way out. */}
      <button
        type="button"
        onClick={onAlreadyPaid}
        className="ruko-rise flex w-full items-center justify-between gap-3 rounded-[12px] border-[1.5px] border-red-line bg-red-tint px-4 py-3.5 text-left"
        style={{ "--rise-delay": "260ms" } as React.CSSProperties}
      >
        <span className="min-w-0">
          <span className="block text-[1rem] font-bold text-red-ink">{t.alreadyPaidButton}</span>
          <span className="mt-0.5 block text-[0.8rem] text-red-ink/85">{t.goldenHourSub}</span>
        </span>
        <span className="shrink-0 rounded-full bg-red px-3 py-1.5 text-[0.78rem] font-bold text-white">
          1930
        </span>
      </button>

      <p className="pb-2 text-center text-[0.78rem] text-muted">{t.footerDisclaimer}</p>
    </div>
  );
}

function levelName(level: RecentCheck["level"], t: Strings): string {
  if (level === "scam") return t.levelScam;
  if (level === "suspicious") return t.levelSuspicious;
  return t.levelNoScamSigns;
}
