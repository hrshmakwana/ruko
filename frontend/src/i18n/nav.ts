import type { Language } from "../types";

/** The names of the places in Ruko.
 *
 * One or two words each, because they sit under an icon in a bar that is 360px
 * wide in the worst case. Nouns, not verbs: someone glancing at the bar is
 * asking "where do I go", not "what do I do".
 */
export interface NavStrings {
  message: string;
  call: string;
  app: string;
  number: string;
  family: string;
  attack: string;
  menu: string;
  home: string;
}

const dictionaries: Record<Language, NavStrings> = {
  en: { message: "Message", call: "Call", app: "App file", number: "Number", family: "Family", attack: "Attack Ruko", menu: "Menu", home: "Home" },
  hi: { message: "संदेश", call: "कॉल", app: "ऐप फ़ाइल", number: "नंबर", family: "परिवार", attack: "रुको तोड़ें", menu: "मेन्यू", home: "होम" },
  bn: { message: "বার্তা", call: "কল", app: "অ্যাপ ফাইল", number: "নম্বর", family: "পরিবার", attack: "রুকো ভাঙুন", menu: "মেনু", home: "হোম" },
  mr: { message: "संदेश", call: "कॉल", app: "अ‍ॅप फाईल", number: "नंबर", family: "कुटुंब", attack: "रुको तोडा", menu: "मेनू", home: "होम" },
  te: { message: "సందేశం", call: "కాల్", app: "యాప్ ఫైల్", number: "నంబర్", family: "కుటుంబం", attack: "రుకోను పరీక్షించు", menu: "మెనూ", home: "హోమ్" },
  ta: { message: "செய்தி", call: "அழைப்பு", app: "ஆப் கோப்பு", number: "எண்", family: "குடும்பம்", attack: "ருகோவை சோதி", menu: "மெனு", home: "முகப்பு" },
  gu: { message: "સંદેશ", call: "કૉલ", app: "એપ ફાઇલ", number: "નંબર", family: "પરિવાર", attack: "રુકો તોડો", menu: "મેનૂ", home: "હોમ" },
  ur: { message: "پیغام", call: "کال", app: "ایپ فائل", number: "نمبر", family: "خاندان", attack: "رُکو آزمائیں", menu: "مینو", home: "ہوم" },
  kn: { message: "ಸಂದೇಶ", call: "ಕರೆ", app: "ಆ್ಯಪ್ ಫೈಲ್", number: "ಸಂಖ್ಯೆ", family: "ಕುಟುಂಬ", attack: "ರುಕೋ ಪರೀಕ್ಷಿಸಿ", menu: "ಮೆನು", home: "ಹೋಮ್" },
  or: { message: "ସନ୍ଦେଶ", call: "କଲ", app: "ଆପ ଫାଇଲ", number: "ନମ୍ବର", family: "ପରିବାର", attack: "ରୁକୋ ପରୀକ୍ଷା", menu: "ମେନୁ", home: "ହୋମ" },
  ml: { message: "സന്ദേശം", call: "കോൾ", app: "ആപ്പ് ഫയൽ", number: "നമ്പർ", family: "കുടുംബം", attack: "റുകോ പരീക്ഷിക്കൂ", menu: "മെനു", home: "ഹോം" },
  pa: { message: "ਸੁਨੇਹਾ", call: "ਕਾਲ", app: "ਐਪ ਫ਼ਾਈਲ", number: "ਨੰਬਰ", family: "ਪਰਿਵਾਰ", attack: "ਰੁਕੋ ਪਰਖੋ", menu: "ਮੀਨੂ", home: "ਹੋਮ" },
  as: { message: "বাৰ্তা", call: "কল", app: "এপ ফাইল", number: "নম্বৰ", family: "পৰিয়াল", attack: "ৰুকো পৰীক্ষা", menu: "মেনু", home: "হোম" },
  mai: { message: "संदेश", call: "कॉल", app: "एप फाइल", number: "नंबर", family: "परिवार", attack: "रुको परखू", menu: "मेनू", home: "होम" },
  ne: { message: "सन्देश", call: "कल", app: "एप फाइल", number: "नम्बर", family: "परिवार", attack: "रुको परख", menu: "मेनु", home: "होम" },
};

export function navFor(language: Language): NavStrings {
  return dictionaries[language] ?? dictionaries.en;
}
