import type { Strings } from "../i18n";
import type { RiskLevel } from "../types";

interface Props {
  level: RiskLevel;
  score: number;
  t: Strings;
}

const LAMPS: RiskLevel[] = ["scam", "suspicious", "no_scam_signs"];

const LAMP_COLOUR: Record<RiskLevel, string> = {
  scam: "#e01b34",
  suspicious: "#f5a524",
  no_scam_signs: "#23c47f",
};

/** A three-lamp signal head. The live lamp glows; the others are all but off.
 *  Position in the housing carries the meaning as much as the colour does. */
function SignalHead({ level }: { level: RiskLevel }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-black/15 px-1.5 py-1"
      aria-hidden="true"
    >
      {LAMPS.map((lamp) => {
        const live = lamp === level;
        return (
          <span
            key={lamp}
            className={`block h-2 w-2 rounded-full ${live ? "ruko-lamp-live" : ""}`}
            style={{
              background: LAMP_COLOUR[lamp],
              opacity: live ? 1 : 0.25,
            }}
          />
        );
      })}
    </span>
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
    </svg>
  );
}

export function SignalBanner({ level, score, t }: Props) {
  const isScam = level === "scam";

  // The design system's rule: a verdict is a card with a 1.5px border tinted to
  // its own colour, and it is the only place in Ruko where colour appears.
  const panel =
    level === "scam"
      ? "border-transparent bg-red-panel text-white"
      : level === "suspicious"
        ? "border-amber-line bg-amber-tint text-amber-ink"
        : "border-green-line bg-green-tint text-green-ink";

  const word =
    level === "scam" ? t.levelScam : level === "suspicious" ? t.levelSuspicious : t.levelNoScamSigns;
  const sub =
    level === "scam"
      ? t.levelScamSub
      : level === "suspicious"
        ? t.levelSuspiciousSub
        : t.levelNoScamSignsSub;

  return (
    <section
      aria-live="polite"
      className={`ruko-billboard relative overflow-hidden rounded-[12px] border-[1.5px] p-5 ${panel} ${
        isScam ? "ruko-slam" : "ruko-rise"
      }`}
    >
      {isScam && (
        <Octagon className="pointer-events-none absolute -top-6 -right-8 h-36 w-36 text-white/12" />
      )}

      <div className="relative">
        <p className="flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] opacity-90">
          <SignalHead level={level} />
          {isScam ? t.stopWord : t.scoreLabel}
        </p>

        {/* The verdict itself, at display size: readable at arm's length by
            someone who is frightened and holding the phone away from them. */}
        <p className="mt-2 text-[1.85rem] leading-tight font-bold tracking-tight">{word}</p>
        <p className="mt-1.5 text-[0.98rem] leading-snug font-medium opacity-95">{sub}</p>

        <div className="mt-4 flex items-center gap-3">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-current/20"
            role="img"
            aria-label={`${t.scoreLabel}: ${score} / 100`}
          >
            <div
              className="h-full rounded-full bg-current transition-[width] duration-700"
              style={{ width: `${Math.max(5, score)}%` }}
            />
          </div>
          <span className="font-mono text-[0.8rem] font-semibold opacity-90">{score}/100</span>
        </div>
      </div>
    </section>
  );
}
