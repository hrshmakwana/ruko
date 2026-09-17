import { LANGUAGE_OPTIONS } from "../i18n";
import type { Language } from "../types";

interface Props {
  value: Language;
  onChange: (next: Language) => void;
  label: string;
}

export function LanguageToggle({ value, onChange, label }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex gap-1 rounded-full bg-sunken p-1 ring-1 ring-line"
    >
      {LANGUAGE_OPTIONS.map((option) => {
        const selected = option.code === value;
        return (
          <button
            key={option.code}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.code)}
            className={[
              "min-h-[44px] rounded-full px-4 text-[0.85rem] font-semibold transition-colors",
              selected
                ? "bg-action text-on-action"
                : "text-muted hover:text-ink hover:bg-surface",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
