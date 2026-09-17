import type { Language } from "../types";

/** Landing-page copy. Kept in one file because it is short and it helps to read
 *  the three languages side by side — they have to make the same promise. */
export interface LandingStrings {
  heroKicker: string;
  heroTitle: string;
  heroBody: string;
  heroCta: string;
  heroNote: string;

  doesTitle: string;
  does: { title: string; body: string }[];

  howTitle: string;
  how: { title: string; body: string }[];

  typesTitle: string;
  typesBody: string;

  privacyTitle: string;
  privacyPoints: string[];

  openApp: string;
}

const en: LandingStrings = {
  heroKicker: "Ruko means stop",
  heroTitle: "Before you pay, click, or call back — ask Ruko.",
  heroBody:
    "Paste a message, a link, a UPI ID, or upload a screenshot. Ruko tells you whether it is a scam, shows you exactly which words gave it away, and tells you what to do next — in English, Hindi or Gujarati.",
  heroCta: "Check a message",
  heroNote: "No account. No OTP. Nothing to install.",

  doesTitle: "Three things, when they matter",
  does: [
    {
      title: "Before you act",
      body: "A clear verdict with the scam words marked in the message itself, not a score you have to interpret.",
    },
    {
      title: "What they are actually after",
      body: "The scammer's plan laid out step by step, ending where it always ends — and the words to say if they ring back.",
    },
    {
      title: "If you already paid",
      body: "The golden hour: call 1930, file the complaint, block the card — with the complaint already written out for you to copy.",
    },
  ],

  howTitle: "How Ruko decides",
  how: [
    {
      title: "Fixed rules run first",
      body: "Lookalike bank domains, URL shorteners, .apk links, UPI collect traps, and known scam phrases in four languages.",
    },
    {
      title: "Then an AI reads it",
      body: "Amazon Nova on AWS Bedrock reads the message and the screenshot, and explains it in your language.",
    },
    {
      title: "Rules win ties",
      body: "The rules can raise the risk. The AI can never lower a rule's verdict — so a scam that hides instructions for the AI inside itself still gets flagged.",
    },
  ],

  typesTitle: "The scams Ruko knows",
  typesBody:
    "Digital arrest · Fake KYC · Electricity disconnection · Parcel and customs · UPI refund traps · Fake investments · Task and job scams · Lottery wins · Loan apps · Fake customer care · “Your relative is in trouble” · Blackmail",

  privacyTitle: "What Ruko never does",
  privacyPoints: [
    "Never asks for your OTP, PIN, password or any account detail.",
    "Never files a complaint on your behalf, and says so.",
    "Never stores your message. Screenshots are deleted within a day.",
    "Never says something is “safe” — the strongest thing it will say is “no scam signs”.",
  ],

  openApp: "Open Ruko",
};

const hi: LandingStrings = {
  heroKicker: "रुको यानी ठहरो",
  heroTitle: "पैसे भेजने, लिंक खोलने या कॉल वापस करने से पहले — रुको से पूछो।",
  heroBody:
    "कोई संदेश, लिंक या UPI ID चिपकाएँ, या स्क्रीनशॉट डालें। रुको बताएगा कि यह धोखा है या नहीं, कौन से शब्दों से पता चला, और अब आपको क्या करना चाहिए — हिंदी, गुजराती या अंग्रेज़ी में।",
  heroCta: "संदेश जाँचें",
  heroNote: "कोई खाता नहीं। कोई OTP नहीं। कुछ इंस्टॉल करने की ज़रूरत नहीं।",

  doesTitle: "तीन काम, ठीक सही समय पर",
  does: [
    {
      title: "कुछ करने से पहले",
      body: "साफ़ जवाब, और धोखे वाले शब्द उसी संदेश में निशान लगाकर — कोई पहेली जैसा स्कोर नहीं।",
    },
    {
      title: "वे असल में क्या चाहते हैं",
      body: "ठग की पूरी योजना कदम-दर-कदम, और अगर वे दोबारा फ़ोन करें तो क्या कहना है।",
    },
    {
      title: "अगर पैसे चले गए हों",
      body: "पहला घंटा: 1930 पर फ़ोन, शिकायत दर्ज, कार्ड बंद — और शिकायत पहले से लिखी हुई, बस कॉपी कर लीजिए।",
    },
  ],

  howTitle: "रुको फ़ैसला कैसे करता है",
  how: [
    {
      title: "पहले पक्के नियम",
      body: "बैंक जैसी दिखने वाली नकली वेबसाइट, छोटे किए हुए लिंक, .apk फ़ाइलें, UPI कलेक्ट का जाल, और चार भाषाओं के जाने-पहचाने ठगी वाले वाक्य।",
    },
    {
      title: "फिर AI पढ़ता है",
      body: "AWS Bedrock पर Amazon Nova संदेश और स्क्रीनशॉट पढ़ता है और आपकी भाषा में समझाता है।",
    },
    {
      title: "टकराव में नियम जीतते हैं",
      body: "नियम जोखिम बढ़ा सकते हैं। AI किसी नियम का फ़ैसला घटा नहीं सकता — इसलिए जिस संदेश में AI के लिए छिपे निर्देश हों, वह भी पकड़ा जाता है।",
    },
  ],

  typesTitle: "रुको इन ठगियों को पहचानता है",
  typesBody:
    "डिजिटल अरेस्ट · नकली KYC · बिजली कटने की धमकी · पार्सल और कस्टम · UPI रिफंड का जाल · नकली निवेश · टास्क और नौकरी · लॉटरी · लोन ऐप · नकली कस्टमर केयर · “आपका रिश्तेदार मुसीबत में है” · ब्लैकमेल",

  privacyTitle: "रुको यह कभी नहीं करता",
  privacyPoints: [
    "आपका OTP, PIN, पासवर्ड या खाते की कोई जानकारी कभी नहीं माँगता।",
    "आपकी ओर से शिकायत दर्ज नहीं करता, और यह साफ़ कहता है।",
    "आपका संदेश सहेजकर नहीं रखता। स्क्रीनशॉट एक दिन में मिटा दिए जाते हैं।",
    "कभी नहीं कहता कि कुछ “सुरक्षित” है — ज़्यादा से ज़्यादा इतना कि “धोखे के लक्षण नहीं मिले”।",
  ],

  openApp: "रुको खोलें",
};

