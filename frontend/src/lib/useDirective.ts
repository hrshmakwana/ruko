import { useEffect, useRef, useState } from "react";
import { familyStatus, type Directive } from "./guardian";

const POLL_MS = 4000;

/** Watch for a directive from the family's guardian.
 *
 * Polling rather than push: web push needs a service worker, VAPID keys and a
 * permission prompt the person has to accept in advance — and if they declined
 * it once, the feature is silently dead at the moment it matters. A four-second
 * poll is a handful of tiny reads and works on every browser, including an old
 * Android that will never see a push.
 *
 * Polling pauses when the tab is hidden, and each directive is shown once.
 */
export function useDirective(code: string | null): {
  directive: Directive | null;
  dismiss: () => void;
} {
  const [directive, setDirective] = useState<Directive | null>(null);
  const seen = useRef<number>(0);

  useEffect(() => {
    if (!code) {
      setDirective(null);
      return;
    }

    let stopped = false;
    let timer: number | undefined;

    async function poll() {
      if (stopped) return;
      if (document.visibilityState === "visible") {
        try {
          const { directive: next } = await familyStatus(code!);
          // `at` is the identity of a directive: a newer one replaces an older,
          // and one already dismissed never comes back.
          if (next && next.at > seen.current) {
            seen.current = next.at;
            setDirective(next);
          }
        } catch {
          // A failed poll is not worth telling anyone about; try again shortly.
        }
      }
      timer = window.setTimeout(poll, POLL_MS);
    }

    void poll();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [code]);

  return { directive, dismiss: () => setDirective(null) };
}
