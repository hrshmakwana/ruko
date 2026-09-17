import type { Language } from "../types";
import { en, type Strings } from "./en";
import { gu } from "./gu";
import { hi } from "./hi";

export const dictionaries: Record<Language, Strings> = { en, hi, gu };

export const LANGUAGE_OPTIONS: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "gu", label: "ગુજરાતી" },
];

const STORAGE_KEY = "ruko.language";

export function loadLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "hi" || saved === "gu") return saved;
  } catch {
    // Private browsing or blocked storage: fall through to the browser default.
  }
  const browser = navigator.language?.slice(0, 2);
  if (browser === "hi" || browser === "gu") return browser;
  return "en";
}

export function saveLanguage(language: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Not being able to remember the choice is not worth an error.
  }
}

export type { Strings };
