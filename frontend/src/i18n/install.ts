import type { Language } from "../types";

/** Installing Ruko on the phone. Short, because it is an aside — the app works
 *  in the browser, and nobody should feel blocked by this card. */
export interface InstallStrings {
  title: string;
  body: string;
  button: string;
  iosStep1: string;
  iosStep2: string;
  shared: string;
}

const dictionaries: Record<Language, InstallStrings> = {
  en: {
    title: "Keep Ruko on your phone",
    body: "Adds an icon to your home screen, and lets you share a screenshot straight into Ruko.",
    button: "Install Ruko",
    iosStep1: "Tap the Share button below",
    iosStep2: "Choose “Add to Home Screen”",
    shared: "Screenshot received. Checking it now.",
  },
  hi: {
    title: "रुको को फ़ोन पर रखें",
    body: "होम स्क्रीन पर आइकॉन आ जाएगा, और स्क्रीनशॉट सीधे रुको में भेज सकेंगे।",
    button: "रुको इंस्टॉल करें",
    iosStep1: "नीचे शेयर बटन दबाएँ",
    iosStep2: "“Add to Home Screen” चुनें",
    shared: "स्क्रीनशॉट मिल गया। जाँच रहे हैं।",
  },
  bn: {
    title: "রুকো ফোনে রাখুন",
    body: "হোম স্ক্রিনে আইকন যোগ হবে, আর স্ক্রিনশট সরাসরি রুকোতে পাঠাতে পারবেন।",
    button: "রুকো ইনস্টল করুন",
    iosStep1: "নিচের শেয়ার বোতামে চাপুন",
    iosStep2: "“Add to Home Screen” বেছে নিন",
    shared: "স্ক্রিনশট পাওয়া গেছে। পরীক্ষা করা হচ্ছে।",
  },
  mr: {
    title: "रुको फोनवर ठेवा",
    body: "होम स्क्रीनवर आयकॉन येईल, आणि स्क्रीनशॉट थेट रुकोमध्ये पाठवता येईल.",
    button: "रुको इन्स्टॉल करा",
    iosStep1: "खालील शेअर बटण दाबा",
    iosStep2: "“Add to Home Screen” निवडा",
    shared: "स्क्रीनशॉट मिळाला. तपासत आहोत.",
  },
  te: {
    title: "రుకోను ఫోన్‌లో ఉంచుకోండి",
    body: "హోమ్ స్క్రీన్‌పై ఐకాన్ వస్తుంది, స్క్రీన్‌షాట్‌ను నేరుగా రుకోకి పంపవచ్చు.",
    button: "రుకో ఇన్‌స్టాల్ చేయండి",
    iosStep1: "కింద ఉన్న షేర్ బటన్ నొక్కండి",
    iosStep2: "“Add to Home Screen” ఎంచుకోండి",
    shared: "స్క్రీన్‌షాట్ వచ్చింది. పరిశీలిస్తున్నాం.",
  },
  ta: {
    title: "ருகோவை உங்கள் தொலைபேசியில் வைத்திருங்கள்",
    body: "முகப்புத் திரையில் ஐகான் சேரும், ஸ்கிரீன்ஷாட்டை நேரடியாக ருகோவுக்கு அனுப்பலாம்.",
    button: "ருகோவை நிறுவுங்கள்",
    iosStep1: "கீழே உள்ள பகிர் பொத்தானை அழுத்தவும்",
    iosStep2: "“Add to Home Screen” தேர்வு செய்யவும்",
    shared: "ஸ்கிரீன்ஷாட் வந்தது. சரிபார்க்கிறோம்.",
  },
  gu: {
    title: "રુકોને ફોનમાં રાખો",
    body: "હોમ સ્ક્રીન પર આઇકોન આવશે, અને સ્ક્રીનશોટ સીધો રુકોમાં મોકલી શકશો.",
    button: "રુકો ઇન્સ્ટોલ કરો",
    iosStep1: "નીચે શેર બટન દબાવો",
    iosStep2: "“Add to Home Screen” પસંદ કરો",
    shared: "સ્ક્રીનશોટ મળ્યો. તપાસી રહ્યા છીએ.",
  },
  ur: {
    title: "رُکو کو فون پر رکھیں",
    body: "ہوم اسکرین پر آئیکن آ جائے گا، اور اسکرین شاٹ سیدھا رُکو میں بھیج سکیں گے۔",
    button: "رُکو انسٹال کریں",
    iosStep1: "نیچے شیئر بٹن دبائیں",
    iosStep2: "“Add to Home Screen” منتخب کریں",
    shared: "اسکرین شاٹ مل گیا۔ جانچ رہے ہیں۔",
  },
  kn: {
    title: "ರುಕೋವನ್ನು ಫೋನ್‌ನಲ್ಲಿ ಇಟ್ಟುಕೊಳ್ಳಿ",
    body: "ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ನಲ್ಲಿ ಐಕಾನ್ ಬರುತ್ತದೆ, ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅನ್ನು ನೇರವಾಗಿ ರುಕೋಗೆ ಕಳುಹಿಸಬಹುದು.",
    button: "ರುಕೋ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ",
    iosStep1: "ಕೆಳಗಿನ ಶೇರ್ ಬಟನ್ ಒತ್ತಿ",
    iosStep2: "“Add to Home Screen” ಆಯ್ಕೆ ಮಾಡಿ",
    shared: "ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಸಿಕ್ಕಿದೆ. ಪರಿಶೀಲಿಸುತ್ತಿದ್ದೇವೆ.",
  },
  or: {
    title: "ରୁକୋକୁ ଫୋନରେ ରଖନ୍ତୁ",
    body: "ହୋମ ସ୍କ୍ରିନରେ ଆଇକନ ଆସିବ, ଆଉ ସ୍କ୍ରିନସଟ ସିଧା ରୁକୋକୁ ପଠାଇପାରିବେ।",
    button: "ରୁକୋ ଇନଷ୍ଟଲ କରନ୍ତୁ",
    iosStep1: "ତଳେ ଥିବା ସେୟାର ବଟନ ଦବାନ୍ତୁ",
    iosStep2: "“Add to Home Screen” ବାଛନ୍ତୁ",
    shared: "ସ୍କ୍ରିନସଟ ମିଳିଲା। ଯାଞ୍ଚ କରୁଛୁ।",
  },
  ml: {
    title: "റുകോ ഫോണിൽ സൂക്ഷിക്കൂ",
    body: "ഹോം സ്ക്രീനിൽ ഐക്കൺ വരും, സ്ക്രീൻഷോട്ട് നേരിട്ട് റുകോയിലേക്ക് അയക്കാം.",
    button: "റുകോ ഇൻസ്റ്റാൾ ചെയ്യൂ",
    iosStep1: "താഴെയുള്ള ഷെയർ ബട്ടൺ അമർത്തൂ",
    iosStep2: "“Add to Home Screen” തിരഞ്ഞെടുക്കൂ",
    shared: "സ്ക്രീൻഷോട്ട് കിട്ടി. പരിശോധിക്കുന്നു.",
  },
  pa: {
    title: "ਰੁਕੋ ਨੂੰ ਫ਼ੋਨ ਉੱਤੇ ਰੱਖੋ",
    body: "ਹੋਮ ਸਕ੍ਰੀਨ ਉੱਤੇ ਆਈਕਾਨ ਆ ਜਾਵੇਗਾ, ਅਤੇ ਸਕ੍ਰੀਨਸ਼ਾਟ ਸਿੱਧਾ ਰੁਕੋ ਵਿੱਚ ਭੇਜ ਸਕੋਗੇ।",
    button: "ਰੁਕੋ ਇੰਸਟਾਲ ਕਰੋ",
    iosStep1: "ਹੇਠਾਂ ਸ਼ੇਅਰ ਬਟਨ ਦਬਾਓ",
    iosStep2: "“Add to Home Screen” ਚੁਣੋ",
    shared: "ਸਕ੍ਰੀਨਸ਼ਾਟ ਮਿਲ ਗਿਆ। ਜਾਂਚ ਰਹੇ ਹਾਂ।",
  },
  as: {
    title: "ৰুকোক ফোনত ৰাখক",
    body: "হোম স্ক্ৰীণত আইকন আহিব, আৰু স্ক্ৰীণশ্বট পোনে পোনে ৰুকোলৈ পঠাব পাৰিব।",
    button: "ৰুকো ইনষ্টল কৰক",
    iosStep1: "তলৰ শ্বেয়াৰ বুটাম টিপক",
    iosStep2: "“Add to Home Screen” বাছনি কৰক",
    shared: "স্ক্ৰীণশ্বট পালোঁ। পৰীক্ষা কৰি আছোঁ।",
  },
  mai: {
    title: "रुको केँ फोन पर राखू",
    body: "होम स्क्रीन पर आइकॉन आबि जाएत, आ स्क्रीनशॉट सोझे रुको मे पठा सकब।",
    button: "रुको इंस्टॉल करू",
    iosStep1: "नीचाँ शेयर बटन दाबू",
    iosStep2: "“Add to Home Screen” चुनू",
    shared: "स्क्रीनशॉट भेटल। जाँचि रहल छी।",
  },
  ne: {
    title: "रुकोलाई फोनमा राख्नुहोस्",
    body: "होम स्क्रिनमा आइकन आउँछ, र स्क्रिनसट सिधै रुकोमा पठाउन सकिन्छ।",
    button: "रुको इन्स्टल गर्नुहोस्",
    iosStep1: "तलको सेयर बटन थिच्नुहोस्",
    iosStep2: "“Add to Home Screen” छान्नुहोस्",
    shared: "स्क्रिनसट प्राप्त भयो। जाँच्दै छौँ।",
  },
};

export function installFor(language: Language): InstallStrings {
  return dictionaries[language] ?? dictionaries.en;
}
