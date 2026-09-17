import type { Language } from "../types";

/** Parent-facing strings for family protection.
 *
 * Kept in its own file because these are the words someone reads while a
 * stranger is talking at them — they have to be in their language, and they
 * have to be short.
 *
 * The guardian dashboard itself stays English: that half is used by the family
 * member who set Ruko up, not by the person it protects.
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
  familyLinked: (code) => `Linked to family ${code}`,
  familyLinkedNote: "Your family is told when Ruko finds a scam. They never see your messages.",
  familyUnlink: "Unlink",
  familyBadCode: "No family found with that code. Check the letters and try again.",
  familySetupCta: "Set up family protection",
  panicButton: "Someone is pressuring me",
  panicHint: "Press and hold. Your family's phone will sound an alarm immediately.",
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

const hi: FamilyStrings = {
  familyTitle: "परिवार सुरक्षा",
  familyIntro:
    "अगर आपके परिवार में किसी ने रुको सेट किया है, तो उनका कोड डालें। जब रुको को धोखा मिलेगा, उन्हें तुरंत पता चल जाएगा।",
  familyCodeLabel: "परिवार कोड",
  familyCodePlaceholder: "6 अक्षर",
  familyLinkButton: "जोड़ें",
  familyLinking: "जोड़ा जा रहा है…",
  familyLinked: (code) => `परिवार ${code} से जुड़ा हुआ`,
  familyLinkedNote:
    "रुको को धोखा मिलने पर आपके परिवार को बताया जाएगा। वे आपके संदेश कभी नहीं देखते।",
  familyUnlink: "हटाएं",
  familyBadCode: "इस कोड से कोई परिवार नहीं मिला। अक्षर जाँचकर फिर कोशिश करें।",
  familySetupCta: "परिवार सुरक्षा चालू करें",
  panicButton: "कोई मुझ पर दबाव डाल रहा है",
  panicHint: "दबाकर रखें। आपके परिवार के फ़ोन पर तुरंत अलार्म बजेगा।",
  panicSending: "परिवार को बताया जा रहा है…",
  panicSent: "आपके परिवार को बता दिया गया है। इसी स्क्रीन पर रहें — वे यहीं जवाब दे सकते हैं।",
  panicFailed: "परिवार तक नहीं पहुँच सके। कृपया उन्हें सीधे फ़ोन करें।",
  stopTitle: "रुको",
  stopBody: "आपका परिवार कह रहा है — अभी फ़ोन रख दें। पैसे न दें और कोई कोड न बताएं।",
  stopDismiss: "मैंने फ़ोन रख दिया",
  safeTitle: "आपका परिवार कहता है ठीक है",
  safeBody: "उन्होंने देख लिया है और कहते हैं कि आप आगे बढ़ सकते हैं।",
  safeDismiss: "धन्यवाद",
};

const bn: FamilyStrings = {
  familyTitle: "পরিবার সুরক্ষা",
  familyIntro:
    "আপনার পরিবারের কেউ রুকো সেট করে থাকলে তাঁর কোড দিন। রুকো প্রতারণা ধরলে তাঁকে সঙ্গে সঙ্গে জানানো হবে।",
  familyCodeLabel: "পরিবার কোড",
  familyCodePlaceholder: "৬ অক্ষর",
  familyLinkButton: "যুক্ত করুন",
  familyLinking: "যুক্ত করা হচ্ছে…",
  familyLinked: (code) => `পরিবার ${code}-এর সঙ্গে যুক্ত`,
  familyLinkedNote:
    "রুকো প্রতারণা ধরলে আপনার পরিবারকে জানানো হয়। তাঁরা আপনার বার্তা কখনও দেখেন না।",
  familyUnlink: "সরান",
  familyBadCode: "এই কোডে কোনও পরিবার পাওয়া যায়নি। অক্ষরগুলি দেখে আবার চেষ্টা করুন।",
  familySetupCta: "পরিবার সুরক্ষা চালু করুন",
  panicButton: "কেউ আমাকে চাপ দিচ্ছে",
  panicHint: "চেপে ধরে রাখুন। আপনার পরিবারের ফোনে সঙ্গে সঙ্গে অ্যালার্ম বাজবে।",
  panicSending: "পরিবারকে জানানো হচ্ছে…",
  panicSent: "আপনার পরিবারকে জানানো হয়েছে। এই স্ক্রিনেই থাকুন — তাঁরা এখানেই উত্তর দিতে পারেন।",
  panicFailed: "পরিবারের কাছে পৌঁছানো গেল না। অনুগ্রহ করে সরাসরি ফোন করুন।",
  stopTitle: "থামুন",
  stopBody: "আপনার পরিবার বলছে এখনই ফোন রাখুন। টাকা দেবেন না, কোনও কোড জানাবেন না।",
  stopDismiss: "আমি ফোন রেখে দিয়েছি",
  safeTitle: "আপনার পরিবার বলছে ঠিক আছে",
  safeBody: "তাঁরা দেখে নিয়েছেন এবং বলছেন আপনি এগোতে পারেন।",
  safeDismiss: "ধন্যবাদ",
};

const mr: FamilyStrings = {
  familyTitle: "कुटुंब सुरक्षा",
  familyIntro:
    "तुमच्या कुटुंबातील कोणी रुको सेट केले असेल तर त्यांचा कोड टाका. रुकोला फसवणूक आढळल्यावर त्यांना लगेच कळेल.",
  familyCodeLabel: "कुटुंब कोड",
  familyCodePlaceholder: "6 अक्षरे",
  familyLinkButton: "जोडा",
  familyLinking: "जोडत आहोत…",
  familyLinked: (code) => `कुटुंब ${code} शी जोडलेले`,
  familyLinkedNote:
    "रुकोला फसवणूक आढळल्यास तुमच्या कुटुंबाला कळवले जाते. ते तुमचे संदेश कधीच पाहत नाहीत.",
  familyUnlink: "काढा",
  familyBadCode: "या कोडने कुटुंब सापडले नाही. अक्षरे तपासून पुन्हा प्रयत्न करा.",
  familySetupCta: "कुटुंब सुरक्षा सुरू करा",
  panicButton: "कोणीतरी माझ्यावर दबाव आणत आहे",
  panicHint: "दाबून धरा. तुमच्या कुटुंबाच्या फोनवर लगेच गजर वाजेल.",
  panicSending: "कुटुंबाला कळवत आहोत…",
  panicSent: "तुमच्या कुटुंबाला कळवले आहे. याच स्क्रीनवर राहा — ते इथेच उत्तर देऊ शकतात.",
  panicFailed: "कुटुंबापर्यंत पोहोचता आले नाही. कृपया त्यांना थेट फोन करा.",
  stopTitle: "थांबा",
  stopBody: "तुमचे कुटुंब म्हणते — आत्ताच फोन ठेवा. पैसे देऊ नका आणि कोणताही कोड सांगू नका.",
  stopDismiss: "मी फोन ठेवला",
  safeTitle: "तुमचे कुटुंब म्हणते ठीक आहे",
  safeBody: "त्यांनी पाहिले आहे आणि म्हणतात तुम्ही पुढे जाऊ शकता.",
  safeDismiss: "धन्यवाद",
};

const te: FamilyStrings = {
  familyTitle: "కుటుంబ రక్షణ",
  familyIntro:
    "మీ కుటుంబంలో ఎవరైనా రుకో సెట్ చేసి ఉంటే వారి కోడ్ వేయండి. రుకోకు మోసం కనిపించినప్పుడు వారికి వెంటనే తెలుస్తుంది.",
  familyCodeLabel: "కుటుంబ కోడ్",
  familyCodePlaceholder: "6 అక్షరాలు",
  familyLinkButton: "కలపండి",
  familyLinking: "కలుపుతున్నాం…",
  familyLinked: (code) => `కుటుంబం ${code} తో కలిపి ఉంది`,
  familyLinkedNote:
    "రుకోకు మోసం కనిపిస్తే మీ కుటుంబానికి తెలుస్తుంది. మీ సందేశాలను వారు ఎప్పుడూ చూడరు.",
  familyUnlink: "తీసివేయండి",
  familyBadCode: "ఈ కోడ్‌తో కుటుంబం కనిపించలేదు. అక్షరాలు చూసి మళ్లీ ప్రయత్నించండి.",
  familySetupCta: "కుటుంబ రక్షణ ప్రారంభించండి",
  panicButton: "ఎవరో నన్ను ఒత్తిడి చేస్తున్నారు",
  panicHint: "నొక్కి పట్టుకోండి. మీ కుటుంబ ఫోన్‌లో వెంటనే అలారం మోగుతుంది.",
  panicSending: "కుటుంబానికి తెలియజేస్తున్నాం…",
  panicSent: "మీ కుటుంబానికి తెలియజేశాం. ఈ స్క్రీన్‌లోనే ఉండండి — వారు ఇక్కడే జవాబు ఇవ్వవచ్చు.",
  panicFailed: "కుటుంబాన్ని చేరుకోలేకపోయాం. దయచేసి వారికి నేరుగా ఫోన్ చేయండి.",
  stopTitle: "ఆగండి",
  stopBody: "మీ కుటుంబం చెబుతోంది — ఇప్పుడే ఫోన్ పెట్టేయండి. డబ్బు ఇవ్వవద్దు, ఏ కోడ్ చెప్పవద్దు.",
  stopDismiss: "నేను ఫోన్ పెట్టేశాను",
  safeTitle: "మీ కుటుంబం ఫరవాలేదు అంటోంది",
  safeBody: "వారు చూశారు, మీరు కొనసాగవచ్చని చెబుతున్నారు.",
  safeDismiss: "ధన్యవాదాలు",
};

const ta: FamilyStrings = {
  familyTitle: "குடும்பப் பாதுகாப்பு",
  familyIntro:
    "உங்கள் குடும்பத்தில் யாராவது ருகோவை அமைத்திருந்தால் அவர்களின் குறியீட்டை உள்ளிடுங்கள். ருகோ மோசடியைக் கண்டறியும்போது அவர்களுக்கு உடனே தெரிவிக்கப்படும்.",
  familyCodeLabel: "குடும்பக் குறியீடு",
  familyCodePlaceholder: "6 எழுத்துகள்",
  familyLinkButton: "இணை",
  familyLinking: "இணைக்கிறோம்…",
  familyLinked: (code) => `குடும்பம் ${code} உடன் இணைக்கப்பட்டது`,
  familyLinkedNote:
    "ருகோ மோசடியைக் கண்டறிந்தால் உங்கள் குடும்பத்துக்குத் தெரிவிக்கப்படும். உங்கள் செய்திகளை அவர்கள் ஒருபோதும் பார்ப்பதில்லை.",
  familyUnlink: "நீக்கு",
  familyBadCode: "இந்தக் குறியீட்டில் குடும்பம் எதுவும் கிடைக்கவில்லை. எழுத்துகளைப் பார்த்து மீண்டும் முயலுங்கள்.",
  familySetupCta: "குடும்பப் பாதுகாப்பை அமைக்கவும்",
  panicButton: "யாரோ என்னை நெருக்குகிறார்கள்",
  panicHint: "அழுத்திப் பிடியுங்கள். உங்கள் குடும்பத்தின் தொலைபேசியில் உடனே அபாய ஒலி எழும்.",
  panicSending: "குடும்பத்துக்குத் தெரிவிக்கிறோம்…",
  panicSent: "உங்கள் குடும்பத்துக்குத் தெரிவிக்கப்பட்டது. இந்தத் திரையிலேயே இருங்கள் — அவர்கள் இங்கேயே பதில் சொல்லலாம்.",
  panicFailed: "குடும்பத்தை அடைய முடியவில்லை. அவர்களை நேரடியாக அழையுங்கள்.",
  stopTitle: "நிறுத்து",
  stopBody: "உங்கள் குடும்பம் சொல்கிறது — இப்போதே அழைப்பை முடியுங்கள். பணம் தராதீர்கள், எந்தக் குறியீட்டையும் சொல்லாதீர்கள்.",
  stopDismiss: "நான் அழைப்பை முடித்துவிட்டேன்",
  safeTitle: "உங்கள் குடும்பம் பரவாயில்லை என்கிறது",
  safeBody: "அவர்கள் பார்த்துவிட்டார்கள், நீங்கள் தொடரலாம் என்கிறார்கள்.",
  safeDismiss: "நன்றி",
};

const gu: FamilyStrings = {
  familyTitle: "પરિવાર સુરક્ષા",
  familyIntro:
    "તમારા પરિવારમાં કોઈએ રુકો સેટ કર્યું હોય તો તેમનો કોડ નાખો. રુકોને છેતરપિંડી મળશે ત્યારે તેમને તરત ખબર પડશે.",
  familyCodeLabel: "પરિવાર કોડ",
  familyCodePlaceholder: "6 અક્ષર",
  familyLinkButton: "જોડો",
  familyLinking: "જોડાઈ રહ્યું છે…",
  familyLinked: (code) => `પરિવાર ${code} સાથે જોડાયેલું`,
  familyLinkedNote:
    "રુકોને છેતરપિંડી મળે ત્યારે તમારા પરિવારને જણાવાય છે. તેઓ તમારા સંદેશા ક્યારેય જોતા નથી.",
  familyUnlink: "કાઢી નાખો",
  familyBadCode: "આ કોડથી કોઈ પરિવાર મળ્યો નથી. અક્ષરો તપાસીને ફરી પ્રયત્ન કરો.",
  familySetupCta: "પરિવાર સુરક્ષા ચાલુ કરો",
  panicButton: "કોઈ મારા પર દબાણ કરે છે",
  panicHint: "દબાવીને રાખો. તમારા પરિવારના ફોન પર તરત એલાર્મ વાગશે.",
  panicSending: "પરિવારને જણાવી રહ્યા છીએ…",
  panicSent: "તમારા પરિવારને જણાવી દીધું છે. આ જ સ્ક્રીન પર રહો — તેઓ અહીં જ જવાબ આપી શકે છે.",
  panicFailed: "પરિવાર સુધી પહોંચી શકાયું નહીં. કૃપા કરીને તેમને સીધો ફોન કરો.",
  stopTitle: "થોભો",
  stopBody: "તમારો પરિવાર કહે છે — હમણાં જ ફોન મૂકી દો. પૈસા ન આપો અને કોઈ કોડ ન કહો.",
  stopDismiss: "મેં ફોન મૂકી દીધો",
  safeTitle: "તમારો પરિવાર કહે છે વાંધો નથી",
  safeBody: "તેમણે જોઈ લીધું છે અને કહે છે કે તમે આગળ વધી શકો છો.",
  safeDismiss: "આભાર",
};

const ur: FamilyStrings = {
  familyTitle: "خاندانی تحفظ",
  familyIntro:
    "اگر آپ کے خاندان میں کسی نے رُکو سیٹ کیا ہے تو ان کا کوڈ درج کریں۔ جب رُکو کو فراڈ ملے گا، انہیں فوراً بتا دیا جائے گا۔",
  familyCodeLabel: "خاندانی کوڈ",
  familyCodePlaceholder: "6 حروف",
  familyLinkButton: "جوڑیں",
  familyLinking: "جوڑا جا رہا ہے…",
  familyLinked: (code) => `خاندان ${code} سے جڑا ہوا`,
  familyLinkedNote:
    "رُکو کو فراڈ ملنے پر آپ کے خاندان کو بتایا جاتا ہے۔ وہ آپ کے پیغامات کبھی نہیں دیکھتے۔",
  familyUnlink: "ہٹائیں",
  familyBadCode: "اس کوڈ سے کوئی خاندان نہیں ملا۔ حروف دیکھ کر دوبارہ کوشش کریں۔",
  familySetupCta: "خاندانی تحفظ شروع کریں",
  panicButton: "کوئی مجھ پر دباؤ ڈال رہا ہے",
  panicHint: "دبا کر رکھیں۔ آپ کے خاندان کے فون پر فوراً الارم بجے گا۔",
  panicSending: "خاندان کو بتایا جا رہا ہے…",
  panicSent: "آپ کے خاندان کو بتا دیا گیا ہے۔ اسی اسکرین پر رہیں — وہ یہیں جواب دے سکتے ہیں۔",
  panicFailed: "خاندان تک نہیں پہنچ سکے۔ براہ کرم انہیں براہ راست فون کریں۔",
  stopTitle: "رُکو",
  stopBody: "آپ کا خاندان کہہ رہا ہے — ابھی فون رکھ دیں۔ پیسے نہ دیں اور کوئی کوڈ نہ بتائیں۔",
  stopDismiss: "میں نے فون رکھ دیا",
  safeTitle: "آپ کا خاندان کہتا ہے ٹھیک ہے",
  safeBody: "انہوں نے دیکھ لیا ہے اور کہتے ہیں آپ آگے بڑھ سکتے ہیں۔",
  safeDismiss: "شکریہ",
};

const kn: FamilyStrings = {
  familyTitle: "ಕುಟುಂಬ ರಕ್ಷಣೆ",
  familyIntro:
    "ನಿಮ್ಮ ಕುಟುಂಬದಲ್ಲಿ ಯಾರಾದರೂ ರುಕೋ ಸೆಟ್ ಮಾಡಿದ್ದರೆ ಅವರ ಕೋಡ್ ಹಾಕಿ. ರುಕೋಗೆ ಮೋಸ ಕಂಡಾಗ ಅವರಿಗೆ ತಕ್ಷಣ ತಿಳಿಯುತ್ತದೆ.",
  familyCodeLabel: "ಕುಟುಂಬ ಕೋಡ್",
  familyCodePlaceholder: "6 ಅಕ್ಷರ",
  familyLinkButton: "ಸೇರಿಸಿ",
  familyLinking: "ಸೇರಿಸುತ್ತಿದ್ದೇವೆ…",
  familyLinked: (code) => `ಕುಟುಂಬ ${code} ಗೆ ಸೇರಿದೆ`,
  familyLinkedNote:
    "ರುಕೋಗೆ ಮೋಸ ಕಂಡರೆ ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ತಿಳಿಸಲಾಗುತ್ತದೆ. ಅವರು ನಿಮ್ಮ ಸಂದೇಶಗಳನ್ನು ಎಂದಿಗೂ ನೋಡುವುದಿಲ್ಲ.",
  familyUnlink: "ತೆಗೆದುಹಾಕಿ",
  familyBadCode: "ಈ ಕೋಡ್‌ನಿಂದ ಯಾವುದೇ ಕುಟುಂಬ ಸಿಗಲಿಲ್ಲ. ಅಕ್ಷರಗಳನ್ನು ನೋಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  familySetupCta: "ಕುಟುಂಬ ರಕ್ಷಣೆ ಶುರು ಮಾಡಿ",
  panicButton: "ಯಾರೋ ನನ್ನ ಮೇಲೆ ಒತ್ತಡ ಹಾಕುತ್ತಿದ್ದಾರೆ",
  panicHint: "ಒತ್ತಿ ಹಿಡಿಯಿರಿ. ನಿಮ್ಮ ಕುಟುಂಬದ ಫೋನಿನಲ್ಲಿ ತಕ್ಷಣ ಅಲಾರಂ ಬಾರಿಸುತ್ತದೆ.",
  panicSending: "ಕುಟುಂಬಕ್ಕೆ ತಿಳಿಸುತ್ತಿದ್ದೇವೆ…",
  panicSent: "ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ತಿಳಿಸಲಾಗಿದೆ. ಇದೇ ಪರದೆಯಲ್ಲಿ ಇರಿ — ಅವರು ಇಲ್ಲೇ ಉತ್ತರಿಸಬಹುದು.",
  panicFailed: "ಕುಟುಂಬವನ್ನು ತಲುಪಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಅವರಿಗೆ ನೇರವಾಗಿ ಕರೆ ಮಾಡಿ.",
  stopTitle: "ನಿಲ್ಲಿ",
  stopBody: "ನಿಮ್ಮ ಕುಟುಂಬ ಹೇಳುತ್ತಿದೆ — ಈಗಲೇ ಫೋನ್ ಇಡಿ. ಹಣ ಕೊಡಬೇಡಿ, ಯಾವ ಕೋಡ್ ಕೂಡ ಹೇಳಬೇಡಿ.",
  stopDismiss: "ನಾನು ಫೋನ್ ಇಟ್ಟೆ",
  safeTitle: "ನಿಮ್ಮ ಕುಟುಂಬ ಪರವಾಗಿಲ್ಲ ಎನ್ನುತ್ತಿದೆ",
  safeBody: "ಅವರು ನೋಡಿದ್ದಾರೆ, ನೀವು ಮುಂದುವರಿಯಬಹುದು ಎನ್ನುತ್ತಾರೆ.",
  safeDismiss: "ಧನ್ಯವಾದ",
};

const or: FamilyStrings = {
  familyTitle: "ପରିବାର ସୁରକ୍ଷା",
  familyIntro:
    "ଆପଣଙ୍କ ପରିବାରରେ କେହି ରୁକୋ ସେଟ କରିଥିଲେ ତାଙ୍କ କୋଡ ଦିଅନ୍ତୁ। ରୁକୋ ଠକାମି ଧରିଲେ ତାଙ୍କୁ ତୁରନ୍ତ ଜଣାଇ ଦିଆଯିବ।",
  familyCodeLabel: "ପରିବାର କୋଡ",
  familyCodePlaceholder: "6 ଅକ୍ଷର",
  familyLinkButton: "ଯୋଡ଼ନ୍ତୁ",
  familyLinking: "ଯୋଡ଼ାଯାଉଛି…",
  familyLinked: (code) => `ପରିବାର ${code} ସହ ଯୋଡ଼ା`,
  familyLinkedNote:
    "ରୁକୋ ଠକାମି ଧରିଲେ ଆପଣଙ୍କ ପରିବାରକୁ ଜଣାଯାଏ। ସେମାନେ ଆପଣଙ୍କ ସନ୍ଦେଶ କେବେ ଦେଖନ୍ତି ନାହିଁ।",
  familyUnlink: "ହଟାନ୍ତୁ",
  familyBadCode: "ଏହି କୋଡରେ କୌଣସି ପରିବାର ମିଳିଲା ନାହିଁ। ଅକ୍ଷର ଯାଞ୍ଚ କରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।",
  familySetupCta: "ପରିବାର ସୁରକ୍ଷା ଆରମ୍ଭ କରନ୍ତୁ",
  panicButton: "କେହି ମୋ ଉପରେ ଚାପ ପକାଉଛି",
  panicHint: "ଚାପି ଧରନ୍ତୁ। ଆପଣଙ୍କ ପରିବାରର ଫୋନରେ ତୁରନ୍ତ ଆଲାର୍ମ ବାଜିବ।",
  panicSending: "ପରିବାରକୁ ଜଣାଯାଉଛି…",
  panicSent: "ଆପଣଙ୍କ ପରିବାରକୁ ଜଣାଇ ଦିଆଯାଇଛି। ଏହି ସ୍କ୍ରିନରେ ରୁହନ୍ତୁ — ସେମାନେ ଏଠାରେ ଉତ୍ତର ଦେଇପାରନ୍ତି।",
  panicFailed: "ପରିବାର ପାଖରେ ପହଞ୍ଚି ପାରିଲୁ ନାହିଁ। ଦୟାକରି ସିଧା ଫୋନ କରନ୍ତୁ।",
  stopTitle: "ଅଟକନ୍ତୁ",
  stopBody: "ଆପଣଙ୍କ ପରିବାର କହୁଛି — ଏବେ ଫୋନ ରଖିଦିଅନ୍ତୁ। ଟଙ୍କା ଦିଅନ୍ତୁ ନାହିଁ, କୌଣସି କୋଡ କୁହନ୍ତୁ ନାହିଁ।",
  stopDismiss: "ମୁଁ ଫୋନ ରଖିଦେଲି",
  safeTitle: "ଆପଣଙ୍କ ପରିବାର କହୁଛି ଠିକ ଅଛି",
  safeBody: "ସେମାନେ ଦେଖିଛନ୍ତି ଏବଂ କହୁଛନ୍ତି ଆପଣ ଆଗକୁ ବଢ଼ି ପାରିବେ।",
  safeDismiss: "ଧନ୍ୟବାଦ",
};

const ml: FamilyStrings = {
  familyTitle: "കുടുംബ സുരക്ഷ",
  familyIntro:
    "നിങ്ങളുടെ കുടുംബത്തിൽ ആരെങ്കിലും രുകോ സജ്ജമാക്കിയിട്ടുണ്ടെങ്കിൽ അവരുടെ കോഡ് നൽകുക. രുകോ തട്ടിപ്പ് കണ്ടെത്തുമ്പോൾ അവരെ ഉടൻ അറിയിക്കും.",
  familyCodeLabel: "കുടുംബ കോഡ്",
  familyCodePlaceholder: "6 അക്ഷരം",
  familyLinkButton: "ചേർക്കുക",
  familyLinking: "ചേർക്കുന്നു…",
  familyLinked: (code) => `കുടുംബം ${code} ഉമായി ചേർത്തു`,
  familyLinkedNote:
    "രുകോ തട്ടിപ്പ് കണ്ടെത്തിയാൽ നിങ്ങളുടെ കുടുംബത്തെ അറിയിക്കും. നിങ്ങളുടെ സന്ദേശങ്ങൾ അവർ ഒരിക്കലും കാണില്ല.",
  familyUnlink: "നീക്കുക",
  familyBadCode: "ഈ കോഡിൽ കുടുംബമൊന്നും കണ്ടെത്തിയില്ല. അക്ഷരങ്ങൾ നോക്കി വീണ്ടും ശ്രമിക്കുക.",
  familySetupCta: "കുടുംബ സുരക്ഷ തുടങ്ങുക",
  panicButton: "ആരോ എന്നെ സമ്മർദ്ദത്തിലാക്കുന്നു",
  panicHint: "അമർത്തിപ്പിടിക്കുക. നിങ്ങളുടെ കുടുംബത്തിന്റെ ഫോണിൽ ഉടൻ അലാറം മുഴങ്ങും.",
  panicSending: "കുടുംബത്തെ അറിയിക്കുന്നു…",
  panicSent: "നിങ്ങളുടെ കുടുംബത്തെ അറിയിച്ചു. ഈ സ്ക്രീനിൽ തന്നെ നിൽക്കുക — അവർ ഇവിടെ മറുപടി നൽകാം.",
  panicFailed: "കുടുംബത്തിലേക്ക് എത്താനായില്ല. ദയവായി അവരെ നേരിട്ട് വിളിക്കുക.",
  stopTitle: "നിർത്തൂ",
  stopBody: "നിങ്ങളുടെ കുടുംബം പറയുന്നു — ഇപ്പോൾ തന്നെ ഫോൺ വയ്ക്കുക. പണം നൽകരുത്, ഒരു കോഡും പറയരുത്.",
  stopDismiss: "ഞാൻ ഫോൺ വച്ചു",
  safeTitle: "കുഴപ്പമില്ലെന്ന് നിങ്ങളുടെ കുടുംബം പറയുന്നു",
  safeBody: "അവർ നോക്കി, നിങ്ങൾക്ക് തുടരാമെന്ന് പറയുന്നു.",
  safeDismiss: "നന്ദി",
};

const pa: FamilyStrings = {
  familyTitle: "ਪਰਿਵਾਰ ਸੁਰੱਖਿਆ",
  familyIntro:
    "ਜੇ ਤੁਹਾਡੇ ਪਰਿਵਾਰ ਵਿੱਚ ਕਿਸੇ ਨੇ ਰੁਕੋ ਸੈੱਟ ਕੀਤਾ ਹੈ ਤਾਂ ਉਨ੍ਹਾਂ ਦਾ ਕੋਡ ਪਾਓ। ਜਦੋਂ ਰੁਕੋ ਨੂੰ ਠੱਗੀ ਮਿਲੇਗੀ, ਉਨ੍ਹਾਂ ਨੂੰ ਤੁਰੰਤ ਪਤਾ ਲੱਗ ਜਾਵੇਗਾ।",
  familyCodeLabel: "ਪਰਿਵਾਰ ਕੋਡ",
  familyCodePlaceholder: "6 ਅੱਖਰ",
  familyLinkButton: "ਜੋੜੋ",
  familyLinking: "ਜੋੜਿਆ ਜਾ ਰਿਹਾ ਹੈ…",
  familyLinked: (code) => `ਪਰਿਵਾਰ ${code} ਨਾਲ ਜੁੜਿਆ`,
  familyLinkedNote:
    "ਰੁਕੋ ਨੂੰ ਠੱਗੀ ਮਿਲਣ 'ਤੇ ਤੁਹਾਡੇ ਪਰਿਵਾਰ ਨੂੰ ਦੱਸਿਆ ਜਾਂਦਾ ਹੈ। ਉਹ ਤੁਹਾਡੇ ਸੁਨੇਹੇ ਕਦੇ ਨਹੀਂ ਵੇਖਦੇ।",
  familyUnlink: "ਹਟਾਓ",
  familyBadCode: "ਇਸ ਕੋਡ ਨਾਲ ਕੋਈ ਪਰਿਵਾਰ ਨਹੀਂ ਮਿਲਿਆ। ਅੱਖਰ ਵੇਖ ਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  familySetupCta: "ਪਰਿਵਾਰ ਸੁਰੱਖਿਆ ਸ਼ੁਰੂ ਕਰੋ",
  panicButton: "ਕੋਈ ਮੇਰੇ 'ਤੇ ਦਬਾਅ ਪਾ ਰਿਹਾ ਹੈ",
  panicHint: "ਦਬਾ ਕੇ ਰੱਖੋ। ਤੁਹਾਡੇ ਪਰਿਵਾਰ ਦੇ ਫ਼ੋਨ 'ਤੇ ਤੁਰੰਤ ਅਲਾਰਮ ਵੱਜੇਗਾ।",
  panicSending: "ਪਰਿਵਾਰ ਨੂੰ ਦੱਸਿਆ ਜਾ ਰਿਹਾ ਹੈ…",
  panicSent: "ਤੁਹਾਡੇ ਪਰਿਵਾਰ ਨੂੰ ਦੱਸ ਦਿੱਤਾ ਹੈ। ਇਸੇ ਸਕ੍ਰੀਨ 'ਤੇ ਰਹੋ — ਉਹ ਇੱਥੇ ਹੀ ਜਵਾਬ ਦੇ ਸਕਦੇ ਹਨ।",
  panicFailed: "ਪਰਿਵਾਰ ਤੱਕ ਨਹੀਂ ਪਹੁੰਚ ਸਕੇ। ਕਿਰਪਾ ਕਰਕੇ ਉਨ੍ਹਾਂ ਨੂੰ ਸਿੱਧਾ ਫ਼ੋਨ ਕਰੋ।",
  stopTitle: "ਰੁਕੋ",
  stopBody: "ਤੁਹਾਡਾ ਪਰਿਵਾਰ ਕਹਿ ਰਿਹਾ ਹੈ — ਹੁਣੇ ਫ਼ੋਨ ਰੱਖ ਦਿਓ। ਪੈਸੇ ਨਾ ਦਿਓ ਤੇ ਕੋਈ ਕੋਡ ਨਾ ਦੱਸੋ।",
  stopDismiss: "ਮੈਂ ਫ਼ੋਨ ਰੱਖ ਦਿੱਤਾ",
  safeTitle: "ਤੁਹਾਡਾ ਪਰਿਵਾਰ ਕਹਿੰਦਾ ਹੈ ਠੀਕ ਹੈ",
  safeBody: "ਉਨ੍ਹਾਂ ਨੇ ਵੇਖ ਲਿਆ ਹੈ ਤੇ ਕਹਿੰਦੇ ਹਨ ਤੁਸੀਂ ਅੱਗੇ ਵਧ ਸਕਦੇ ਹੋ।",
  safeDismiss: "ਧੰਨਵਾਦ",
};

const as: FamilyStrings = {
  familyTitle: "পৰিয়াল সুৰক্ষা",
  familyIntro:
    "আপোনাৰ পৰিয়ালৰ কোনোবাই ৰুকো ছেট কৰি থাকিলে তেওঁৰ ক'ড দিয়ক। ৰুকোৱে প্ৰতাৰণা ধৰিলে তেওঁক লগে লগে জনোৱা হ'ব।",
  familyCodeLabel: "পৰিয়াল ক'ড",
  familyCodePlaceholder: "6 আখৰ",
  familyLinkButton: "যোগ কৰক",
  familyLinking: "যোগ কৰি আছোঁ…",
  familyLinked: (code) => `পৰিয়াল ${code} ৰ সৈতে যুক্ত`,
  familyLinkedNote:
    "ৰুকোৱে প্ৰতাৰণা ধৰিলে আপোনাৰ পৰিয়ালক জনোৱা হয়। তেওঁলোকে আপোনাৰ বাৰ্তা কেতিয়াও নেদেখে।",
  familyUnlink: "আঁতৰাওক",
  familyBadCode: "এই ক'ডেৰে কোনো পৰিয়াল পোৱা নগ'ল। আখৰবোৰ চাই পুনৰ চেষ্টা কৰক।",
  familySetupCta: "পৰিয়াল সুৰক্ষা আৰম্ভ কৰক",
  panicButton: "কোনোবাই মোক হেঁচা দি আছে",
  panicHint: "টিপি ধৰি ৰাখক। আপোনাৰ পৰিয়ালৰ ফোনত লগে লগে এলাৰ্ম বাজিব।",
  panicSending: "পৰিয়ালক জনাই আছোঁ…",
  panicSent: "আপোনাৰ পৰিয়ালক জনোৱা হৈছে। এই স্ক্ৰীণতে থাকক — তেওঁলোকে ইয়াতেই উত্তৰ দিব পাৰে।",
  panicFailed: "পৰিয়াললৈ পাব পৰা নগ'ল। অনুগ্ৰহ কৰি পোনপটীয়াকৈ ফোন কৰক।",
  stopTitle: "ৰৈ যাওক",
  stopBody: "আপোনাৰ পৰিয়ালে কৈছে — এতিয়াই ফোন থৈ দিয়ক। টকা নিদিব আৰু কোনো ক'ড নক'ব।",
  stopDismiss: "মই ফোন থৈ দিলোঁ",
  safeTitle: "আপোনাৰ পৰিয়ালে কৈছে ঠিক আছে",
  safeBody: "তেওঁলোকে চাই লৈছে আৰু কৈছে আপুনি আগবাঢ়িব পাৰে।",
  safeDismiss: "ধন্যবাদ",
};

const mai: FamilyStrings = {
  familyTitle: "परिवार सुरक्षा",
  familyIntro:
    "जँ अहाँक परिवार मे ककरो रुको सेट कयने अछि त' हुनकर कोड देल जाउ। रुको के ठकी भेटला पर हुनका तुरंत पता चलि जायत।",
  familyCodeLabel: "परिवार कोड",
  familyCodePlaceholder: "6 अक्षर",
  familyLinkButton: "जोड़ू",
  familyLinking: "जोड़ल जा रहल अछि…",
  familyLinked: (code) => `परिवार ${code} सँ जुड़ल`,
  familyLinkedNote:
    "रुको के ठकी भेटला पर अहाँक परिवार के कहल जाइत अछि। ओ अहाँक संदेश कहियो नहि देखैत छथि।",
  familyUnlink: "हटाउ",
  familyBadCode: "एहि कोड सँ कोनो परिवार नहि भेटल। अक्षर जाँचि क' फेर कोशिश करू।",
  familySetupCta: "परिवार सुरक्षा चालू करू",
  panicButton: "केओ हमरा पर दबाव दऽ रहल अछि",
  panicHint: "दाबि क' रखू। अहाँक परिवारक फोन पर तुरंत अलार्म बाजत।",
  panicSending: "परिवार के कहल जा रहल अछि…",
  panicSent: "अहाँक परिवार के कहि देल गेल। एहि स्क्रीन पर रहू — ओ एतहि जवाब दऽ सकैत छथि।",
  panicFailed: "परिवार धरि नहि पहुँचि सकलहुँ। कृपया हुनका सीधा फोन करू।",
  stopTitle: "रुकू",
  stopBody: "अहाँक परिवार कहि रहल अछि — अखने फोन राखि दिअ। पाइ नहि दिअ आ कोनो कोड नहि कहू।",
  stopDismiss: "हम फोन राखि देलहुँ",
  safeTitle: "अहाँक परिवार कहैत अछि ठीक अछि",
  safeBody: "ओ देखि लेलनि अछि आ कहैत छथि जे अहाँ आगू बढ़ि सकैत छी।",
  safeDismiss: "धन्यवाद",
};

const ne: FamilyStrings = {
  familyTitle: "परिवार सुरक्षा",
  familyIntro:
    "तपाईंको परिवारमा कसैले रुको सेट गरेको छ भने उहाँको कोड हाल्नुहोस्। रुकोले ठगी भेट्टाउँदा उहाँलाई तुरुन्तै थाहा हुनेछ।",
  familyCodeLabel: "परिवार कोड",
  familyCodePlaceholder: "6 अक्षर",
  familyLinkButton: "जोड्नुहोस्",
  familyLinking: "जोड्दै छौं…",
  familyLinked: (code) => `परिवार ${code} सँग जोडिएको`,
  familyLinkedNote:
    "रुकोले ठगी भेट्टाउँदा तपाईंको परिवारलाई भनिन्छ। उहाँहरूले तपाईंका सन्देश कहिल्यै देख्नुहुन्न।",
  familyUnlink: "हटाउनुहोस्",
  familyBadCode: "यो कोडबाट कुनै परिवार भेटिएन। अक्षर हेरेर फेरि प्रयास गर्नुहोस्।",
  familySetupCta: "परिवार सुरक्षा सुरु गर्नुहोस्",
  panicButton: "कसैले मलाई दबाब दिइरहेको छ",
  panicHint: "थिचेर राख्नुहोस्। तपाईंको परिवारको फोनमा तुरुन्तै अलार्म बज्नेछ।",
  panicSending: "परिवारलाई भन्दै छौं…",
  panicSent: "तपाईंको परिवारलाई भनियो। यही स्क्रिनमा रहनुहोस् — उहाँहरूले यहीँ जवाफ दिन सक्नुहुन्छ।",
  panicFailed: "परिवारसम्म पुग्न सकिएन। कृपया उहाँहरूलाई सिधै फोन गर्नुहोस्।",
  stopTitle: "रोकिनुहोस्",
  stopBody: "तपाईंको परिवार भन्दै छ — अहिले नै फोन राख्नुहोस्। पैसा नदिनुहोस् र कुनै कोड नभन्नुहोस्।",
  stopDismiss: "मैले फोन राखेँ",
  safeTitle: "तपाईंको परिवार भन्छ ठीक छ",
  safeBody: "उहाँहरूले हेर्नुभयो र भन्नुहुन्छ तपाईं अगाडि बढ्न सक्नुहुन्छ।",
  safeDismiss: "धन्यवाद",
};

const dictionaries: Record<Language, FamilyStrings> = {
  en,
  hi,
  bn,
  mr,
  te,
  ta,
  gu,
  ur,
  kn,
  or,
  ml,
  pa,
  as,
  mai,
  ne,
};

export function familyFor(language: Language): FamilyStrings {
  return dictionaries[language] ?? en;
}

export { dictionaries as familyDictionaries, en as familyEn };
