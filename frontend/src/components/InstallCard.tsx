import { useEffect, useState } from "react";
import { DownloadIcon, ShareIosIcon } from "./Icons";
import type { InstallStrings } from "../i18n/install";
import { isInstalled, isIosSafari, onInstallAvailability, promptInstall } from "../lib/install";

/** "Put Ruko on your home screen."
 *
 * Shown only when it can actually be acted on: hidden once installed, and on an
 * iPhone it turns into the two steps Safari requires, because there is no
 * install prompt to offer there.
 */
export function InstallCard({ s, tone = "light" }: { s: InstallStrings; tone?: "light" | "dark" }) {
  const [available, setAvailable] = useState(false);
  const [installed, setInstalled] = useState(() => isInstalled());
  const [dismissed, setDismissed] = useState(false);
  const ios = isIosSafari();

  useEffect(() => onInstallAvailability(setAvailable), []);

  if (installed || dismissed || (!available && !ios)) return null;

  const dark = tone === "dark";

  return (
    <section
      className={`rounded-3xl border-2 p-4 ${
        dark ? "border-white/20 bg-white/10 text-white" : "border-action-soft bg-surface"
      }`}
    >
      <div className="flex items-start gap-3">
        {ios ? (
          <ShareIosIcon className="mt-0.5 h-7 w-7 shrink-0 text-action" />
        ) : (
          <DownloadIcon className="mt-0.5 h-7 w-7 shrink-0 text-action" />
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-[1.08rem] font-extrabold">{s.title}</h2>
          <p className={`mt-1 text-[0.92rem] ${dark ? "text-white/80" : "text-muted"}`}>{s.body}</p>

          {ios ? (
            <ol className={`mt-2 space-y-1 text-[0.9rem] ${dark ? "text-white/80" : "text-muted"}`}>
              <li>1. {s.iosStep1}</li>
              <li>2. {s.iosStep2}</li>
            </ol>
          ) : (
            <button
              type="button"
              onClick={async () => {
                const outcome = await promptInstall();
                if (outcome === "accepted") setInstalled(true);
                if (outcome === "unavailable") setDismissed(true);
              }}
              className="mt-3 min-h-[52px] w-full rounded-2xl bg-action px-5 text-[1.02rem] font-extrabold text-on-action"
            >
              {s.button}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
