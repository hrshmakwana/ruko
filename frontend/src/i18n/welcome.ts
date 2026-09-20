import type { Language } from "../types";

/** The door.
 *
 * Three ways in, and they are not the same product:
 *
 *   Guardian  the phone being protected. Signs in with the family code, and
 *             gets call watching, the panic button and the family alerts.
 *   Admin     the family member who watches. Signs in with an email, and gets
 *             the dashboard where alerts land and STOP is sent.
 *   Skip      no account at all. Checking a message, a screenshot, a number or
 *             an app file needs nobody's permission and asks for nothing.
 *
 * Anything that reaches *another person's phone* needs an account, because
 * there is a second human on the other end of it.
 */
export interface WelcomeStrings {
  title: string;
  skip: string;
  lockedTitle: string;
  lockedBody: string;
  signIn: string;
  guestLabel: string;
}

const dictionaries: Record<Language, WelcomeStrings> = {
  en: {
    title: "Who is using this phone?",
    skip: "Skip for now",
    lockedTitle: "Sign in to use this",
    lockedBody: "Checking works without an account. Live call watching, the panic button and family alerts need one, because they reach another person's phone.",
    signIn: "Sign in",
    guestLabel: "Just checking, no account",
  },
  hi: {
    title: "यह फ़ोन कौन चला रहा है?",
    skip: "अभी छोड़ें",
    lockedTitle: "इसके लिए साइन इन करें",
    lockedBody: "जाँच बिना खाते के चलती है। लाइव कॉल, पैनिक बटन और परिवार अलर्ट के लिए खाता चाहिए, क्योंकि वे दूसरे के फ़ोन तक पहुँचते हैं।",
    signIn: "साइन इन",
    guestLabel: "सिर्फ़ जाँच, कोई खाता नहीं",
  },
  bn: {
    title: "এই ফোন কে ব্যবহার করছেন?",
    skip: "আপাতত বাদ দিন",
    lockedTitle: "এটি ব্যবহার করতে সাইন ইন করুন",
    lockedBody: "যাচাই অ্যাকাউন্ট ছাড়াই চলে। লাইভ কল, প্যানিক বোতাম আর পরিবার অ্যালার্টের জন্য অ্যাকাউন্ট লাগে, কারণ সেগুলো অন্যের ফোনে পৌঁছায়।",
    signIn: "সাইন ইন",
    guestLabel: "শুধু যাচাই, অ্যাকাউন্ট নয়",
  },
  mr: {
    title: "हा फोन कोण वापरत आहे?",
    skip: "आत्तासाठी वगळा",
    lockedTitle: "हे वापरण्यासाठी साइन इन करा",
    lockedBody: "तपासणी खात्याशिवाय चालते. लाइव्ह कॉल, पॅनिक बटण आणि कुटुंब अलर्टसाठी खाते लागते, कारण ते दुसऱ्याच्या फोनपर्यंत पोहोचतात.",
    signIn: "साइन इन",
    guestLabel: "फक्त तपासणी, खाते नाही",
  },
  te: {
    title: "ఈ ఫోన్ ఎవరు వాడుతున్నారు?",
    skip: "ప్రస్తుతానికి దాటవేయి",
    lockedTitle: "దీని కోసం సైన్ ఇన్ చేయండి",
    lockedBody: "తనిఖీ ఖాతా లేకుండా పనిచేస్తుంది. లైవ్ కాల్, పానిక్ బటన్, కుటుంబ హెచ్చరికలకు ఖాతా కావాలి, అవి వేరొకరి ఫోన్‌కు చేరతాయి కాబట్టి.",
    signIn: "సైన్ ఇన్",
    guestLabel: "తనిఖీ మాత్రమే, ఖాతా వద్దు",
  },
  ta: {
    title: "இந்த தொலைபேசியை யார் பயன்படுத்துகிறார்?",
    skip: "இப்போதைக்கு தவிர்",
    lockedTitle: "இதற்கு உள்நுழையவும்",
    lockedBody: "சரிபார்ப்பு கணக்கு இல்லாமல் வேலை செய்யும். நேரடி அழைப்பு, அவசர பொத்தான், குடும்ப எச்சரிக்கைக்கு கணக்கு தேவை — அவை இன்னொருவர் தொலைபேசியை அடைகின்றன.",
    signIn: "உள்நுழை",
    guestLabel: "சரிபார்ப்பு மட்டும், கணக்கு இல்லை",
  },
  gu: {
    title: "આ ફોન કોણ વાપરે છે?",
    skip: "હમણાં રહેવા દો",
    lockedTitle: "આ વાપરવા સાઇન ઇન કરો",
    lockedBody: "તપાસ ખાતા વગર ચાલે છે. લાઇવ કૉલ, પેનિક બટન અને પરિવાર અલર્ટ માટે ખાતું જોઈએ, કારણ કે તે બીજાના ફોન સુધી પહોંચે છે.",
    signIn: "સાઇન ઇન",
    guestLabel: "ફક્ત તપાસ, ખાતું નહીં",
  },
  ur: {
    title: "یہ فون کون استعمال کر رہا ہے؟",
    skip: "ابھی چھوڑ دیں",
    lockedTitle: "اس کے لیے سائن ان کریں",
    lockedBody: "جانچ بغیر اکاؤنٹ کے چلتی ہے۔ لائیو کال، پینک بٹن اور خاندانی الرٹ کے لیے اکاؤنٹ چاہیے، کیونکہ وہ کسی اور کے فون تک پہنچتے ہیں۔",
    signIn: "سائن ان",
    guestLabel: "صرف جانچ، اکاؤنٹ نہیں",
  },
  kn: {
    title: "ಈ ಫೋನ್ ಯಾರು ಬಳಸುತ್ತಿದ್ದಾರೆ?",
    skip: "ಸದ್ಯಕ್ಕೆ ಬಿಟ್ಟುಬಿಡಿ",
    lockedTitle: "ಇದಕ್ಕೆ ಸೈನ್ ಇನ್ ಮಾಡಿ",
    lockedBody: "ಪರಿಶೀಲನೆ ಖಾತೆ ಇಲ್ಲದೆ ನಡೆಯುತ್ತದೆ. ಲೈವ್ ಕರೆ, ಪ್ಯಾನಿಕ್ ಬಟನ್ ಮತ್ತು ಕುಟುಂಬ ಎಚ್ಚರಿಕೆಗೆ ಖಾತೆ ಬೇಕು, ಅವು ಬೇರೆಯವರ ಫೋನ್ ತಲುಪುತ್ತವೆ.",
    signIn: "ಸೈನ್ ಇನ್",
    guestLabel: "ಪರಿಶೀಲನೆ ಮಾತ್ರ, ಖಾತೆ ಇಲ್ಲ",
  },
  or: {
    title: "ଏହି ଫୋନ କିଏ ବ୍ୟବହାର କରୁଛନ୍ତି?",
    skip: "ବର୍ତ୍ତମାନ ଛାଡ଼ନ୍ତୁ",
    lockedTitle: "ଏଥିପାଇଁ ସାଇନ ଇନ କରନ୍ତୁ",
    lockedBody: "ଯାଞ୍ଚ ଖାତା ବିନା ଚାଲେ। ଲାଇଭ କଲ, ପାନିକ ବଟନ ଓ ପରିବାର ଆଲର୍ଟ ପାଇଁ ଖାତା ଦରକାର, କାରଣ ସେଗୁଡ଼ିକ ଅନ୍ୟର ଫୋନକୁ ଯାଏ।",
    signIn: "ସାଇନ ଇନ",
    guestLabel: "କେବଳ ଯାଞ୍ଚ, ଖାତା ନୁହେଁ",
  },
  ml: {
    title: "ഈ ഫോൺ ആരാണ് ഉപയോഗിക്കുന്നത്?",
    skip: "തൽക്കാലം ഒഴിവാക്കൂ",
    lockedTitle: "ഇതിനായി സൈൻ ഇൻ ചെയ്യൂ",
    lockedBody: "പരിശോധന അക്കൗണ്ട് ഇല്ലാതെ പ്രവർത്തിക്കും. ലൈവ് കോൾ, പാനിക് ബട്ടൺ, കുടുംബ അറിയിപ്പ് എന്നിവയ്ക്ക് അക്കൗണ്ട് വേണം — അവ മറ്റൊരാളുടെ ഫോണിൽ എത്തുന്നു.",
    signIn: "സൈൻ ഇൻ",
    guestLabel: "പരിശോധന മാത്രം, അക്കൗണ്ട് വേണ്ട",
  },
  pa: {
    title: "ਇਹ ਫ਼ੋਨ ਕੌਣ ਵਰਤ ਰਿਹਾ ਹੈ?",
    skip: "ਹੁਣੇ ਛੱਡੋ",
    lockedTitle: "ਇਸ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ",
    lockedBody: "ਜਾਂਚ ਖਾਤੇ ਤੋਂ ਬਿਨਾਂ ਚੱਲਦੀ ਹੈ। ਲਾਈਵ ਕਾਲ, ਪੈਨਿਕ ਬਟਨ ਅਤੇ ਪਰਿਵਾਰ ਅਲਰਟ ਲਈ ਖਾਤਾ ਚਾਹੀਦਾ ਹੈ, ਕਿਉਂਕਿ ਉਹ ਕਿਸੇ ਹੋਰ ਦੇ ਫ਼ੋਨ ਤੱਕ ਪਹੁੰਚਦੇ ਹਨ।",
    signIn: "ਸਾਈਨ ਇਨ",
    guestLabel: "ਸਿਰਫ਼ ਜਾਂਚ, ਖਾਤਾ ਨਹੀਂ",
  },
  as: {
    title: "এই ফোনটো কোনে ব্যৱহাৰ কৰিছে?",
    skip: "এতিয়াৰ বাবে বাদ দিয়ক",
    lockedTitle: "ইয়াৰ বাবে ছাইন ইন কৰক",
    lockedBody: "পৰীক্ষা একাউণ্ট অবিহনে চলে। লাইভ কল, পেনিক বুটাম আৰু পৰিয়াল সতৰ্কবাণীৰ বাবে একাউণ্ট লাগে, কাৰণ সেইবোৰ আন এজনৰ ফোনলৈ যায়।",
    signIn: "ছাইন ইন",
    guestLabel: "কেৱল পৰীক্ষা, একাউণ্ট নালাগে",
  },
  mai: {
    title: "ई फोन के चलबैत अछि?",
    skip: "एखन छोड़ू",
    lockedTitle: "एहि लेल साइन इन करू",
    lockedBody: "जाँच बिना खाताक चलैत अछि। लाइव कॉल, पैनिक बटन आ परिवार अलर्ट लेल खाता चाही, कारण ओ दोसरक फोन धरि पहुँचैत अछि।",
    signIn: "साइन इन",
    guestLabel: "खाली जाँच, खाता नहि",
  },
  ne: {
    title: "यो फोन कसले चलाउँदै छ?",
    skip: "अहिलेलाई छोड्नुहोस्",
    lockedTitle: "यसका लागि साइन इन गर्नुहोस्",
    lockedBody: "जाँच खाता बिना चल्छ। लाइभ कल, प्यानिक बटन र परिवार अलर्टका लागि खाता चाहिन्छ, किनकि ती अर्काको फोनसम्म पुग्छन्।",
    signIn: "साइन इन",
    guestLabel: "जाँच मात्र, खाता होइन",
  },
};

export function welcomeFor(language: Language): WelcomeStrings {
  return dictionaries[language] ?? dictionaries.en;
}
