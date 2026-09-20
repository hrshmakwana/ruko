import { useCallback, useEffect, useState } from "react";
import { ApkScreen } from "./components/ApkScreen";
import { CheckScreen } from "./components/CheckScreen";
import { DirectiveOverlay } from "./components/DirectiveOverlay";
import { FamilyScreen } from "./components/FamilyScreen";
import { GoldenHourScreen } from "./components/GoldenHourScreen";
import { ListenScreen } from "./components/ListenScreen";
import { Loading } from "./components/Loading";
import { LookupPanel } from "./components/LookupPanel";
import { PanicButton } from "./components/PanicButton";
import { ScanHub, type HubTarget } from "./components/ScanHub";
import { SettingsScreen } from "./components/SettingsScreen";
import { Shell, type Destination } from "./components/Shell";
import { VerdictScreen } from "./components/VerdictScreen";
import { applyLanguage, dictionaries, loadLanguage, saveLanguage } from "./i18n";
import { apkFor } from "./i18n/apk";
import { familyFor } from "./i18n/family";
import { installFor } from "./i18n/install";
import { languageInfo } from "./i18n/languages";
import { listenFor } from "./i18n/listen";
import { lookupFor } from "./i18n/lookup";
import { navFor } from "./i18n/nav";
import { ApiError, checkMessage, reportScam, uploadImage } from "./lib/api";
import { loadFamilyCode } from "./lib/guardian";
import { takeSharedPayload, type SharedPayload } from "./lib/install";
import { applyParentMode, loadParentMode } from "./lib/parentMode";
import { rememberCheck } from "./lib/recent";
import { useDirective } from "./lib/useDirective";
import type { PreparedImage } from "./lib/image";
import type { Language, Verdict } from "./types";

/** What is on screen inside the current tab. The hub is a tab's home; the rest
 *  are places you went into, and come back from. */
type View =
  | { kind: "hub" }
  | { kind: "message"; screenshot?: boolean }
  | { kind: "number" }
  | { kind: "app" }
  | { kind: "verdict" }
  | { kind: "golden-hour" };

function startingPoint(): { destination: Destination; view: View } {
  const mode = new URLSearchParams(window.location.search).get("mode");
  if (mode === "listen") return { destination: "call", view: { kind: "hub" } };
  if (mode === "lookup") return { destination: "check", view: { kind: "number" } };
  if (mode === "apk") return { destination: "check", view: { kind: "app" } };
  return { destination: "check", view: { kind: "hub" } };
}

