import type { Language } from "../types";

/** Two strings about screenshots.
 *
 * Showing the words Ruko read back to the person is the difference between
 * "checked and clear" and "never actually read" — a distinction that has to be
 * visible, because the second one dressed up as the first is the most dangerous
 * thing this app could do.
 */
export interface ScreenshotStrings {
  readLabel: string;
  unreadTitle: string;
}

const dictionaries: Record<Language, ScreenshotStrings> = {
  en: {
    readLabel: "What Ruko read from your screenshot",
    unreadTitle: "Ruko could not read this screenshot",
  },
  hi: {
    readLabel: "रुको ने आपके स्क्रीनशॉट से यह पढ़ा",
    unreadTitle: "रुको यह स्क्रीनशॉट पढ़ नहीं सका",
  },
  bn: {
    readLabel: "রুকো আপনার স্ক্রিনশট থেকে যা পড়ল",
    unreadTitle: "রুকো এই স্ক্রিনশট পড়তে পারেনি",
  },
  mr: {
    readLabel: "रुकोने तुमच्या स्क्रीनशॉटमधून हे वाचले",
    unreadTitle: "रुकोला हा स्क्रीनशॉट वाचता आला नाही",
  },
  te: {
    readLabel: "మీ స్క్రీన్‌షాట్ నుంచి రుకో చదివినది",
    unreadTitle: "రుకో ఈ స్క్రీన్‌షాట్‌ను చదవలేకపోయింది",
  },
  ta: {
    readLabel: "உங்கள் ஸ்கிரீன்ஷாட்டிலிருந்து ருகோ படித்தது",
    unreadTitle: "ருகோவால் இந்த ஸ்கிரீன்ஷாட்டைப் படிக்க முடியவில்லை",
  },
  gu: {
    readLabel: "રુકોએ તમારા સ્ક્રીનશોટમાંથી આ વાંચ્યું",
    unreadTitle: "રુકો આ સ્ક્રીનશોટ વાંચી શક્યું નથી",
  },
  ur: {
    readLabel: "رُکو نے آپ کے اسکرین شاٹ سے یہ پڑھا",
    unreadTitle: "رُکو یہ اسکرین شاٹ نہیں پڑھ سکا",
  },
  kn: {
    readLabel: "ನಿಮ್ಮ ಸ್ಕ್ರೀನ್‌ಶಾಟ್‌ನಿಂದ ರುಕೋ ಓದಿದ್ದು",
    unreadTitle: "ರುಕೋಗೆ ಈ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಓದಲಾಗಲಿಲ್ಲ",
  },
  or: {
    readLabel: "ଆପଣଙ୍କ ସ୍କ୍ରିନସଟରୁ ରୁକୋ ଏହା ପଢ଼ିଲା",
    unreadTitle: "ରୁକୋ ଏହି ସ୍କ୍ରିନସଟ ପଢ଼ି ପାରିଲା ନାହିଁ",
  },
  ml: {
    readLabel: "നിങ്ങളുടെ സ്ക്രീൻഷോട്ടിൽ നിന്ന് രുകോ വായിച്ചത്",
    unreadTitle: "രുകോയ്ക്ക് ഈ സ്ക്രീൻഷോട്ട് വായിക്കാനായില്ല",
  },
  pa: {
    readLabel: "ਰੁਕੋ ਨੇ ਤੁਹਾਡੇ ਸਕ੍ਰੀਨਸ਼ਾਟ ਤੋਂ ਇਹ ਪੜ੍ਹਿਆ",
    unreadTitle: "ਰੁਕੋ ਇਹ ਸਕ੍ਰੀਨਸ਼ਾਟ ਪੜ੍ਹ ਨਹੀਂ ਸਕਿਆ",
  },
  as: {
    readLabel: "আপোনাৰ স্ক্ৰীণশ্বটৰ পৰা ৰুকোৱে এইটো পঢ়িলে",
    unreadTitle: "ৰুকোৱে এই স্ক্ৰীণশ্বট পঢ়িব নোৱাৰিলে",
  },
  mai: {
    readLabel: "रुको अहाँक स्क्रीनशॉट सँ ई पढ़लक",
    unreadTitle: "रुको ई स्क्रीनशॉट नहि पढ़ि सकल",
  },
  ne: {
    readLabel: "रुकोले तपाईंको स्क्रिनसटबाट यो पढ्यो",
    unreadTitle: "रुकोले यो स्क्रिनसट पढ्न सकेन",
  },
};

export function screenshotFor(language: Language): ScreenshotStrings {
  return dictionaries[language] ?? dictionaries.en;
}
