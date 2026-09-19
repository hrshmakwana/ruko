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
        <h1 className="text-[1.6rem] leading-tight font-extrabold tracking-tight">
          {f.familyTitle}
        </h1>
        <p className="text-[0.98rem] text-muted">{f.familyIntro}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        {/* ---------------------------------------- the person being protected --- */}
        <section className="rounded-3xl border-2 border-action-soft bg-surface p-5">
          <ShieldIcon className="h-8 w-8 text-green" />
          <h2 className="mt-2.5 text-[1.15rem] font-extrabold">{f.roleProtectedTitle}</h2>
          <p className="mt-1 text-[0.93rem] leading-relaxed text-muted">{f.roleProtectedBody}</p>
          <div className="mt-4">
            <FamilyPanel f={f} code={code} onChange={onChange} startOpen />
          </div>
          {code && (
            <div className="mt-3">
              <PanicButton f={f} code={code} language={language} />
            </div>
          )}
        </section>

        {/* ------------------------------------------ the person who is told --- */}
        <section className="rounded-3xl border border-line bg-surface p-5">
          <OkIcon className="h-8 w-8 text-action" />
          <h2 className="mt-2.5 text-[1.15rem] font-extrabold">{f.roleGuardianTitle}</h2>
          <p className="mt-1 text-[0.93rem] leading-relaxed text-muted">{f.roleGuardianBody}</p>
          <a
            href="/guardian"
            className="mt-4 flex min-h-[54px] w-full items-center justify-center rounded-2xl bg-action px-5 text-[1.02rem] font-extrabold text-on-action"
          >
            {f.createCode}
          </a>
        </section>
      </div>

      {/* ------------------------------------------------------ permissions --- */}
      <section className="rounded-3xl border border-line bg-surface p-5">
        <h2 className="text-[1.05rem] font-extrabold">{f.permsTitle}</h2>

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
                className="mt-3 min-h-[48px] rounded-xl border-2 border-line px-4 text-[0.95rem] font-bold disabled:opacity-60"
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
