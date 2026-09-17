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
}

const MAX_SOURCE_BYTES = 12 * 1024 * 1024; // before we resize it down to <5 MB

export function CheckScreen({ t, busy, error, onCheck, onError }: Props) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<PreparedImage | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

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
      const prepared = await prepareImage(file);
      setImage(prepared);
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
      <header className="space-y-1.5">
        <h1 className="text-[1.6rem] leading-tight font-bold">{t.checkHeading}</h1>
        <p className="text-[0.95rem] text-muted">{t.checkSubheading}</p>
      </header>

      <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <label htmlFor="message" className="block text-[0.9rem] font-semibold">
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
          rows={6}
          maxLength={4000}
          className="mt-2 w-full resize-y rounded-xl border border-line bg-sunken p-3 text-[1rem] leading-relaxed text-ink placeholder:text-muted focus:border-brand focus:outline-none"
        />

        {image ? (
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-line bg-sunken p-3">
            <img
              src={image.previewUrl}
              alt=""
              className="h-20 w-20 shrink-0 rounded-lg object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="min-h-[44px] rounded-lg border border-line bg-surface px-3 text-[0.9rem] font-semibold"
              >
                {t.changeImageButton}
              </button>
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(image.previewUrl);
                  setImage(null);
                }}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg px-3 text-[0.9rem] font-semibold text-muted"
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
            className="mt-3 flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-line bg-sunken px-4 text-[1rem] font-semibold text-ink"
          >
            <UploadIcon className="h-6 w-6 text-brand" />
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

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-scam-border bg-scam-tint px-4 py-3 text-[0.95rem] font-medium text-scam"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="min-h-[60px] w-full rounded-2xl bg-brand px-5 text-[1.15rem] font-bold text-on-brand shadow-sm transition-opacity disabled:opacity-60"
      >
        {busy ? t.checkingButton : t.checkButton}
      </button>

      <p className="flex items-start justify-center gap-2 text-center text-[0.9rem] text-muted">
        <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <span>{t.privacyNote}</span>
      </p>

      {IS_MOCK && (
        <p className="rounded-lg bg-sunken px-3 py-2 text-center text-[0.75rem] text-muted">
          Demo mode — no API connected yet (VITE_API_URL is unset).
        </p>
      )}
    </div>
  );
}
