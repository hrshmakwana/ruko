import { useEffect, useState } from "react";
import { ApkScreen } from "./components/ApkScreen";
import { CheckScreen } from "./components/CheckScreen";
import { DirectiveOverlay } from "./components/DirectiveOverlay";
import { FamilyScreen } from "./components/FamilyScreen";
import { GoldenHourScreen } from "./components/GoldenHourScreen";
import { ListenScreen } from "./components/ListenScreen";
import { Loading } from "./components/Loading";
import { LookupPanel } from "./components/LookupPanel";
import { PanicButton } from "./components/PanicButton";
import { Shell, type Destination } from "./components/Shell";
import { VerdictScreen } from "./components/VerdictScreen";
import { applyLanguage, dictionaries, loadLanguage, saveLanguage } from "./i18n";
import { apkFor } from "./i18n/apk";
import { familyFor } from "./i18n/family";
import { installFor } from "./i18n/install";
import { listenFor } from "./i18n/listen";
import { lookupFor } from "./i18n/lookup";
import { navFor } from "./i18n/nav";
import { ApiError, checkMessage, reportScam, uploadImage } from "./lib/api";
import { loadFamilyCode } from "./lib/guardian";
import { takeSharedPayload, type SharedPayload } from "./lib/install";
import { useDirective } from "./lib/useDirective";
import type { PreparedImage } from "./lib/image";
import type { Language, Verdict } from "./types";

/** A verdict and the golden-hour checklist are answers, not places: they take
 *  over the screen and then hand it back to wherever the person was. */
type Answer = "verdict" | "golden-hour" | null;

function startingDestination(): Destination {
  const mode = new URLSearchParams(window.location.search).get("mode");
  if (mode === "lookup") return "number";
  if (mode === "listen") return "call";
  if (mode === "apk") return "app";
  return "message";
}

export default function App() {
  const [language, setLanguage] = useState<Language>(loadLanguage);
  const [destination, setDestination] = useState<Destination>(startingDestination);
  const [answer, setAnswer] = useState<Answer>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [checkedText, setCheckedText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [reported, setReported] = useState(false);
  const [familyCode, setFamilyCode] = useState<string | null>(loadFamilyCode);
  const [shared, setShared] = useState<SharedPayload | null>(null);
  const [sharedApk, setSharedApk] = useState<File | null>(null);

  const t = dictionaries[language];
  const f = familyFor(language);
  const l = lookupFor(language);
  const listen = listenFor(language);
  const install = installFor(language);
  const apk = apkFor(language);
  const nav = navFor(language);
  const { directive, dismiss } = useDirective(familyCode);

  // Anything shared in from another app arrives through the service worker. An
  // app file goes to the app checker; a screenshot goes to the message check.
  useEffect(() => {
    void takeSharedPayload().then((payload) => {
      if (!payload) return;
      if (payload.file && /\.apk$/i.test(payload.file.name)) {
        setSharedApk(payload.file);
        setDestination("app");
        return;
      }
      setShared(payload);
      setDestination("message");
    });
  }, []);

  function changeLanguage(next: Language) {
    setLanguage(next);
    saveLanguage(next);
    applyLanguage(next);
  }

  function go(next: Destination) {
    setDestination(next);
    setAnswer(null);
    setError(null);
    window.scrollTo({ top: 0 });
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
      setAnswer("verdict");
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

  function content() {
    if (busy) return <Loading t={t} />;

    if (answer === "verdict" && verdict) {
      return (
        <div className="space-y-4">
          <VerdictScreen
            t={t}
            verdict={verdict}
            checkedText={checkedText}
            imagePreview={imagePreview}
            reported={reported}
            onReport={handleReport}
            onAlreadyPaid={() => {
              setAnswer("golden-hour");
              window.scrollTo({ top: 0 });
            }}
            onBack={() => setAnswer(null)}
          />
          {/* Right where it is needed: the verdict says scam, and the person is
              still on the phone to them. */}
          {familyCode && verdict.risk_level !== "no_scam_signs" && (
            <PanicButton f={f} code={familyCode} language={language} />
          )}
        </div>
      );
    }

    if (answer === "golden-hour") {
      return (
        <GoldenHourScreen
          t={t}
          verdict={verdict}
          onBack={() => setAnswer(verdict ? "verdict" : null)}
        />
      );
    }

    switch (destination) {
      case "call":
        return (
          <ListenScreen
            l={listen}
            language={language}
            onBack={() => go("message")}
            familyCode={familyCode}
            familyToldLabel={f.familyToldLive}
          />
        );
      case "app":
        return <ApkScreen s={apk} initialFile={sharedApk} onBack={() => go("message")} />;
      case "number":
        return <LookupPanel t={t} l={l} language={language} />;
      case "family":
        return (
          <FamilyScreen
            f={f}
            install={install}
            code={familyCode}
            onChange={setFamilyCode}
            language={language}
          />
        );
      default:
        return (
          <div className="space-y-5">
            <CheckScreen
              t={t}
              busy={busy}
              error={error}
              onCheck={handleCheck}
              onError={setError}
              shared={shared}
            />
            {familyCode && <PanicButton f={f} code={familyCode} language={language} />}
          </div>
        );
    }
  }

  const footer = (
    <footer className="border-t border-line bg-surface px-4 py-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 text-center text-[0.85rem] text-muted">
        <p>{t.footerDisclaimer}</p>
        <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          <a href="tel:1930" className="inline-flex min-h-[44px] items-center font-bold text-action">
            {t.footerHelpline}
          </a>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center font-bold text-action"
          >
            {t.footerPortal}
          </a>
          <a href="/guardian" className="inline-flex min-h-[44px] items-center font-bold text-action">
            {f.familyTitle}
          </a>
        </p>
      </div>
    </footer>
  );

  return (
    <>
      {/* The guardian's answer beats everything else on screen. */}
      {directive && <DirectiveOverlay f={f} directive={directive} onDismiss={dismiss} />}

      <Shell
        nav={nav}
        active={destination}
        onNavigate={go}
        language={language}
        onLanguage={changeLanguage}
        languageLabel={t.languageLabel}
        appName={t.appName}
        footer={footer}
        wide={answer === "verdict"}
      >
        {content()}
        <div className="mt-8 lg:hidden">{footer}</div>
      </Shell>
    </>
  );
}