const gu: LandingStrings = {
  heroKicker: "રુકો એટલે થોભો",
  heroTitle: "પૈસા મોકલતાં, લિંક ખોલતાં કે સામે ફોન કરતાં પહેલાં — રુકોને પૂછો.",
  heroBody:
    "કોઈ સંદેશ, લિંક કે UPI ID પેસ્ટ કરો, અથવા સ્ક્રીનશોટ મૂકો. રુકો કહેશે કે આ છેતરપિંડી છે કે નહીં, કયા શબ્દો પરથી ખબર પડી, અને હવે તમારે શું કરવું — ગુજરાતી, હિન્દી કે અંગ્રેજીમાં.",
  heroCta: "સંદેશ તપાસો",
  heroNote: "કોઈ ખાતું નહીં. કોઈ OTP નહીં. કંઈ ઇન્સ્ટોલ કરવાનું નહીં.",

  doesTitle: "ત્રણ કામ, બરાબર સાચા સમયે",
  does: [
    {
      title: "કંઈ કરતાં પહેલાં",
      body: "સ્પષ્ટ જવાબ, અને છેતરપિંડીના શબ્દો એ જ સંદેશમાં નિશાન કરીને — ઉકેલવો પડે એવો સ્કોર નહીં.",
    },
    {
      title: "તેઓ ખરેખર શું ઇચ્છે છે",
      body: "ઠગની આખી યોજના પગલું-દર-પગલું, અને ફરી ફોન કરે તો શું કહેવું તે પણ.",
    },
    {
      title: "જો પૈસા ગયા હોય",
      body: "પહેલો કલાક: 1930 પર ફોન, ફરિયાદ નોંધાવો, કાર્ડ બંધ કરાવો — અને ફરિયાદ પહેલેથી લખેલી, બસ કૉપી કરી લો.",
    },
  ],

  howTitle: "રુકો કેવી રીતે નક્કી કરે છે",
  how: [
    {
      title: "પહેલાં પાકા નિયમો",
      body: "બેંક જેવી દેખાતી નકલી વેબસાઇટ, ટૂંકી કરેલી લિંક, .apk ફાઇલો, UPI કલેક્ટનો ફાંદો, અને ચાર ભાષાના જાણીતા છેતરપિંડીના વાક્યો.",
    },
    {
      title: "પછી AI વાંચે છે",
      body: "AWS Bedrock પરનું Amazon Nova સંદેશ અને સ્ક્રીનશોટ વાંચે છે અને તમારી ભાષામાં સમજાવે છે.",
    },
    {
      title: "ટકરાવમાં નિયમો જીતે છે",
      body: "નિયમો જોખમ વધારી શકે છે. AI કોઈ નિયમનો ચુકાદો ઘટાડી શકતું નથી — એટલે જે સંદેશમાં AI માટે છુપા સૂચનો હોય તે પણ પકડાય છે.",
    },
  ],

  typesTitle: "રુકો આ છેતરપિંડીઓ ઓળખે છે",
  typesBody:
    "ડિજિટલ અરેસ્ટ · નકલી KYC · વીજળી કાપવાની ધમકી · પાર્સલ અને કસ્ટમ · UPI રિફંડનો ફાંદો · નકલી રોકાણ · ટાસ્ક અને નોકરી · લોટરી · લોન એપ · નકલી કસ્ટમર કેર · “તમારું સગું મુશ્કેલીમાં છે” · બ્લેકમેલ",

  privacyTitle: "રુકો આ ક્યારેય કરતું નથી",
  privacyPoints: [
    "તમારો OTP, PIN, પાસવર્ડ કે ખાતાની કોઈ વિગત ક્યારેય માગતું નથી.",
    "તમારા વતી ફરિયાદ નોંધાવતું નથી, અને એ સ્પષ્ટ કહે છે.",
    "તમારો સંદેશ સાચવી રાખતું નથી. સ્ક્રીનશોટ એક દિવસમાં ભૂંસાઈ જાય છે.",
    "ક્યારેય કહેતું નથી કે કંઈ “સલામત” છે — વધુમાં વધુ એટલું કે “છેતરપિંડીના ચિહ્ન મળ્યા નથી”.",
  ],

  openApp: "રુકો ખોલો",
};

export const landingStrings: Record<Language, LandingStrings> = { en, hi, gu };
