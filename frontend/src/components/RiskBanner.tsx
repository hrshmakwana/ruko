import type { Strings } from "../i18n";
import type { RiskLevel } from "../types";
import { OkIcon, ScamIcon, SuspiciousIcon } from "./Icons";

interface Props {
  level: RiskLevel;
  score: number;
  t: Strings;
}

const STYLES: Record<
  RiskLevel,
  { wrap: string; icon: typeof ScamIcon; meter: string }
> = {
  scam: {
    wrap: "bg-scam-tint border-scam-border text-scam",
    icon: ScamIcon,
    meter: "bg-scam",
  },
  suspicious: {
    wrap: "bg-suspicious-tint border-suspicious-border text-suspicious",
    icon: SuspiciousIcon,
    meter: "bg-suspicious",
  },
  no_scam_signs: {
    wrap: "bg-ok-tint border-ok-border text-ok",
    icon: OkIcon,
    meter: "bg-ok",
  },
};

export function RiskBanner({ level, score, t }: Props) {
  const style = STYLES[level];
  const Icon = style.icon;
  const word =
    level === "scam"
      ? t.levelScam
      : level === "suspicious"
        ? t.levelSuspicious
        : t.levelNoScamSigns;
  const sub =
    level === "scam"
      ? t.levelScamSub
      : level === "suspicious"
        ? t.levelSuspiciousSub
        : t.levelNoScamSignsSub;

  return (
    <section
      aria-live="polite"
      className={`rounded-2xl border-2 px-5 py-5 ${style.wrap}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-11 w-11 shrink-0" />
        <div className="min-w-0">
          <p className="text-[1.75rem] leading-tight font-bold">{word}</p>
          <p className="text-[0.95rem] font-medium opacity-90">{sub}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-baseline justify-between text-[0.8rem] font-semibold opacity-90">
          <span>{t.scoreLabel}</span>
          <span>{score}/100</span>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-surface/70"
          role="img"
          aria-label={`${t.scoreLabel}: ${score} / 100`}
        >
          <div
            className={`h-full rounded-full ${style.meter}`}
            style={{ width: `${Math.max(4, score)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
