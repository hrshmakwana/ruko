import { useEffect, useState } from "react";
import { FamilyPanel } from "./FamilyPanel";
import { InstallCard } from "./InstallCard";
import { OkIcon, PhoneIcon, ShieldIcon } from "./Icons";
import { PanicButton } from "./PanicButton";
import type { FamilyStrings } from "../i18n/family";
import type { InstallStrings } from "../i18n/install";
import type { Language } from "../types";

interface Props {
  f: FamilyStrings;
  install: InstallStrings;
  code: string | null;
  onChange: (code: string | null) => void;
  language: Language;
}

type MicState = "unknown" | "granted" | "denied";

/** Family protection, with both people on the same screen.
 *
 * The first build only had half of it: a box asking for a family code, and no
 * way to find out where a family code comes from. The parent could not get in,
 * and the son or daughter could not see that the guardian side existed at all —
 * it was a link in the footer. Both roles are named here, in their own words.
 *
 * The permission block is here too, because a call is the worst moment to meet
 * a browser prompt for the first time. Tapping it now means call mode starts
 * instantly later.
 */
export function FamilyScreen({ f, install, code, onChange, language }: Props) {
  const [mic, setMic] = useState<MicState>("unknown");
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    // Permissions API is not on every browser, and on the ones without it the
    // only honest answer is "we do not know yet".
    navigator.permissions
      ?.query({ name: "microphone" as PermissionName })
      .then((status) => {
        if (status.state === "granted") setMic("granted");
        if (status.state === "denied") setMic("denied");
      })
      .catch(() => undefined);
  }, []);

  async function askForMic() {
    setAsking(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Let it go again straight away: this was about the permission, not audio.
      stream.getTracks().forEach((track) => track.stop());
      setMic("granted");
    } catch {
      setMic("denied");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="space-y-5">
      <header className="space-y-1.5">
        <h1 className="text-headline-lg font-bold tracking-tight">
          {f.familyTitle}
        </h1>
        <p className="text-body-md text-secondary">{f.familyIntro}</p>
      </header>

      <section className="rounded-xl bg-surface-container-low p-5 shadow-sm">
        <ShieldIcon className="h-8 w-8 text-clear" />
        <h2 className="mt-2.5 text-headline-md font-semibold">{f.roleProtectedTitle}</h2>
        <p className="mt-1 text-body-md text-secondary">{f.roleProtectedBody}</p>
        <div className="mt-4">
          <FamilyPanel f={f} code={code} onChange={onChange} startOpen />
        </div>
        {code && (
          <div className="mt-3">
            <PanicButton f={f} code={code} language={language} />
          </div>
        )}
      </section>

      {/* ------------------------------------------------------ permissions --- */}
      <section className="rounded-xl bg-surface-container-low p-5 shadow-sm">
        <h2 className="text-headline-md font-semibold">{f.permsTitle}</h2>

        <div className="mt-3 flex items-start gap-3">
          <PhoneIcon className="mt-0.5 h-6 w-6 shrink-0 text-muted" />
          <div className="min-w-0 flex-1">
            <p className="text-[1rem] font-bold">{f.micTitle}</p>
            <p className="mt-0.5 text-[0.92rem] leading-relaxed text-muted">{f.micBody}</p>

            {mic === "granted" ? (
              <p className="mt-2 flex items-center gap-1.5 text-[0.92rem] font-bold text-green-ink">
                <OkIcon className="h-5 w-5 text-green" />
                {f.micAllowed}
              </p>
            ) : mic === "denied" ? (
              <p className="mt-2 text-[0.92rem] font-semibold text-amber-ink">{f.micBlocked}</p>
            ) : (
              <button
                type="button"
                onClick={() => void askForMic()}
                disabled={asking}
                className="mt-3 min-h-[48px] rounded-xl bg-primary px-4 text-body-md font-semibold text-on-primary disabled:opacity-60"
              >
                {f.allowMic}
              </button>
            )}
          </div>
        </div>
      </section>

      <InstallCard s={install} />
    </div>
  );
}
