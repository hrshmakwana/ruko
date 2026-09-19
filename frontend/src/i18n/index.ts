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

/** The Google Font that renders each script properly.
 *
 * Fifteen scripts cannot all be downloaded up front — that is megabytes on a
 * phone. Only the one the person chose is fetched, when they choose it, and
 * Latin (Inter) is always there underneath for the words that stay English,
 * like OTP and UPI.
 */
const SCRIPT_FONTS: Partial<Record<Language, string>> = {
  hi: "Noto+Sans+Devanagari",
  mr: "Noto+Sans+Devanagari",
  mai: "Noto+Sans+Devanagari",
  ne: "Noto+Sans+Devanagari",
  bn: "Noto+Sans+Bengali",
  as: "Noto+Sans+Bengali",
  gu: "Noto+Sans+Gujarati",
  ta: "Noto+Sans+Tamil",
  te: "Noto+Sans+Telugu",
  kn: "Noto+Sans+Kannada",
  ml: "Noto+Sans+Malayalam",
  or: "Noto+Sans+Oriya",
  pa: "Noto+Sans+Gurmukhi",
  ur: "Noto+Nastaliq+Urdu",
};

function loadScriptFont(language: Language): void {
  const family = SCRIPT_FONTS[language];
  if (!family) {
    document.documentElement.style.removeProperty("--script-font");
    return;
  }
  const id = `ruko-font-${family}`;
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }
  // Put the script font first, so Devanagari is rendered by a Devanagari face
  // and the Latin inside the same sentence still comes from Inter.
  document.documentElement.style.setProperty(
    "--script-font",
    `"${family.replace(/\+/g, " ")}"`,
  );
}

/** Apply the language to the document: screen readers, RTL and the script font
 *  all follow from this one call, so a language choice is never half-applied. */
export function applyLanguage(language: Language): void {
  document.documentElement.lang = language;
  document.documentElement.dir = directionFor(language);
  loadScriptFont(language);
}

export { LANGUAGES, languageInfo, directionFor, isLanguage } from "./languages";
export type { Language } from "./languages";
export type { Strings };
