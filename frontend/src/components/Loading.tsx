import { useEffect, useState } from "react";
import type { Strings } from "../i18n";

/** A friendly wait: says what Ruko is actually doing, one step at a time. */
export function Loading({ t }: { t: Strings }) {
  const lines = [t.loadingLine1, t.loadingLine2, t.loadingLine3];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, lines.length - 1)), 1400);
    return () => clearInterval(id);
  }, [lines.length]);

  return (
    <div className="flex flex-col items-center gap-4 py-16" role="status" aria-live="polite">
      <div className="relative h-14 w-14">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand/30" />
        <span className="absolute inset-2 rounded-full bg-brand" />
      </div>
      <ul className="space-y-1.5 text-center">
        {lines.map((line, i) => (
          <li
            key={i}
            className={`text-[0.95rem] transition-opacity ${
              i <= step ? "text-ink opacity-100" : "text-muted opacity-40"
            }`}
          >
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
