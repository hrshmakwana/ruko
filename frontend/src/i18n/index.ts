import { as } from "./locales/as";
import { bn } from "./locales/bn";
import { en, type Strings } from "./locales/en";
import { gu } from "./locales/gu";
import { hi } from "./locales/hi";
import { kn } from "./locales/kn";
import { mai } from "./locales/mai";
import { ml } from "./locales/ml";
import { mr } from "./locales/mr";
import { ne } from "./locales/ne";
import { or } from "./locales/or";
import { pa } from "./locales/pa";
import { ta } from "./locales/ta";
import { te } from "./locales/te";
import { ur } from "./locales/ur";
import { directionFor, isLanguage, type Language } from "./languages";

export const dictionaries: Record<Language, Strings> = {
  en,
  hi,
  bn,
  mr,
  te,
  ta,
  gu,
  ur,
  kn,
  or,
  ml,
  pa,
  as,
  mai,
  ne,
};

const STORAGE_KEY = "ruko.language";

export function loadLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    // Private browsing or blocked storage: fall through to the browser default.
  }
  // navigator.language is like "ta-IN"; the first part is what we key on.
  const browser = navigator.language?.split("-")[0];
  return isLanguage(browser) ? browser : "en";
}

export function saveLanguage(language: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Not being able to remember the choice is not worth an error.
  }
}

/** Apply the language to the document: screen readers and RTL both need this. */
export function applyLanguage(language: Language): void {
  document.documentElement.lang = language;
  document.documentElement.dir = directionFor(language);
}

export { LANGUAGES, languageInfo, directionFor, isLanguage } from "./languages";
export type { Language } from "./languages";
export type { Strings };
