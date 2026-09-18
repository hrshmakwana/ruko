import { useEffect, useState } from "react";
import { CheckScreen } from "./components/CheckScreen";
import { DirectiveOverlay } from "./components/DirectiveOverlay";
import { FamilyPanel } from "./components/FamilyPanel";
import { GoldenHourScreen } from "./components/GoldenHourScreen";
import { LanguageSelect } from "./components/LanguageSelect";
import { InstallCard } from "./components/InstallCard";
import { ListenScreen } from "./components/ListenScreen";
import { LookupPanel } from "./components/LookupPanel";
import { Loading } from "./components/Loading";
import { PanicButton } from "./components/PanicButton";
import { ScamIcon } from "./components/Icons";
import { VerdictScreen } from "./components/VerdictScreen";
import { applyLanguage, dictionaries, loadLanguage, saveLanguage } from "./i18n";
import { familyFor } from "./i18n/family";
import { installFor } from "./i18n/install";
import { listenFor } from "./i18n/listen";
import { lookupFor } from "./i18n/lookup";
import { ApiError, checkMessage, reportScam, uploadImage } from "./lib/api";
import { loadFamilyCode } from "./lib/guardian";
import { takeSharedPayload, type SharedPayload } from "./lib/install";
import { useDirective } from "./lib/useDirective";
import type { PreparedImage } from "./lib/image";
import type { Language, Verdict } from "./types";

type Screen = "check" | "verdict" | "golden-hour" | "listen";

