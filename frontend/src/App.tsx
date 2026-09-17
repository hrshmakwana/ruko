import { useState } from "react";
import { CheckScreen } from "./components/CheckScreen";
import { GoldenHourScreen } from "./components/GoldenHourScreen";
import { LanguageToggle } from "./components/LanguageToggle";
import { Loading } from "./components/Loading";
import { ScamIcon } from "./components/Icons";
import { VerdictScreen } from "./components/VerdictScreen";
import { dictionaries, loadLanguage, saveLanguage } from "./i18n";
import { ApiError, checkMessage, reportScam, uploadImage } from "./lib/api";
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

  const t = dictionaries[language];

  function changeLanguage(next: Language) {
    setLanguage(next);
    saveLanguage(next);
    document.documentElement.lang = next;
  }

  async function handleCheck({ text, image }: { text: string; image: PreparedImage | null }) {
    setBusy(true);
    setError(null);
    try {
      const imageKey = image ? await uploadImage(image.blob, image.contentType) : undefined;
      const result = await checkMessage({ text: text || undefined, image_key: imageKey, language });
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
          <LanguageToggle value={language} onChange={changeLanguage} label={t.languageLabel} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">
        {busy ? (
          <Loading t={t} />
        ) : screen === "verdict" && verdict ? (
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
        ) : screen === "golden-hour" ? (
          <GoldenHourScreen t={t} onBack={() => setScreen(verdict ? "verdict" : "check")} />
        ) : (
          <CheckScreen t={t} busy={busy} error={error} onCheck={handleCheck} onError={setError} />
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
          </p>
        </div>
      </footer>
    </div>
  );
}
