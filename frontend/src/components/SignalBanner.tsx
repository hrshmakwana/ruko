import { Icon } from "./Icon";
import type { Strings } from "../i18n";
import type { RiskLevel } from "../types";

interface Props {
  level: RiskLevel;
  score: number;
  t: Strings;
}

/** The verdict billboard, as drawn in the mockups.
 *
 * A filled card in the verdict colour, an uppercase warning label, the verdict
 * itself at display size, and one line of what to do about it. This is the only
 * place in Ruko where a saturated colour is allowed, which is what makes it
 * legible from across a room without reading a word.
 */
export function SignalBanner({ level, score, t }: Props) {
  const scam = level === "scam";
  const suspicious = level === "suspicious";

  const skin = scam
    ? "bg-error text-on-error"
    : suspicious
      ? "bg-warn-container text-on-warn-container"
      : "bg-clear-container text-on-clear-container";

  const label = scam ? t.stopWord : suspicious ? t.levelSuspicious : t.levelNoScamSigns;
  const word = scam ? t.levelScam : suspicious ? t.levelSuspicious : t.levelNoScamSigns;
  const sub = scam ? t.levelScamSub : suspicious ? t.levelSuspiciousSub : t.levelNoScamSignsSub;
  const glyph = scam ? "dangerous" : suspicious ? "warning" : "verified_user";

  return (
    <section
      aria-live="polite"
      className={`relative flex w-full flex-col gap-2 overflow-hidden rounded-xl p-4 shadow-md sm:p-5 ${skin} ${
        scam ? "ruko-slam" : "ruko-rise"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon name={glyph} className="shrink-0 text-[32px] sm:text-[38px]" filled />
        <div className="flex min-w-0 flex-col">
          <span className="text-caption font-bold uppercase tracking-wider opacity-80">
            {label}
          </span>
          <h2 className="text-headline-lg font-extrabold leading-tight tracking-tight sm:text-display">
            {word}
          </h2>
        </div>
      </div>

      <p className="mt-0.5 text-body-md font-medium opacity-90">{sub}</p>

      <div className="mt-1 flex items-center gap-2.5">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-current/25"
          role="img"
          aria-label={`${t.scoreLabel}: ${score} / 100`}
        >
          <div
            className="h-full rounded-full bg-current transition-[width] duration-700"
            style={{ width: `${Math.max(5, score)}%` }}
          />
        </div>
        <span className="font-mono text-caption font-semibold opacity-90">{score}/100</span>
      </div>
    </section>
  );
}
