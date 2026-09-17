import type { Language } from "../types";

/** Lookup mode: check a bare number, UPI ID or website before calling back.
 *
 * The honest framing matters more here than anywhere else in the app. A number
 * with no reports is not a safe number — it may simply be new. So the empty
 * result never says "safe"; it says "no reports yet" and repeats the one rule
 * that always holds: only call numbers you got from the card or the official
 * website.
 */
export interface LookupStrings {
  modeMessage: string;
  modeLookup: string;
  heading: string;
  sub: string;
  placeholder: string;
  button: string;
  checking: string;
  reported: (n: number) => string;
  reportedAdvice: string;
  noReports: string;
  noReportsAdvice: string;
  nothingFound: string;
  report: string;
  reportedThanks: string;
}

const dictionaries: Record<Language, LookupStrings> = {
  en: {
    modeMessage: "Message",
    modeLookup: "Number or UPI",
    heading: "Before you call back or pay",
    sub: "Check a phone number, UPI ID or website against what other people have reported.",
    placeholder: "98765 43210 or name@upi",
    button: "Look it up",
    checking: "Looking it up…",
    reported: (n) => `Reported ${n} ${n === 1 ? "time" : "times"} by other people`,
    reportedAdvice: "Do not call back, do not pay, and do not share any code.",
    noReports: "No reports yet",
    noReportsAdvice:
      "That does not make it safe — it may just be new. Only call numbers printed on your card or on the official website.",
    nothingFound: "That does not look like a phone number, UPI ID or website.",
    report: "Report this as a scam",
    reportedThanks: "Reported — thank you",
  },
  hi: {
    modeMessage: "संदेश",
    modeLookup: "नंबर या UPI",
    heading: "वापस फ़ोन करने या पैसे भेजने से पहले",
    sub: "कोई फ़ोन नंबर, UPI ID या वेबसाइट जाँचें कि दूसरों ने उसकी शिकायत की है या नहीं।",
    placeholder: "98765 43210 या name@upi",
    button: "जाँचें",
    checking: "जाँच हो रही है…",
    reported: (n) => `दूसरे लोगों ने ${n} बार रिपोर्ट किया है`,
    reportedAdvice: "वापस फ़ोन न करें, पैसे न भेजें, और कोई कोड न बताएं।",
    noReports: "अभी तक कोई रिपोर्ट नहीं",
    noReportsAdvice:
      "इसका मतलब यह सुरक्षित नहीं है — हो सकता है यह नया हो। सिर्फ़ अपने कार्ड या आधिकारिक वेबसाइट पर लिखे नंबर पर ही फ़ोन करें।",
    nothingFound: "यह फ़ोन नंबर, UPI ID या वेबसाइट जैसा नहीं लगता।",
    report: "इसे धोखा बताएं",
    reportedThanks: "धन्यवाद — दर्ज कर लिया",
  },
  bn: {
    modeMessage: "বার্তা",
    modeLookup: "নম্বর বা UPI",
    heading: "ফোন ফেরত করার বা টাকা পাঠানোর আগে",
    sub: "কোনও ফোন নম্বর, UPI ID বা ওয়েবসাইট অন্যরা রিপোর্ট করেছেন কি না যাচাই করুন।",
    placeholder: "98765 43210 বা name@upi",
    button: "খুঁজে দেখুন",
    checking: "খোঁজা হচ্ছে…",
    reported: (n) => `অন্যরা ${n} বার রিপোর্ট করেছেন`,
    reportedAdvice: "ফোন ফেরত করবেন না, টাকা পাঠাবেন না, কোনও কোড জানাবেন না।",
    noReports: "এখনও কোনও রিপোর্ট নেই",
    noReportsAdvice:
      "তাতে এটি নিরাপদ নয় — হয়তো নতুন। শুধু আপনার কার্ডে বা সরকারি ওয়েবসাইটে লেখা নম্বরে ফোন করুন।",
    nothingFound: "এটি ফোন নম্বর, UPI ID বা ওয়েবসাইটের মতো দেখাচ্ছে না।",
    report: "এটিকে প্রতারণা বলে জানান",
    reportedThanks: "ধন্যবাদ — নথিভুক্ত হয়েছে",
  },
  mr: {
    modeMessage: "संदेश",
    modeLookup: "नंबर किंवा UPI",
    heading: "परत फोन करण्यापूर्वी किंवा पैसे पाठवण्यापूर्वी",
    sub: "एखादा फोन नंबर, UPI ID किंवा वेबसाइट इतरांनी कळवली आहे का ते तपासा.",
    placeholder: "98765 43210 किंवा name@upi",
    button: "तपासा",
    checking: "तपासत आहोत…",
    reported: (n) => `इतरांनी ${n} वेळा कळवले आहे`,
    reportedAdvice: "परत फोन करू नका, पैसे पाठवू नका आणि कोणताही कोड सांगू नका.",
    noReports: "अजून कोणतीही तक्रार नाही",
    noReportsAdvice:
      "म्हणजे ते सुरक्षित आहे असे नाही — कदाचित नवीन असेल. फक्त तुमच्या कार्डवरील किंवा अधिकृत वेबसाइटवरील नंबरवर फोन करा.",
    nothingFound: "हा फोन नंबर, UPI ID किंवा वेबसाइटसारखा दिसत नाही.",
    report: "फसवणूक म्हणून कळवा",
    reportedThanks: "धन्यवाद — नोंद झाली",
  },
  te: {
    modeMessage: "సందేశం",
    modeLookup: "నంబర్ లేదా UPI",
    heading: "తిరిగి ఫోన్ చేసే ముందు లేదా డబ్బు పంపే ముందు",
    sub: "ఫోన్ నంబర్, UPI ID లేదా వెబ్‌సైట్‌పై ఇతరులు ఫిర్యాదు చేశారేమో పరిశీలించండి.",
    placeholder: "98765 43210 లేదా name@upi",
    button: "చూడండి",
    checking: "చూస్తున్నాం…",
    reported: (n) => `ఇతరులు ${n} సార్లు ఫిర్యాదు చేశారు`,
    reportedAdvice: "తిరిగి ఫోన్ చేయవద్దు, డబ్బు పంపవద్దు, ఏ కోడ్ చెప్పవద్దు.",
    noReports: "ఇంకా ఫిర్యాదులు లేవు",
    noReportsAdvice:
      "అంటే ఇది సురక్షితమని కాదు — కొత్తది కావచ్చు. మీ కార్డ్ మీద లేదా అధికారిక వెబ్‌సైట్‌లో ఉన్న నంబర్‌కే ఫోన్ చేయండి.",
    nothingFound: "ఇది ఫోన్ నంబర్, UPI ID లేదా వెబ్‌సైట్‌లా కనిపించడం లేదు.",
    report: "దీన్ని మోసంగా తెలియజేయండి",
    reportedThanks: "ధన్యవాదాలు — నమోదైంది",
  },
  ta: {
    modeMessage: "செய்தி",
    modeLookup: "எண் அல்லது UPI",
    heading: "திரும்ப அழைக்கும் முன் அல்லது பணம் அனுப்பும் முன்",
    sub: "ஒரு தொலைபேசி எண், UPI ID அல்லது இணையதளத்தை மற்றவர்கள் புகார் அளித்துள்ளார்களா என்று பாருங்கள்.",
    placeholder: "98765 43210 அல்லது name@upi",
    button: "தேடுங்கள்",
    checking: "தேடுகிறோம்…",
    reported: (n) => `மற்றவர்கள் ${n} முறை புகார் அளித்துள்ளனர்`,
    reportedAdvice: "திரும்ப அழைக்காதீர்கள், பணம் அனுப்பாதீர்கள், எந்தக் குறியீட்டையும் சொல்லாதீர்கள்.",
    noReports: "இதுவரை புகார்கள் இல்லை",
    noReportsAdvice:
      "அதனால் இது பாதுகாப்பானது என்று அர்த்தமில்லை — புதியதாக இருக்கலாம். உங்கள் அட்டையில் அல்லது அதிகாரப்பூர்வ இணையதளத்தில் உள்ள எண்ணை மட்டும் அழையுங்கள்.",
    nothingFound: "இது தொலைபேசி எண், UPI ID அல்லது இணையதளம் போலத் தெரியவில்லை.",
    report: "இதை மோசடி என்று தெரிவியுங்கள்",
    reportedThanks: "நன்றி — பதிவு செய்யப்பட்டது",
  },
  gu: {
    modeMessage: "સંદેશ",
    modeLookup: "નંબર કે UPI",
    heading: "સામે ફોન કરતાં કે પૈસા મોકલતાં પહેલાં",
    sub: "કોઈ ફોન નંબર, UPI ID કે વેબસાઇટ બીજાઓએ રિપોર્ટ કરી છે કે નહીં તે તપાસો.",
    placeholder: "98765 43210 અથવા name@upi",
    button: "તપાસો",
    checking: "તપાસી રહ્યા છીએ…",
    reported: (n) => `બીજા લોકોએ ${n} વાર રિપોર્ટ કર્યું છે`,
    reportedAdvice: "સામે ફોન ન કરો, પૈસા ન મોકલો અને કોઈ કોડ ન કહો.",
    noReports: "હજી કોઈ રિપોર્ટ નથી",
    noReportsAdvice:
      "એનો અર્થ એ નથી કે તે સલામત છે — કદાચ નવો હોય. ફક્ત તમારા કાર્ડ પર કે સત્તાવાર વેબસાઇટ પર લખેલા નંબર પર જ ફોન કરો.",
    nothingFound: "આ ફોન નંબર, UPI ID કે વેબસાઇટ જેવું લાગતું નથી.",
    report: "આને છેતરપિંડી તરીકે જણાવો",
    reportedThanks: "આભાર — નોંધી લીધું",
  },
  ur: {
    modeMessage: "پیغام",
    modeLookup: "نمبر یا UPI",
    heading: "واپس فون کرنے یا پیسے بھیجنے سے پہلے",
    sub: "کوئی فون نمبر، UPI ID یا ویب سائٹ جانچیں کہ دوسروں نے اس کی شکایت کی ہے یا نہیں۔",
    placeholder: "98765 43210 یا name@upi",
    button: "جانچیں",
    checking: "جانچ ہو رہی ہے…",
    reported: (n) => `دوسرے لوگوں نے ${n} بار رپورٹ کیا ہے`,
    reportedAdvice: "واپس فون نہ کریں، پیسے نہ بھیجیں، اور کوئی کوڈ نہ بتائیں۔",
    noReports: "ابھی تک کوئی رپورٹ نہیں",
    noReportsAdvice:
      "اس کا مطلب یہ نہیں کہ یہ محفوظ ہے — شاید نیا ہو۔ صرف اپنے کارڈ یا سرکاری ویب سائٹ پر لکھے نمبر پر ہی فون کریں۔",
    nothingFound: "یہ فون نمبر، UPI ID یا ویب سائٹ جیسا نہیں لگتا۔",
    report: "اسے فراڈ کے طور پر بتائیں",
    reportedThanks: "شکریہ — درج کر لیا",
  },
  kn: {
    modeMessage: "ಸಂದೇಶ",
    modeLookup: "ನಂಬರ್ ಅಥವಾ UPI",
    heading: "ವಾಪಸ್ ಕರೆ ಮಾಡುವ ಅಥವಾ ಹಣ ಕಳಿಸುವ ಮೊದಲು",
    sub: "ಫೋನ್ ನಂಬರ್, UPI ID ಅಥವಾ ವೆಬ್‌ಸೈಟ್ ಬಗ್ಗೆ ಇತರರು ದೂರು ನೀಡಿದ್ದಾರೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.",
    placeholder: "98765 43210 ಅಥವಾ name@upi",
    button: "ಹುಡುಕಿ",
    checking: "ಹುಡುಕುತ್ತಿದ್ದೇವೆ…",
    reported: (n) => `ಇತರರು ${n} ಬಾರಿ ದೂರು ನೀಡಿದ್ದಾರೆ`,
    reportedAdvice: "ವಾಪಸ್ ಕರೆ ಮಾಡಬೇಡಿ, ಹಣ ಕಳಿಸಬೇಡಿ, ಯಾವ ಕೋಡ್ ಕೂಡ ಹೇಳಬೇಡಿ.",
    noReports: "ಇನ್ನೂ ಯಾವುದೇ ದೂರು ಇಲ್ಲ",
    noReportsAdvice:
      "ಅದರರ್ಥ ಇದು ಸುರಕ್ಷಿತ ಎಂದಲ್ಲ — ಹೊಸದಿರಬಹುದು. ನಿಮ್ಮ ಕಾರ್ಡ್ ಅಥವಾ ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿರುವ ನಂಬರ್‌ಗೆ ಮಾತ್ರ ಕರೆ ಮಾಡಿ.",
    nothingFound: "ಇದು ಫೋನ್ ನಂಬರ್, UPI ID ಅಥವಾ ವೆಬ್‌ಸೈಟ್‌ನಂತೆ ಕಾಣುತ್ತಿಲ್ಲ.",
    report: "ಇದನ್ನು ಮೋಸವೆಂದು ತಿಳಿಸಿ",
    reportedThanks: "ಧನ್ಯವಾದ — ದಾಖಲಾಗಿದೆ",
  },
  or: {
    modeMessage: "ସନ୍ଦେଶ",
    modeLookup: "ନମ୍ବର କିମ୍ବା UPI",
    heading: "ଫେରି ଫୋନ କରିବା କିମ୍ବା ଟଙ୍କା ପଠାଇବା ପୂର୍ବରୁ",
    sub: "କୌଣସି ଫୋନ ନମ୍ବର, UPI ID କିମ୍ବା ୱେବସାଇଟ ବିଷୟରେ ଅନ୍ୟମାନେ ଅଭିଯୋଗ କରିଛନ୍ତି କି ନାହିଁ ଯାଞ୍ଚ କରନ୍ତୁ।",
    placeholder: "98765 43210 କିମ୍ବା name@upi",
    button: "ଖୋଜନ୍ତୁ",
    checking: "ଖୋଜାଯାଉଛି…",
    reported: (n) => `ଅନ୍ୟମାନେ ${n} ଥର ରିପୋର୍ଟ କରିଛନ୍ତି`,
    reportedAdvice: "ଫେରି ଫୋନ କରନ୍ତୁ ନାହିଁ, ଟଙ୍କା ପଠାନ୍ତୁ ନାହିଁ, କୌଣସି କୋଡ କୁହନ୍ତୁ ନାହିଁ।",
    noReports: "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ରିପୋର୍ଟ ନାହିଁ",
    noReportsAdvice:
      "ଏହାର ଅର୍ଥ ଏହା ନିରାପଦ ନୁହେଁ — ହୁଏତ ନୂଆ। କେବଳ ଆପଣଙ୍କ କାର୍ଡ କିମ୍ବା ସରକାରୀ ୱେବସାଇଟରେ ଥିବା ନମ୍ବରକୁ ଫୋନ କରନ୍ତୁ।",
    nothingFound: "ଏହା ଫୋନ ନମ୍ବର, UPI ID କିମ୍ବା ୱେବସାଇଟ ପରି ଲାଗୁନାହିଁ।",
    report: "ଏହାକୁ ଠକାମି ବୋଲି ଜଣାନ୍ତୁ",
    reportedThanks: "ଧନ୍ୟବାଦ — ନଥିଭୁକ୍ତ ହେଲା",
  },
  ml: {
    modeMessage: "സന്ദേശം",
    modeLookup: "നമ്പർ അല്ലെങ്കിൽ UPI",
    heading: "തിരികെ വിളിക്കുന്നതിനോ പണം അയയ്ക്കുന്നതിനോ മുൻപ്",
    sub: "ഒരു ഫോൺ നമ്പർ, UPI ID അല്ലെങ്കിൽ വെബ്സൈറ്റിനെക്കുറിച്ച് മറ്റുള്ളവർ പരാതിപ്പെട്ടിട്ടുണ്ടോ എന്ന് പരിശോധിക്കുക.",
    placeholder: "98765 43210 അല്ലെങ്കിൽ name@upi",
    button: "തിരയുക",
    checking: "തിരയുന്നു…",
    reported: (n) => `മറ്റുള്ളവർ ${n} തവണ റിപ്പോർട്ട് ചെയ്തു`,
    reportedAdvice: "തിരികെ വിളിക്കരുത്, പണം അയയ്ക്കരുത്, ഒരു കോഡും പറയരുത്.",
    noReports: "ഇതുവരെ റിപ്പോർട്ടുകളില്ല",
    noReportsAdvice:
      "അതുകൊണ്ട് ഇത് സുരക്ഷിതമാണെന്നല്ല — പുതിയതാകാം. നിങ്ങളുടെ കാർഡിലോ ഔദ്യോഗിക വെബ്സൈറ്റിലോ ഉള്ള നമ്പറിൽ മാത്രം വിളിക്കുക.",
    nothingFound: "ഇത് ഒരു ഫോൺ നമ്പർ, UPI ID അല്ലെങ്കിൽ വെബ്സൈറ്റ് പോലെ തോന്നുന്നില്ല.",
    report: "ഇത് തട്ടിപ്പായി അറിയിക്കുക",
    reportedThanks: "നന്ദി — രേഖപ്പെടുത്തി",
  },
  pa: {
    modeMessage: "ਸੁਨੇਹਾ",
    modeLookup: "ਨੰਬਰ ਜਾਂ UPI",
    heading: "ਵਾਪਸ ਫ਼ੋਨ ਕਰਨ ਜਾਂ ਪੈਸੇ ਭੇਜਣ ਤੋਂ ਪਹਿਲਾਂ",
    sub: "ਕੋਈ ਫ਼ੋਨ ਨੰਬਰ, UPI ID ਜਾਂ ਵੈੱਬਸਾਈਟ ਜਾਂਚੋ ਕਿ ਹੋਰਾਂ ਨੇ ਇਸਦੀ ਸ਼ਿਕਾਇਤ ਕੀਤੀ ਹੈ ਜਾਂ ਨਹੀਂ।",
    placeholder: "98765 43210 ਜਾਂ name@upi",
    button: "ਜਾਂਚੋ",
    checking: "ਜਾਂਚ ਹੋ ਰਹੀ ਹੈ…",
    reported: (n) => `ਹੋਰ ਲੋਕਾਂ ਨੇ ${n} ਵਾਰ ਰਿਪੋਰਟ ਕੀਤਾ ਹੈ`,
    reportedAdvice: "ਵਾਪਸ ਫ਼ੋਨ ਨਾ ਕਰੋ, ਪੈਸੇ ਨਾ ਭੇਜੋ, ਅਤੇ ਕੋਈ ਕੋਡ ਨਾ ਦੱਸੋ।",
    noReports: "ਅਜੇ ਤੱਕ ਕੋਈ ਰਿਪੋਰਟ ਨਹੀਂ",
    noReportsAdvice:
      "ਇਸਦਾ ਮਤਲਬ ਇਹ ਸੁਰੱਖਿਅਤ ਨਹੀਂ — ਸ਼ਾਇਦ ਨਵਾਂ ਹੋਵੇ। ਸਿਰਫ਼ ਆਪਣੇ ਕਾਰਡ ਜਾਂ ਸਰਕਾਰੀ ਵੈੱਬਸਾਈਟ 'ਤੇ ਲਿਖੇ ਨੰਬਰ 'ਤੇ ਹੀ ਫ਼ੋਨ ਕਰੋ।",
    nothingFound: "ਇਹ ਫ਼ੋਨ ਨੰਬਰ, UPI ID ਜਾਂ ਵੈੱਬਸਾਈਟ ਵਰਗਾ ਨਹੀਂ ਲੱਗਦਾ।",
    report: "ਇਸਨੂੰ ਠੱਗੀ ਵਜੋਂ ਦੱਸੋ",
    reportedThanks: "ਧੰਨਵਾਦ — ਦਰਜ ਕਰ ਲਿਆ",
  },
  as: {
    modeMessage: "বাৰ্তা",
    modeLookup: "নম্বৰ বা UPI",
    heading: "ঘূৰাই ফোন কৰা বা টকা পঠোৱাৰ আগতে",
    sub: "কোনো ফোন নম্বৰ, UPI ID বা ৱেবচাইটৰ বিষয়ে আনে অভিযোগ কৰিছে নে নাই পৰীক্ষা কৰক।",
    placeholder: "98765 43210 বা name@upi",
    button: "বিচাৰক",
    checking: "বিচাৰি আছোঁ…",
    reported: (n) => `আনে ${n} বাৰ ৰিপৰ্ট কৰিছে`,
    reportedAdvice: "ঘূৰাই ফোন নকৰিব, টকা নপঠিয়াব, আৰু কোনো ক'ড নক'ব।",
    noReports: "এতিয়ালৈকে কোনো ৰিপৰ্ট নাই",
    noReportsAdvice:
      "তাৰ অৰ্থ এইটো নিৰাপদ নহয় — হয়তো নতুন। কেৱল আপোনাৰ কাৰ্ড বা চৰকাৰী ৱেবচাইটত থকা নম্বৰতহে ফোন কৰক।",
    nothingFound: "এইটো ফোন নম্বৰ, UPI ID বা ৱেবচাইটৰ দৰে নেদেখি।",
    report: "ইয়াক প্ৰতাৰণা বুলি জনাওক",
    reportedThanks: "ধন্যবাদ — লিপিবদ্ধ হ'ল",
  },
  mai: {
    modeMessage: "संदेश",
    modeLookup: "नंबर वा UPI",
    heading: "घुरि क' फोन करबा वा पाइ पठेबा सँ पहिने",
    sub: "कोनो फोन नंबर, UPI ID वा वेबसाइट जाँचू जे आन लोक ओकर शिकायत कयने छथि वा नहि।",
    placeholder: "98765 43210 वा name@upi",
    button: "जाँचू",
    checking: "जाँच भ' रहल अछि…",
    reported: (n) => `आन लोक ${n} बेर रिपोर्ट कयलनि अछि`,
    reportedAdvice: "घुरि क' फोन नहि करू, पाइ नहि पठाउ, आ कोनो कोड नहि कहू।",
    noReports: "एखन धरि कोनो रिपोर्ट नहि",
    noReportsAdvice:
      "एकर मतलब ई सुरक्षित नहि अछि — भ' सकैत अछि नव हो। खाली अपन कार्ड वा आधिकारिक वेबसाइट पर लिखल नंबर पर फोन करू।",
    nothingFound: "ई फोन नंबर, UPI ID वा वेबसाइट जकाँ नहि लगैत अछि।",
    report: "एकरा ठकी कहि रिपोर्ट करू",
    reportedThanks: "धन्यवाद — दर्ज भ' गेल",
  },
  ne: {
    modeMessage: "सन्देश",
    modeLookup: "नम्बर वा UPI",
    heading: "फिर्ता फोन गर्नु वा पैसा पठाउनु अघि",
    sub: "कुनै फोन नम्बर, UPI ID वा वेबसाइटबारे अरूले उजुरी गरेका छन् कि छैनन् जाँच्नुहोस्।",
    placeholder: "98765 43210 वा name@upi",
    button: "खोज्नुहोस्",
    checking: "खोज्दै छौं…",
    reported: (n) => `अरूले ${n} पटक रिपोर्ट गरेका छन्`,
    reportedAdvice: "फिर्ता फोन नगर्नुहोस्, पैसा नपठाउनुहोस्, कुनै कोड नभन्नुहोस्।",
    noReports: "अहिलेसम्म कुनै रिपोर्ट छैन",
    noReportsAdvice:
      "यसको अर्थ यो सुरक्षित छ भन्ने होइन — नयाँ पनि हुन सक्छ। आफ्नो कार्ड वा आधिकारिक वेबसाइटमा लेखिएको नम्बरमा मात्र फोन गर्नुहोस्।",
    nothingFound: "यो फोन नम्बर, UPI ID वा वेबसाइटजस्तो देखिँदैन।",
    report: "यसलाई ठगी भनी रिपोर्ट गर्नुहोस्",
    reportedThanks: "धन्यवाद — दर्ता भयो",
  },
};

export function lookupFor(language: Language): LookupStrings {
  return dictionaries[language] ?? dictionaries.en;
}
