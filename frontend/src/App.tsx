import { useState } from "react";
import { CheckScreen } from "./components/CheckScreen";
import { DirectiveOverlay } from "./components/DirectiveOverlay";
import { FamilyPanel } from "./components/FamilyPanel";
import { GoldenHourScreen } from "./components/GoldenHourScreen";
import { LanguageSelect } from "./components/LanguageSelect";
import { Loading } from "./components/Loading";
import { PanicButton } from "./components/PanicButton";
import { ScamIcon } from "./components/Icons";
import { VerdictScreen } from "./components/VerdictScreen";
import { applyLanguage, dictionaries, loadLanguage, saveLanguage } from "./i18n";
import { familyFor } from "./i18n/family";
import { ApiError, checkMessage, reportScam, uploadImage } from "./lib/api";
import { loadFamilyCode } from "./lib/guardian";
import { useDirective } from "./lib/useDirective";
import type { PreparedImage } from "./lib/image";
import type { Language, Verdict } from "./types";

type Screen = "check" | "verdict" | "golden-hour";

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

  const t = dictionaries[language];
  const f = familyFor(language);
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
        ) : screen === "golden-hour" ? (
          <GoldenHourScreen
            t={t}
            verdict={verdict}
            onBack={() => setScreen(verdict ? "verdict" : "check")}
          />
        ) : (
          <div className="space-y-5">
            <CheckScreen t={t} busy={busy} error={error} onCheck={handleCheck} onError={setError} />
            {familyCode && <PanicButton f={f} code={familyCode} language={language} />}
            <FamilyPanel f={f} code={familyCode} onChange={setFamilyCode} />
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