export default function App() {
  const [language, setLanguage] = useState<Language>(loadLanguage);
  const [screen, setScreen] = useState<Screen>("check");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [checkedText, setCheckedText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [reported, setReported] = useState(false);
  const [familyCode, setFamilyCode] = useState<string | null>(loadFamilyCode);
  // /check?mode=lookup opens straight into lookup, so a link can say "check a
  // number" and land on the right tab.
  const [mode, setMode] = useState<"message" | "lookup">(() =>
    new URLSearchParams(window.location.search).get("mode") === "lookup" ? "lookup" : "message",
  );
  const [shared, setShared] = useState<SharedPayload | null>(null);

  // A screenshot shared from WhatsApp arrives through the service worker, so it
  // is collected once on load rather than read from the address bar.
  useEffect(() => {
    void takeSharedPayload().then((payload) => {
      if (payload) setShared(payload);
    });
  }, []);

  // The home-screen shortcut for "someone is on the phone" opens call mode.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "listen") {
      setScreen("listen");
    }
  }, []);

  const t = dictionaries[language];
  const f = familyFor(language);
  const l = lookupFor(language);
  const listen = listenFor(language);
  const install = installFor(language);
  const { directive, dismiss } = useDirective(familyCode);

  function changeLanguage(next: Language) {
    setLanguage(next);
    saveLanguage(next);
    applyLanguage(next);
  }

  async function handleCheck({ text, image }: { text: string; image: PreparedImage | null }) {
    setBusy(true);
    setError(null);
    try {
      const imageKey = image ? await uploadImage(image.blob, image.contentType) : undefined;
      const result = await checkMessage({
        text: text || undefined,
        image_key: imageKey,
        language,
        family_code: familyCode ?? undefined,
      });
      setVerdict(result);
      setCheckedText(text);
      setImagePreview(image?.previewUrl ?? null);
      setReported(false);
      setScreen("verdict");
      window.scrollTo({ top: 0 });
    } catch (err) {
      const code = err instanceof ApiError ? err.code : "network";
      const byCode: Record<string, string> = {
        empty_input: t.emptyInputError,
        too_large: t.imageTooLargeError,
        bad_content_type: t.imageTypeError,
      };
      setError(byCode[code] ?? t.networkError);
    } finally {
      setBusy(false);
    }
  }

  async function handleReport() {
    if (!verdict) return;
    setReported(true);
    try {
      await reportScam(verdict.check_id);
    } catch {
      // Reporting is best-effort: never block the person with an error here.
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* The guardian's answer beats everything else on screen. */}
      {directive && <DirectiveOverlay f={f} directive={directive} onDismiss={dismiss} />}

      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setScreen("check")}
            className="flex min-h-[44px] items-center gap-2"
          >
            <ScamIcon className="h-8 w-8 text-red" />
            <span className="text-[1.35rem] font-extrabold tracking-tight">{t.appName}</span>
          </button>
          <LanguageSelect value={language} onChange={changeLanguage} label={t.languageLabel} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">
        {busy ? (
          <Loading t={t} />
        ) : screen === "verdict" && verdict ? (
          <div className="space-y-4">
            <VerdictScreen
              t={t}
              verdict={verdict}
              checkedText={checkedText}
              imagePreview={imagePreview}
              reported={reported}
              onReport={handleReport}
              onAlreadyPaid={() => {
                setScreen("golden-hour");
                window.scrollTo({ top: 0 });
              }}
              onBack={() => setScreen("check")}
            />
            {/* Right where it is needed: the verdict says scam, and the person
                is still on the phone to them. */}
            {familyCode && verdict.risk_level !== "no_scam_signs" && (
              <PanicButton f={f} code={familyCode} language={language} />
            )}
          </div>
        ) : screen === "listen" ? (
          <ListenScreen l={listen} language={language} onBack={() => setScreen("check")} />
        ) : screen === "golden-hour" ? (
          <GoldenHourScreen
            t={t}
            verdict={verdict}
            onBack={() => setScreen(verdict ? "verdict" : "check")}
          />
        ) : (
          <div className="space-y-5">
            {/* Two questions people actually bring: "is this message a scam?"
                and "is it safe to call this number back?" */}
            <div
              role="tablist"
              aria-label={l.modeMessage + " / " + l.modeLookup}
              className="grid grid-cols-2 gap-1 rounded-2xl bg-sunken p-1 ring-1 ring-line"
            >
              {(["message", "lookup"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={mode === option}
                  onClick={() => setMode(option)}
                  className={`min-h-[48px] rounded-xl px-3 text-[0.98rem] font-bold transition-colors ${
                    mode === option ? "bg-surface text-ink shadow-sm" : "text-muted"
                  }`}
                >
                  {option === "message" ? l.modeMessage : l.modeLookup}
                </button>
              ))}
            </div>

            {/* A call in progress beats everything else on this screen: the
                money is leaving while they are still talking. */}
            <button
              type="button"
              onClick={() => setScreen("listen")}
              className="flex w-full items-center gap-3 rounded-3xl border-2 border-red-line bg-red-tint px-4 py-3.5 text-left"
            >
              <span className="ruko-lamp-live inline-block h-3 w-3 shrink-0 rounded-full bg-red" />
              <span className="min-w-0">
                <span className="block text-[1.02rem] font-extrabold text-red-ink">
                  {listen.entry}
                </span>
                <span className="mt-0.5 block text-[0.88rem] text-red-ink/85">
                  {listen.entryHint}
                </span>
              </span>
            </button>

            {mode === "message" ? (
              <CheckScreen
                t={t}
                busy={busy}
                error={error}
                onCheck={handleCheck}
                onError={setError}
                shared={shared}
              />
            ) : (
              <LookupPanel t={t} l={l} language={language} />
            )}
            {familyCode && <PanicButton f={f} code={familyCode} language={language} />}
            <FamilyPanel f={f} code={familyCode} onChange={setFamilyCode} />
            <InstallCard s={install} />
          </div>
        )}
      </main>

      <footer className="border-t border-line bg-surface px-4 py-5">
        <div className="mx-auto max-w-2xl space-y-2 text-center text-[0.85rem] text-muted">
          <p>{t.footerDisclaimer}</p>
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <a
              href="tel:1930"
              className="inline-flex min-h-[44px] items-center font-semibold text-action"
            >
              {t.footerHelpline}
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[44px] items-center font-semibold text-action"
            >
              {t.footerPortal}
            </a>
            <a
              href="/guardian"
              className="inline-flex min-h-[44px] items-center font-semibold text-action"
            >
              {f.familyTitle}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
