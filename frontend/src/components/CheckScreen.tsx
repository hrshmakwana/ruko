import { useEffect, useRef, useState } from "react";
import { IS_MOCK } from "../lib/api";
import { prepareImage, type PreparedImage } from "../lib/image";
import type { Strings } from "../i18n";
import { CrossIcon, ShieldIcon, UploadIcon } from "./Icons";

interface Props {
  t: Strings;
  busy: boolean;
  error: string | null;
  onCheck: (input: { text: string; image: PreparedImage | null }) => void;
  onError: (message: string | null) => void;
  /** A screenshot or text shared into Ruko from another app's share sheet. */
  shared?: { file: File | null; text: string } | null;
  /** An example the person tapped on the hub, dropped into the box for them. */
  prefill?: string | null;
  /** Entered from the Screenshot tile: open the picker without a second tap. */
  openPicker?: boolean;
  onBack?: () => void;
}

const MAX_SOURCE_BYTES = 12 * 1024 * 1024; // before we resize it down to <5 MB

export function CheckScreen({
  t,
  busy,
  error,
  onCheck,
  onError,
  shared,
  prefill,
  openPicker,
  onBack,
}: Props) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<PreparedImage | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (prefill) setText(prefill);
  }, [prefill]);

  // Arriving from the Screenshot tile means the gallery, not a blank box.
  useEffect(() => {
    if (openPicker) fileInput.current?.click();
    // Only on the way in; re-opening the picker on every render would trap them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Something shared in from WhatsApp or the gallery lands here, filled in and
  // ready, so the person only has to press the one button they came for.
  useEffect(() => {
    if (!shared) return;
    if (shared.text) setText((current) => current || shared.text);
    if (shared.file) void handleFile(shared.file);
    // handleFile is stable enough for this one-shot import.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shared]);

  // Revoke the object URL when the preview goes away, so we don't leak blobs.
  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image.previewUrl);
    };
  }, [image]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    onError(null);
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      onError(t.imageTypeError);
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      onError(t.imageTooLargeError);
      return;
    }
    try {
      setImage(await prepareImage(file));
    } catch {
      onError(t.imageTypeError);
    }
  }

  function submit() {
    if (!text.trim() && !image) {
      onError(t.emptyInputError);
      return;
    }
    onCheck({ text: text.trim(), image });
  }

  return (
    <div className="space-y-5">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[44px] items-center gap-2 text-[0.92rem] font-semibold text-muted"
        >
          ← {t.backButton}
        </button>
      )}

      <header className="ruko-rise space-y-1.5">
        <h1 className="text-[1.75rem] leading-tight font-extrabold tracking-tight">
          {t.checkHeading}
        </h1>
        <p className="text-[0.98rem] text-muted">{t.checkSubheading}</p>
      </header>

      <div
        className="ruko-rise rounded-3xl border border-line bg-surface p-4 shadow-sm"
        style={{ "--rise-delay": "70ms" } as React.CSSProperties}
      >
        <label htmlFor="message" className="block text-[0.88rem] font-bold">
          {t.pasteLabel}
        </label>
        <textarea
          id="message"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) onError(null);
          }}
          placeholder={t.pastePlaceholder}
          rows={5}
          maxLength={4000}
          className="mt-2 w-full resize-y rounded-2xl border border-line bg-sunken p-3.5 text-[1rem] leading-relaxed text-ink placeholder:text-muted focus:border-action focus:outline-none"
        />

        {image ? (
          <div className="mt-3 flex items-start gap-3 rounded-2xl border border-line bg-sunken p-3">
            <img
              src={image.previewUrl}
              alt=""
              className="h-20 w-20 shrink-0 rounded-xl object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="min-h-[44px] rounded-xl border border-line bg-surface px-3 text-[0.9rem] font-bold"
              >
                {t.changeImageButton}
              </button>
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(image.previewUrl);
                  setImage(null);
                }}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-3 text-[0.9rem] font-bold text-muted"
              >
                <CrossIcon className="h-4 w-4" />
                {t.removeImageButton}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="mt-3 flex min-h-[58px] w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-line bg-sunken px-4 text-[1rem] font-bold text-ink"
          >
            <UploadIcon className="h-6 w-6" />
            {t.uploadButton}
          </button>
        )}

        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {/* Real messages, so the first thing someone sees Ruko do is recognise a
          scam they have actually received. */}
      <div className="ruko-rise" style={{ "--rise-delay": "140ms" } as React.CSSProperties}>
        <p className="mb-2 text-[0.78rem] font-bold uppercase tracking-wider text-muted">
          {t.examplesLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          {t.examples.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => {
                setText(example.text);
                onError(null);
              }}
              className="min-h-[44px] rounded-full border border-line bg-surface px-4 text-[0.88rem] font-bold text-ink"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-2xl border-2 border-red-line bg-red-tint px-4 py-3 text-[0.95rem] font-semibold text-red-ink"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="ruko-rise min-h-[62px] w-full rounded-2xl bg-action px-5 text-[1.2rem] font-extrabold text-on-action shadow-sm transition-opacity disabled:opacity-60"
        style={{ "--rise-delay": "210ms" } as React.CSSProperties}
      >
        {busy ? t.checkingButton : t.checkButton}
      </button>

      <p className="flex items-start justify-center gap-2 text-center text-[0.9rem] text-muted">
        <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0" />
        <span>{t.privacyNote}</span>
      </p>

      {IS_MOCK && (
        <p className="rounded-xl bg-sunken px-3 py-2 text-center text-[0.75rem] text-muted">
          Demo mode — no API connected yet (VITE_API_URL is unset).
        </p>
      )}
    </div>
  );
}
