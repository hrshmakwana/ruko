import { useState } from "react";
import type { FamilyStrings } from "../i18n/family";
import { raisePanic } from "../lib/guardian";
import type { Language } from "../types";

interface Props {
  f: FamilyStrings;
  code: string;
  language: Language;
}

/** The button for the worst moment: someone is on the line right now.
 *
 * It does one thing, it says what will happen before you press it, and it
 * cannot be pressed by accident — it needs a press-and-hold, which is also how
 * you avoid a pocket alarm going off at 2am on your daughter's phone.
 */
export function PanicButton({ f, code, language }: Props) {
  const [state, setState] = useState<"idle" | "holding" | "sending" | "sent" | "failed">("idle");
  const [timer, setTimer] = useState<number | null>(null);

  function beginHold() {
    if (state === "sent" || state === "sending") return;
    setState("holding");
    setTimer(window.setTimeout(fire, 700));
  }

  function cancelHold() {
    if (timer !== null) {
      clearTimeout(timer);
      setTimer(null);
    }
    setState((s) => (s === "holding" ? "idle" : s));
  }

  async function fire() {
    setState("sending");
    try {
      await raisePanic(code, language);
      setState("sent");
      try {
        navigator.vibrate?.([80, 60, 80]);
      } catch {
        /* not supported */
      }
    } catch {
      setState("failed");
    }
  }

  if (state === "sent") {
    return (
      <section
        aria-live="assertive"
        className="rounded-2xl border-2 border-green-line bg-green-tint p-4 text-center"
      >
        <p className="text-[1.05rem] font-extrabold text-green-ink">{f.panicSent}</p>
      </section>
    );
  }

  return (
    <div>
      <button
        type="button"
        onPointerDown={beginHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        disabled={state === "sending"}
        className={[
          "relative min-h-[64px] w-full overflow-hidden rounded-2xl px-5 text-[1.1rem] font-extrabold text-white",
          "bg-red-panel transition-transform active:scale-[0.99]",
          state === "holding" ? "ring-4 ring-red-line" : "",
        ].join(" ")}
      >
        {/* Fills across while held, so the hold is visible rather than a guess. */}
        <span
          className={`absolute inset-y-0 start-0 bg-black/25 transition-[width] ease-linear ${
            state === "holding" ? "w-full duration-700" : "w-0 duration-150"
          }`}
          aria-hidden="true"
        />
        <span className="relative">
          {state === "sending" ? f.panicSending : f.panicButton}
        </span>
      </button>
      <p className="mt-1.5 text-center text-[0.85rem] text-muted">{f.panicHint}</p>
      {state === "failed" && (
        <p role="alert" className="mt-2 text-center text-[0.9rem] font-semibold text-red-ink">
          {f.panicFailed}
        </p>
      )}
    </div>
  );
}
