import { Icon } from "./Icon";
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

const DOT: Record<string, string> = {
  scam: "bg-error",
  suspicious: "bg-warn",
  no_scam_signs: "bg-clear",
};

const EXAMPLE_ICON = ["bolt", "lightbulb", "package_2"];

/** "What do you want to check?" — the hub from the mockups.
 *
 * Four tiles and a row, all above the fold, because the one a person needs is
 * whichever matches what just happened to them. On a laptop the same tiles
 * spread into three columns instead of staying a phone-width strip.
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

  const tiles: { id: HubTarget; icon: string; title: string; sub: string }[] = [
    { id: "message", icon: "chat", title: nav.message, sub: t.pastePlaceholder },
    { id: "screenshot", icon: "image", title: nav.screenshot, sub: t.uploadButton },
    { id: "call", icon: "phone_in_talk", title: nav.call, sub: listen.entryHint },
    { id: "number", icon: "search", title: nav.number, sub: lookup.sub },
  ];

  return (
    <div className="flex flex-col">
      <header className="ruko-rise mb-4">
        <h1 className="text-headline-lg font-bold tracking-tight">{t.checkHeading}</h1>
        <p className="mt-0.5 text-body-md text-secondary">{t.checkSubheading}</p>
      </header>

      <div
        className="ruko-rise grid grid-cols-2 gap-3 lg:grid-cols-3"
        style={{ "--rise-delay": "60ms" } as React.CSSProperties}
      >
        {tiles.map((tile) => (
          <button
            key={tile.id}
            type="button"
            onClick={() => onOpen(tile.id)}
            className="group flex flex-col rounded-xl bg-surface-container-low p-4 text-left shadow-sm transition-transform active:scale-[0.98]"
          >
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container text-on-surface transition-colors group-hover:bg-primary group-hover:text-on-primary">
              <Icon name={tile.icon} className="text-[26px]" />
            </span>
            <span className="text-headline-md font-semibold">{tile.title}</span>
            <span className="mt-0.5 line-clamp-2 text-caption text-secondary">{tile.sub}</span>
          </button>
        ))}

        {/* The app file: a full-width row on a phone, a third tile on a laptop. */}
        <button
          type="button"
          onClick={() => onOpen("app")}
          className="col-span-2 flex items-center gap-3 rounded-xl bg-surface-container-low p-4 text-left shadow-sm transition-transform active:scale-[0.99] lg:col-span-1 lg:flex-col lg:items-start"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container lg:mb-3">
            <Icon name="android" className="text-[26px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-headline-md font-semibold">{nav.app}</span>
            <span className="mt-0.5 line-clamp-2 block text-caption text-secondary">
              {apk.entryHint}
            </span>
          </span>
          <Icon name="chevron_right" className="shrink-0 text-[22px] text-secondary lg:hidden" />
        </button>
      </div>

      <section className="ruko-rise mt-6" style={{ "--rise-delay": "150ms" } as React.CSSProperties}>
        <h2 className="text-caption font-bold uppercase tracking-wider text-on-surface-variant">
          {t.examplesLabel}
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {t.examples.map((example, i) => (
            <button
              key={example.label}
              type="button"
              onClick={() => onExample(example.text)}
              className="ruko-compact flex min-h-[40px] items-center gap-1.5 rounded-full bg-surface-container-low px-3.5 text-body-md font-medium text-on-surface shadow-sm"
            >
              <Icon name={EXAMPLE_ICON[i] ?? "bolt"} className="text-[18px] text-secondary" />
              {example.label}
            </button>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section
          className="ruko-rise mt-6"
          style={{ "--rise-delay": "190ms" } as React.CSSProperties}
        >
          <h2 className="text-headline-md font-bold">{t.recentTitle}</h2>
          <ul className="mt-2 overflow-hidden rounded-xl bg-surface-container-low shadow-sm">
            {recent.map((check, i) => (
              <li key={check.id} className={i > 0 ? "border-t border-outline-variant/30" : ""}>
                <button
                  type="button"
                  onClick={() => onRecent(check)}
                  className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[check.level] ?? ""}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-lg">{check.headline}</span>
                    <span className="mt-0.5 block text-caption text-secondary">
                      {levelName(check.level, t)} · {timeAgo(check.at, language)}
                    </span>
                  </span>
                  <Icon name="chevron_right" className="shrink-0 text-[20px] text-secondary" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The way out for someone who has already paid, in the design's error
          container rather than a shouting red block. */}
      <button
        type="button"
        onClick={onAlreadyPaid}
        className="ruko-rise mt-6 flex w-full items-center justify-between gap-3 rounded-xl bg-error-container p-4 text-left"
        style={{ "--rise-delay": "230ms" } as React.CSSProperties}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <Icon name="crisis_alert" className="shrink-0 text-[24px] text-on-error-container" />
          <span className="min-w-0">
            <span className="block text-headline-md font-bold text-on-error-container">
              {t.alreadyPaidButton}
            </span>
            <span className="mt-0.5 block text-caption text-on-error-container/90">
              {t.goldenHourSub}
            </span>
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-error px-3 py-1.5 text-caption font-bold text-on-error">
          1930
        </span>
      </button>

      <p className="mt-5 pb-2 text-center text-caption text-secondary">{t.footerDisclaimer}</p>
    </div>
  );
}

function levelName(level: RecentCheck["level"], t: Strings): string {
  if (level === "scam") return t.levelScam;
  if (level === "suspicious") return t.levelSuspicious;
  return t.levelNoScamSigns;
}
