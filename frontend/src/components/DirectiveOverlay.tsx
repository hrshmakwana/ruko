import { useEffect } from "react";
import type { FamilyStrings } from "../i18n/family";
import type { Directive } from "../lib/guardian";
import { startAlarm, vibrate } from "../lib/alarm";

interface Props {
  f: FamilyStrings;
  directive: Directive;
  onDismiss: () => void;
}

/** What the guardian's answer looks like on the parent's phone.
 *
 * Full screen and unmissable on purpose: it has to beat a stranger who is
 * actively talking to them. There is one button, and it is not "close" — it is
 * "I have hung up", because that is the action we actually want.
 */
export function DirectiveOverlay({ f, directive, onDismiss }: Props) {
  const stop = directive.action === "stop";

  useEffect(() => {
    if (stop) {
      startAlarm(4);
      vibrate();
    }
  }, [stop]);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={stop ? f.stopTitle : f.safeTitle}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center ${
        stop ? "bg-red-panel text-white" : "bg-green-tint text-green-ink"
      }`}
    >
      {stop ? (
        <svg viewBox="0 0 100 100" className="ruko-slam h-28 w-28" aria-hidden="true">
          <path
            d="M30.6 4h38.8L96 30.6v38.8L69.4 96H30.6L4 69.4V30.6z"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
          />
          <path d="M50 26v30" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
          <circle cx="50" cy="72" r="5.5" fill="currentColor" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="ruko-slam h-24 w-24" aria-hidden="true">
          <circle cx="12" cy="12" r="9.3" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="m7.8 12.3 2.9 2.9 5.5-6"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      <p className="mt-5 text-[3rem] leading-none font-extrabold tracking-tight">
        {stop ? f.stopTitle : f.safeTitle}
      </p>
      <p className="mt-4 max-w-md text-[1.15rem] leading-snug font-bold">
        {stop ? f.stopBody : f.safeBody}
      </p>
      {directive.note && (
        <p className="mt-3 max-w-md rounded-xl bg-black/15 px-4 py-2 text-[1rem] font-medium">
          “{directive.note}”
        </p>
      )}

      <button
        type="button"
        onClick={onDismiss}
        className={`mt-8 min-h-[60px] w-full max-w-md rounded-2xl px-6 text-[1.1rem] font-extrabold ${
          stop ? "bg-white text-red-panel" : "bg-green text-white"
        }`}
      >
        {stop ? f.stopDismiss : f.safeDismiss}
      </button>
    </div>
  );
}
