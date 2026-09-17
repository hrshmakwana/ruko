import type { Language } from "../types";

/** Parent-facing strings for the family-protection feature.
 *
 * Kept separate from the main dictionary so the feature could ship and be
 * translated in the same day without blocking on all fifteen files at once.
 * Falls back to English for anything not yet translated.
 */
export interface FamilyStrings {
  familyTitle: string;
  familyIntro: string;
  familyCodeLabel: string;
  familyCodePlaceholder: string;
  familyLinkButton: string;
  familyLinking: string;
  familyLinked: (code: string) => string;
  familyLinkedNote: string;
  familyUnlink: string;
  familyBadCode: string;
  familySetupCta: string;
  panicButton: string;
  panicHint: string;
  panicSending: string;
  panicSent: string;
  panicFailed: string;
  stopTitle: string;
  stopBody: string;
  stopDismiss: string;
  safeTitle: string;
  safeBody: string;
  safeDismiss: string;
}

const en: FamilyStrings = {
  familyTitle: "Family protection",
  familyIntro:
    "If someone in your family set up Ruko, enter their code. When Ruko finds a scam, they are told straight away.",
  familyCodeLabel: "Family code",
  familyCodePlaceholder: "6 letters",
  familyLinkButton: "Link",
  familyLinking: "Linking…",
  familyLinked: (code: string) => `Linked to family ${code}`,
  familyLinkedNote: "Your family is told when Ruko finds a scam. They never see your messages.",
  familyUnlink: "Unlink",
  familyBadCode: "No family found with that code. Check the letters and try again.",
  familySetupCta: "Set up family protection",
  panicButton: "Someone is pressuring me",
  panicHint: "Your family's phone will sound an alarm immediately.",
  panicSending: "Alerting your family…",
  panicSent: "Your family has been alerted. Stay on this screen — they may reply here.",
  panicFailed: "Could not reach your family. Please call them directly.",
  stopTitle: "STOP",
  stopBody: "Your family says hang up now. Do not pay and do not share any code.",
  stopDismiss: "I have hung up",
  safeTitle: "Your family says it is fine",
  safeBody: "They have looked at it and say you can carry on.",
  safeDismiss: "Thank you",
};

const translated: Partial<Record<Language, FamilyStrings>> = { en };

export function familyFor(language: Language): FamilyStrings {
  return translated[language] ?? en;
}

export { en as familyEn };
