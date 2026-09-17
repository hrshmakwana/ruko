/** The languages Ruko speaks.
 *
 * Each is listed by its **endonym** — the name the language calls itself —
 * because someone looking for their own language scans for "ଓଡ଼ିଆ", not for
 * "Odia". The English name is kept alongside for screen readers and search.
 *
 * Ordered by number of speakers in India, with English first because it is the
 * language everything else is written against.
 */
export const LANGUAGES = [
  { code: "en", endonym: "English", english: "English" },
  { code: "hi", endonym: "हिंदी", english: "Hindi" },
  { code: "bn", endonym: "বাংলা", english: "Bengali" },
  { code: "mr", endonym: "मराठी", english: "Marathi" },
  { code: "te", endonym: "తెలుగు", english: "Telugu" },
  { code: "ta", endonym: "தமிழ்", english: "Tamil" },
  { code: "gu", endonym: "ગુજરાતી", english: "Gujarati" },
  { code: "ur", endonym: "اردو", english: "Urdu", dir: "rtl" },
  { code: "kn", endonym: "ಕನ್ನಡ", english: "Kannada" },
  { code: "or", endonym: "ଓଡ଼ିଆ", english: "Odia" },
  { code: "ml", endonym: "മലയാളം", english: "Malayalam" },
  { code: "pa", endonym: "ਪੰਜਾਬੀ", english: "Punjabi" },
  { code: "as", endonym: "অসমীয়া", english: "Assamese" },
  { code: "mai", endonym: "मैथिली", english: "Maithili" },
  { code: "ne", endonym: "नेपाली", english: "Nepali" },
] as const;

export type Language = (typeof LANGUAGES)[number]["code"];

export interface LanguageInfo {
  code: Language;
  endonym: string;
  english: string;
  dir?: "rtl";
}

export const LANGUAGE_CODES: readonly Language[] = LANGUAGES.map((l) => l.code);

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (LANGUAGE_CODES as readonly string[]).includes(value);
}

export function languageInfo(code: Language): LanguageInfo {
  return (LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]) as LanguageInfo;
}

/** Urdu is written right to left, so the whole document flips for it. */
export function directionFor(code: Language): "ltr" | "rtl" {
  return languageInfo(code).dir === "rtl" ? "rtl" : "ltr";
}
