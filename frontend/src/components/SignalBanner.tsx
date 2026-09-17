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
    <div
      className="flex shrink-0 flex-col items-center gap-2 rounded-2xl bg-housing px-2.5 py-3 ring-1 ring-black/20"
      aria-hidden="true"
    >
      {LAMPS.map((lamp) => {
        const live = lamp === level;
        return (
          <span
            key={lamp}
            className={`block h-7 w-7 rounded-full ${live ? "ruko-lamp-live" : ""}`}
            style={{
              background: LAMP_COLOUR[lamp],
              opacity: live ? 1 : 0.14,
              boxShadow: live ? `0 0 16px 2px ${LAMP_COLOUR[lamp]}aa` : "none",
            }}
          />
        );
      })}
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
    </svg>
  );
}

export function SignalBanner({ level, score, t }: Props) {
  const isScam = level === "scam";

  const panel =
    level === "scam"
      ? "bg-red-panel text-white border-transparent"
      : level === "suspicious"
        ? "bg-amber-tint text-amber-ink border-amber-line"
        : "bg-green-tint text-green-ink border-green-line";

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
      className={`relative overflow-hidden rounded-3xl border-2 px-4 py-4 ${panel} ${
        isScam ? "ruko-slam" : "ruko-rise"
      }`}
    >
      {isScam && (
        <Octagon className="pointer-events-none absolute -top-8 -right-10 h-44 w-44 text-white/15" />
      )}

      <div className="relative flex items-center gap-4">
        <SignalHead level={level} />
        <div className="min-w-0">
          {isScam && (
            <p className="text-[2.1rem] leading-none font-extrabold tracking-tight">
              {t.stopWord}
            </p>
          )}
          <p
            className={
              isScam
                ? "mt-1 text-[1.05rem] font-bold uppercase tracking-[0.14em] opacity-95"
                : "text-[1.9rem] leading-none font-extrabold tracking-tight"
            }
          >
            {word}
          </p>
          <p className="mt-1.5 text-[0.95rem] leading-snug font-medium opacity-95">{sub}</p>
        </div>
      </div>

      <div className="relative mt-4">
        <div className="mb-1 flex items-baseline justify-between text-[0.78rem] font-bold uppercase tracking-wider opacity-90">
          <span>{t.scoreLabel}</span>
          <span className="font-mono text-[0.9rem] tracking-normal">{score}/100</span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-current/20"
          role="img"
          aria-label={`${t.scoreLabel}: ${score} / 100`}
        >
          <div
            className="h-full rounded-full bg-current transition-[width] duration-700"
            style={{ width: `${Math.max(5, score)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