export default function App() {
  const [start] = useState(startingPoint);
  const [language, setLanguage] = useState<Language>(loadLanguage);
  const [destination, setDestination] = useState<Destination>(start.destination);
  const [view, setView] = useState<View>(start.view);
  const [parentMode, setParentMode] = useState<boolean>(loadParentMode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [checkedText, setCheckedText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [reported, setReported] = useState(false);
  const [familyCode, setFamilyCode] = useState<string | null>(loadFamilyCode);
  const [shared, setShared] = useState<SharedPayload | null>(null);
  const [sharedApk, setSharedApk] = useState<File | null>(null);
  const [prefill, setPrefill] = useState<string | null>(null);
  const [mic, setMic] = useState<"unknown" | "granted" | "denied">("unknown");

  const t = dictionaries[language];
  const f = familyFor(language);
  const l = lookupFor(language);
  const listen = listenFor(language);
  const install = installFor(language);
  const apk = apkFor(language);
  const nav = navFor(language);
  const { directive, dismiss } = useDirective(familyCode);

  useEffect(() => applyParentMode(parentMode), [parentMode]);

  useEffect(() => {
    navigator.permissions
      ?.query({ name: "microphone" as PermissionName })
      .then((status) => {
        if (status.state === "granted") setMic("granted");
        if (status.state === "denied") setMic("denied");
      })
      .catch(() => undefined);
  }, []);

  // Anything shared in from another app arrives through the service worker. An
  // app file goes to the app checker; a screenshot goes to the message check.
  useEffect(() => {
    void takeSharedPayload().then((payload) => {
      if (!payload) return;
      setDestination("check");
      if (payload.file && /\.apk$/i.test(payload.file.name)) {
        setSharedApk(payload.file);
        setView({ kind: "app" });
        return;
      }
      setShared(payload);
      setView({ kind: "message" });
    });
  }, []);

  function changeLanguage(next: Language) {
    setLanguage(next);
    saveLanguage(next);
    applyLanguage(next);
  }

  const go = useCallback((next: Destination) => {
    setDestination(next);
    setView({ kind: "hub" });
    setError(null);
    window.scrollTo({ top: 0 });
  }, []);

  function open(target: HubTarget) {
    setError(null);
    window.scrollTo({ top: 0 });
    if (target === "call") {
      setDestination("call");
      setView({ kind: "hub" });
      return;
    }
    if (target === "screenshot") return setView({ kind: "message", screenshot: true });
    if (target === "message") return setView({ kind: "message" });
    if (target === "number") return setView({ kind: "number" });
    setView({ kind: "app" });
  }

  async function askForMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // The permission was the point, not the audio: let the microphone go.
      stream.getTracks().forEach((track) => track.stop());
      setMic("granted");
    } catch {
      setMic("denied");
    }
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
      rememberCheck(result);
      setView({ kind: "verdict" });
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

    if (view.kind === "verdict" && verdict) {
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
              setView({ kind: "golden-hour" });
              window.scrollTo({ top: 0 });
            }}
            onBack={() => setView({ kind: "hub" })}
          />
          {/* Right where it is needed: the verdict says scam, and the person is
              still on the phone to them. */}
          {familyCode && verdict.risk_level !== "no_scam_signs" && (
            <PanicButton f={f} code={familyCode} language={language} />
          )}
        </div>
      );
    }

    if (view.kind === "golden-hour") {
      return (
        <GoldenHourScreen
          t={t}
          verdict={verdict}
          onBack={() => setView(verdict ? { kind: "verdict" } : { kind: "hub" })}
        />
      );
    }

    if (destination === "call") {
      return (
        <ListenScreen
          l={listen}
          language={language}
          onBack={() => go("check")}
          familyCode={familyCode}
          familyToldLabel={f.familyToldLive}
        />
      );
    }

    if (destination === "family") {
      return (
        <FamilyScreen
          f={f}
          install={install}
          code={familyCode}
          onChange={setFamilyCode}
          language={language}
        />
      );
    }

    if (destination === "settings") {
      return (
        <SettingsScreen
          t={t}
          nav={nav}
          f={f}
          install={install}
          language={language}
          onLanguage={changeLanguage}
          parentMode={parentMode}
          onParentMode={setParentMode}
          micState={mic}
          onAskMic={() => void askForMic()}
        />
      );
    }

    switch (view.kind) {
      case "message":
        return (
          <CheckScreen
            t={t}
            busy={busy}
            error={error}
            onCheck={handleCheck}
            onError={setError}
            shared={shared}
            prefill={prefill}
            openPicker={view.screenshot}
            onBack={() => setView({ kind: "hub" })}
          />
        );
      case "number":
        return (
          <div className="space-y-4">
            <BackLink label={t.backButton} onClick={() => setView({ kind: "hub" })} />
            <LookupPanel t={t} l={l} language={language} />
          </div>
        );
      case "app":
        return <ApkScreen s={apk} initialFile={sharedApk} onBack={() => setView({ kind: "hub" })} />;
      default:
        return (
          <ScanHub
            t={t}
            language={language}
            nav={nav}
            listen={listen}
            apk={apk}
            lookup={l}
            onOpen={open}
            onExample={(text) => {
              setPrefill(text);
              setView({ kind: "message" });
            }}
            onAlreadyPaid={() => setView({ kind: "golden-hour" })}
            onRecent={() => setView({ kind: "hub" })}
          />
        );
    }
  }

  return (
    <>
      {/* The guardian's answer beats everything else on screen. */}
      {directive && <DirectiveOverlay f={f} directive={directive} onDismiss={dismiss} />}

      <Shell
        nav={nav}
        active={destination}
        onNavigate={go}
        appName={t.appName}
        tagline={nav.meansStop}
        languageName={languageInfo(language).endonym}
        sectionTitle={nav.check}
        offlineLabel={t.networkError}
        parentMode={parentMode}
        onParentMode={setParentMode}
        parentLabel={nav.modeParent}
        guardianLabel={nav.modeGuardian}
        familyCode={familyCode}
        familyLinkedLabel={familyCode ? f.familyLinked(familyCode) : undefined}
      >
        {content()}
      </Shell>
    </>
  );
}

function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[44px] items-center gap-2 text-[0.92rem] font-semibold text-muted"
    >
      ← {label}
    </button>
  );
}
