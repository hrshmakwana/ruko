import { useState } from "react";
import type { FamilyStrings } from "../i18n/family";
import { linkFamily, saveFamilyCode } from "../lib/guardian";

interface Props {
  f: FamilyStrings;
  code: string | null;
  onChange: (code: string | null) => void;
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 2.7l7.2 2.6v6c0 4.4-3 8.2-7.2 9.9-4.2-1.7-7.2-5.5-7.2-9.9v-6z"
        fill="currentColor"
        opacity="0.18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m8.6 12 2.3 2.3 4.5-4.8"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Linking a family is one field and one button. Anything longer and the
 *  person it protects will never finish it. */
export function FamilyPanel({ f, code, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function link() {
    const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cleaned.length !== 6) {
      setError(f.familyBadCode);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await linkFamily(cleaned);
      saveFamilyCode(result.family_code);
      onChange(result.family_code);
      setOpen(false);
      setInput("");
    } catch {
      setError(f.familyBadCode);
    } finally {
      setBusy(false);
    }
  }

  if (code) {
    return (
      <section className="rounded-2xl border-2 border-green-line bg-green-tint p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-green" />
          <div className="min-w-0 flex-1">
            <p className="text-[1rem] font-bold text-green-ink">{f.familyLinked(code)}</p>
            <p className="mt-0.5 text-[0.88rem] text-green-ink/80">{f.familyLinkedNote}</p>
            <button
              type="button"
              onClick={() => {
                saveFamilyCode(null);
                onChange(null);
              }}
              className="mt-2 inline-flex min-h-[44px] items-center text-[0.88rem] font-bold text-green-ink underline"
            >
              {f.familyUnlink}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-4 text-[0.98rem] font-bold text-ink"
      >
        <ShieldCheck className="h-5 w-5 text-green" />
        {f.familySetupCta}
      </button>
    );
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <h3 className="text-[1.05rem] font-bold">{f.familyTitle}</h3>
      <p className="mt-1 text-[0.9rem] text-muted">{f.familyIntro}</p>

      <label htmlFor="family-code" className="mt-3 block text-[0.85rem] font-bold">
        {f.familyCodeLabel}
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id="family-code"
          value={input}
          onChange={(e) => {
            setInput(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder={f.familyCodePlaceholder}
          maxLength={8}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className="min-h-[52px] w-full rounded-xl border border-line bg-sunken px-3 font-mono text-[1.15rem] tracking-[0.2em] uppercase focus:border-action focus:outline-none"
        />
        <button
          type="button"
          onClick={link}
          disabled={busy}
          className="min-h-[52px] shrink-0 rounded-xl bg-action px-5 text-[1rem] font-bold text-on-action disabled:opacity-60"
        >
          {busy ? f.familyLinking : f.familyLinkButton}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[0.88rem] font-semibold text-red-ink">
          {error}
        </p>
      )}
    </section>
  );
}
