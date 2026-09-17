/** A compile-time guarantee, not a test file.
 *
 * Both dictionaries are typed `Record<Language, ...>`, so adding a language to
 * languages.ts without adding its strings is a compile error rather than an
 * English sentence appearing in the middle of a Tamil screen.
 *
 * The runtime checks below are cheap enough to run on import in development.
 */
import { dictionaries } from "./index";
import { familyDictionaries, familyEn } from "./family";
import { LANGUAGE_CODES } from "./languages";

export function checkTranslationCoverage(): string[] {
  const problems: string[] = [];

  for (const code of LANGUAGE_CODES) {
    const main = dictionaries[code];
    const family = familyDictionaries[code];

    if (!main) problems.push(`${code}: no main dictionary`);
    if (!family) problems.push(`${code}: no family dictionary`);
    if (!family || code === "en") continue;

    // A locale copy-pasted from English and not translated is worse than
    // obvious: it looks finished.
    for (const key of Object.keys(familyEn) as (keyof typeof familyEn)[]) {
      const value = family[key];
      const english = familyEn[key];
      if (typeof value === "string" && typeof english === "string" && value === english) {
        problems.push(`${code}: family.${key} is still the English string`);
      }
    }
  }

  return problems;
}

if (import.meta.env?.DEV) {
  const problems = checkTranslationCoverage();
  if (problems.length) console.warn("[i18n]", problems);
}
