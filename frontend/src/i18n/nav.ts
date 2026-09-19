import type { Language } from "../types";

/** The names of the places in Ruko.
 *
 * One or two words each, because they sit under an icon in a bar that is 360px
 * wide in the worst case. Nouns, not verbs: someone glancing at the bar is
 * asking "where do I go", not "what do I do".
 */
export interface NavStrings {
  /** The four places in the bottom bar. */
  check: string;
  call: string;
  family: string;
  settings: string;
  /** Names of the things inside the check hub. */
  message: string;
  screenshot: string;
  app: string;
  number: string;
  attack: string;
  /** The header's mode switch, and the strapline under the logo. */
  modeGuardian: string;
  modeParent: string;
  meansStop: string;
  menu: string;
  home: string;
}

const dictionaries: Record<Language, NavStrings> = {
  en: { modeGuardian: "Normal", modeParent: "Large text", meansStop: "Ruko means stop", check: "Check", settings: "Settings", screenshot: "Screenshot", message: "Message", call: "Call", app: "App file", number: "Number", family: "Family", attack: "Attack Ruko", menu: "Menu", home: "Home" },
  hi: { modeGuardian: "सामान्य", modeParent: "बड़े अक्षर", meansStop: "रुको यानी ठहरो", check: "जाँच", settings: "सेटिंग", screenshot: "स्क्रीनशॉट", message: "संदेश", call: "कॉल", app: "ऐप फ़ाइल", number: "नंबर", family: "परिवार", attack: "रुको तोड़ें", menu: "मेन्यू", home: "होम" },
  bn: { modeGuardian: "সাধারণ", modeParent: "বড় লেখা", meansStop: "রুকো মানে থামো", check: "যাচাই", settings: "সেটিংস", screenshot: "স্ক্রিনশট", message: "বার্তা", call: "কল", app: "অ্যাপ ফাইল", number: "নম্বর", family: "পরিবার", attack: "রুকো ভাঙুন", menu: "মেনু", home: "হোম" },
  mr: { modeGuardian: "सामान्य", modeParent: "मोठा मजकूर", meansStop: "रुको म्हणजे थांबा", check: "तपासा", settings: "सेटिंग", screenshot: "स्क्रीनशॉट", message: "संदेश", call: "कॉल", app: "अ‍ॅप फाईल", number: "नंबर", family: "कुटुंब", attack: "रुको तोडा", menu: "मेनू", home: "होम" },
  te: { modeGuardian: "సాధారణ", modeParent: "పెద్ద అక్షరాలు", meansStop: "రుకో అంటే ఆగు", check: "తనిఖీ", settings: "సెట్టింగ్‌లు", screenshot: "స్క్రీన్‌షాట్", message: "సందేశం", call: "కాల్", app: "యాప్ ఫైల్", number: "నంబర్", family: "కుటుంబం", attack: "రుకోను పరీక్షించు", menu: "మెనూ", home: "హోమ్" },
  ta: { modeGuardian: "சாதாரண", modeParent: "பெரிய எழுத்து", meansStop: "ருகோ என்றால் நில்", check: "சரிபார்", settings: "அமைப்புகள்", screenshot: "ஸ்கிரீன்ஷாட்", message: "செய்தி", call: "அழைப்பு", app: "ஆப் கோப்பு", number: "எண்", family: "குடும்பம்", attack: "ருகோவை சோதி", menu: "மெனு", home: "முகப்பு" },
  gu: { modeGuardian: "સામાન્ય", modeParent: "મોટા અક્ષર", meansStop: "રુકો એટલે થોભો", check: "તપાસો", settings: "સેટિંગ", screenshot: "સ્ક્રીનશોટ", message: "સંદેશ", call: "કૉલ", app: "એપ ફાઇલ", number: "નંબર", family: "પરિવાર", attack: "રુકો તોડો", menu: "મેનૂ", home: "હોમ" },
  ur: { modeGuardian: "عام", modeParent: "بڑے حروف", meansStop: "رُکو یعنی ٹھہرو", check: "جانچ", settings: "ترتیبات", screenshot: "اسکرین شاٹ", message: "پیغام", call: "کال", app: "ایپ فائل", number: "نمبر", family: "خاندان", attack: "رُکو آزمائیں", menu: "مینو", home: "ہوم" },
  kn: { modeGuardian: "ಸಾಮಾನ್ಯ", modeParent: "ದೊಡ್ಡ ಅಕ್ಷರ", meansStop: "ರುಕೋ ಎಂದರೆ ನಿಲ್ಲು", check: "ಪರಿಶೀಲನೆ", settings: "ಸೆಟ್ಟಿಂಗ್", screenshot: "ಸ್ಕ್ರೀನ್‌ಶಾಟ್", message: "ಸಂದೇಶ", call: "ಕರೆ", app: "ಆ್ಯಪ್ ಫೈಲ್", number: "ಸಂಖ್ಯೆ", family: "ಕುಟುಂಬ", attack: "ರುಕೋ ಪರೀಕ್ಷಿಸಿ", menu: "ಮೆನು", home: "ಹೋಮ್" },
  or: { modeGuardian: "ସାଧାରଣ", modeParent: "ବଡ଼ ଅକ୍ଷର", meansStop: "ରୁକୋ ମାନେ ଅଟକ", check: "ଯାଞ୍ଚ", settings: "ସେଟିଂସ", screenshot: "ସ୍କ୍ରିନସଟ", message: "ସନ୍ଦେଶ", call: "କଲ", app: "ଆପ ଫାଇଲ", number: "ନମ୍ବର", family: "ପରିବାର", attack: "ରୁକୋ ପରୀକ୍ଷା", menu: "ମେନୁ", home: "ହୋମ" },
  ml: { modeGuardian: "സാധാരണ", modeParent: "വലിയ അക്ഷരം", meansStop: "റുകോ എന്നാൽ നിർത്തൂ", check: "പരിശോധന", settings: "ക്രമീകരണം", screenshot: "സ്ക്രീൻഷോട്ട്", message: "സന്ദേശം", call: "കോൾ", app: "ആപ്പ് ഫയൽ", number: "നമ്പർ", family: "കുടുംബം", attack: "റുകോ പരീക്ഷിക്കൂ", menu: "മെനു", home: "ഹോം" },
  pa: { modeGuardian: "ਆਮ", modeParent: "ਵੱਡੇ ਅੱਖਰ", meansStop: "ਰੁਕੋ ਦਾ ਮਤਲਬ ਰੁਕ ਜਾਓ", check: "ਜਾਂਚ", settings: "ਸੈਟਿੰਗ", screenshot: "ਸਕ੍ਰੀਨਸ਼ਾਟ", message: "ਸੁਨੇਹਾ", call: "ਕਾਲ", app: "ਐਪ ਫ਼ਾਈਲ", number: "ਨੰਬਰ", family: "ਪਰਿਵਾਰ", attack: "ਰੁਕੋ ਪਰਖੋ", menu: "ਮੀਨੂ", home: "ਹੋਮ" },
  as: { modeGuardian: "সাধাৰণ", modeParent: "ডাঙৰ আখৰ", meansStop: "ৰুকো মানে ৰোৱা", check: "পৰীক্ষা", settings: "ছেটিংছ", screenshot: "স্ক্ৰীণশ্বট", message: "বাৰ্তা", call: "কল", app: "এপ ফাইল", number: "নম্বৰ", family: "পৰিয়াল", attack: "ৰুকো পৰীক্ষা", menu: "মেনু", home: "হোম" },
  mai: { modeGuardian: "सामान्य", modeParent: "पैघ अक्षर", meansStop: "रुको मानेँ ठहरू", check: "जाँच", settings: "सेटिंग", screenshot: "स्क्रीनशॉट", message: "संदेश", call: "कॉल", app: "एप फाइल", number: "नंबर", family: "परिवार", attack: "रुको परखू", menu: "मेनू", home: "होम" },
  ne: { modeGuardian: "सामान्य", modeParent: "ठूला अक्षर", meansStop: "रुको भनेको रोक", check: "जाँच", settings: "सेटिङ", screenshot: "स्क्रिनसट", message: "सन्देश", call: "कल", app: "एप फाइल", number: "नम्बर", family: "परिवार", attack: "रुको परख", menu: "मेनु", home: "होम" },
};

export function navFor(language: Language): NavStrings {
  return dictionaries[language] ?? dictionaries.en;
}
