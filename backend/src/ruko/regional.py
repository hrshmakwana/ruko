"""Scam phrases in the languages beyond English, Hindi and Gujarati.

Why this file exists: the first cross-language eval missed 8 of 9 scams written
in Tamil, Bengali, Marathi, Telugu, Kannada, Malayalam, Punjabi and Urdu. Every
one of them had no link, no phone number and no UPI ID — so only a phrase could
catch it, and there were no phrases in those languages. With the model offline,
that is the whole verdict, so these patterns carry real weight.

How they are written, so they can be reviewed one language at a time:

- Each concept (digital arrest, a KYC threat, a power cut, ...) is a set of
  **tokens per language**, joined into one alternation. A pattern then says
  "token A within N characters of token B", in the same sentence.
- Scam messages in every Indian language write KYC, OTP, PIN and CIBIL in Latin
  letters, so those anchors are Latin even inside a Tamil sentence.
- Imperative verb forms are used on purpose ("tell me", "send"), because the
  genuine bank SMS says the negated form ("do not tell"), and in these
  subject-object-verb languages the negation comes *after* the verb.
- Words that are ordinary in daily speech are left out even when they can mean
  "guarantee" or "sure" (Bengali নিশ্চিত, Odia ନିଶ୍ଚିତ) — a false alarm on a
  normal message costs more than a missed pattern that the model would catch.

Nothing here is a claim of fluency. Every pattern is covered by a scam sample and
a genuine-message sample in tests/test_regional.py, and should be read by a
native speaker before it is trusted further.
"""

from __future__ import annotations

# Not a sentence end: ASCII full stop, Devanagari/Bengali danda, Urdu full stop.
S = r"[^.।۔\n]"


def _any(*tokens: str) -> str:
    return "(?:" + "|".join(tokens) + ")"


# --- shared vocabulary ------------------------------------------------------

BLOCK_OR_UPDATE = _any(
    # Bengali / Assamese
    "আপডেট", "ব্লক", "বন্ধ",
    # Tamil
    "புதுப்பி", "முடக்க", "நிறுத்த", "காலாவதி", "ப்ளாக்",
    # Telugu
    "అప్‌డేట్", "అప్డేట్", "బ్లాక్", "నిలిపి", "మూసి",
    # Kannada
    "ಅಪ್‌ಡೇಟ್", "ಅಪ್ಡೇಟ್", "ಬ್ಲಾಕ್", "ಬಂದ್", "ಸ್ಥಗಿತ",
    # Malayalam
    "അപ്ഡേറ്റ്", "ബ്ലോക്ക്", "മരവിപ്പി",
    # Punjabi
    "ਅਪਡੇਟ", "ਬਲਾਕ", "ਬੰਦ",
    # Urdu
    r"اپ\s*ڈیٹ", "بلاک", "بند", "معطل",
    # Marathi / Nepali / Maithili (Devanagari)
    "अपडेट", "ब्लॉक", "बंद", "स्थगित", "निलंबित",
    # Odia
    "ଅପଡେଟ", "ବ୍ଲକ", "ବନ୍ଦ",
)

ACCOUNT = _any(
    "অ্যাকাউন্ট", "একাউণ্ট", "খাতা", "கணக்கு", "ఖాతా", "అకౌంట్", "ಖಾತೆ", "ಅಕೌಂಟ್",
    "അക്കൗണ്ട്", "ਖਾਤਾ", "ਅਕਾਊਂਟ", "اکاؤنٹ", "खाते", "खाता", "ଖାତା",
)

BILL = _any("বিল", "பில்", "బిల్లు", "బిల్", "ಬಿಲ್", "ബിൽ", "ബില്ല്", "ਬਿੱਲ", "ਬਿਲ", "بل", "बिल", "ବିଲ")

POWER_CUT = _any(
    "বিচ্ছিন্ন", "কেটে", "துண்டி", "కట్", "నిలిపి", "ಕಡಿತ", "ಕಟ್", "വിച്ഛേദി", "കട്ട്",
    "ਕੱਟ", "کاٹ", "منقطع", "खंडित", "कापला", "काटि", "ବିଚ୍ଛିନ୍ନ", "କାଟ",
)

DAILY = _any(
    "প্রতিদিন", "দৈনিক", "தினமும்", "நாளொன்றுக்கு", "ஒரு நாளைக்கு", "రోజుకు", "ప్రతిరోజు",
    "ದಿನಕ್ಕೆ", "ಪ್ರತಿದಿನ", "ദിവസവും", "പ്രതിദിനം", "ਰੋਜ਼ਾਨਾ", "روزانہ", "दररोज", "दैनिक",
    "ଦୈନିକ", "ପ୍ରତିଦିନ",
)

EARN = _any(
    "আয় করুন", "রোজগার", "উপার্জন", "சம்பாதி", "సంపాదించ", "ಗಳಿಸಿ", "ಸಂಪಾದಿಸಿ", "സമ്പാദി",
    "ਕਮਾਓ", "ਕਮਾਈ", "کمائیں", "کمائی", "कमवा", "कमाउनुहोस्", "ରୋଜଗାର",
)

LIKE = _any("লাইক", "லைக்", "లైక్", "ಲೈಕ್", "ലൈക്ക്", "ਲਾਈਕ", "لائک", "लाइक", "ଲାଇକ", "like")
VIDEO = _any(
    "ভিডিও", "வீடியோ", "వీడియో", "ವಿಡಿಯೋ", "വീഡിയോ", "ਵੀਡੀਓ", "ویڈیو", "व्हिडिओ", "भिडियो",
    "ଭିଡିଓ", "ইউটিউব", "யூடியூப்", "యూట్యూబ్", "ಯೂಟ್ಯೂಬ್", "യൂട്യൂബ്", "ਯੂਟਿਊਬ", "یوٹیوب", "youtube",
)

PROCESSING = _any(
    "প্রসেসিং", "রেজিস্ট্রেশন", "பிராசசிங்", "பதிவு", "ప్రాసెసింగ్", "రిజిస్ట్రేషన్",
    "ಪ್ರೊಸೆಸಿಂಗ್", "ರಿಜಿಸ್ಟ್ರೇಷನ್", "ನೋಂದಣಿ", "പ്രോസസിംഗ്", "രജിസ്ട്രേഷൻ", "ਪ੍ਰੋਸੈਸਿੰਗ",
    "ਰਜਿਸਟ੍ਰੇਸ਼ਨ", "پروسیسنگ", "رجسٹریشن", "प्रोसेसिंग", "नोंदणी", "ପ୍ରୋସେସିଂ", "ପଞ୍ଜୀକରଣ",
)

FEE = _any(
    "ফি", "கட்டணம்", "ఫీజు", "ఫీ", "ಫೀಸ್", "ಶುಲ್ಕ", "ഫീസ്", "ਫੀਸ", "فیس", "फी", "शुल्क", "ଫି", "ଦେୟ",
)

LOTTERY = _any(
    r"লাকি\s*ড্র", "লটারি", r"லக்கி\s*டிரா", "லாட்டரி", r"లక్కీ\s*డ్రా", "లాటరీ", r"ಲಕ್ಕಿ\s*ಡ್ರಾ",
    "ಲಾಟರಿ", r"ലക്കി\s*ഡ്രോ", r"ਲੱਕੀ\s*ਡਰਾ", "ਲਾਟਰੀ", r"لکی\s*ڈرا", "لاٹری", r"लकी\s*ड्रॉ",
    "लॉटरी", r"ଲକି\s*ଡ୍ର", "ଲଟେରୀ", r"\bkbc\b",
)

# "You have won". Kerala runs a legal state lottery and its results are shared
# widely, so the lottery word alone must never be enough — it has to be paired.
WON = _any(
    "জিতেছেন", "வென்றுள்ளீர்கள்", "வென்றீர்கள்", "గెలుచుకున్నారు", "గెలిచారు", "ಗೆದ್ದಿದ್ದೀರಿ",
    "വിജയിച്ചു", r"ਜਿੱਤ\s*ਲਏ", r"جیت\s*لیے", "जिंकले", "जिंकला", "ଜିତିଛନ୍ତି",
)

ACCIDENT_OR_HOSPITAL = _any(
    "দুর্ঘটনা", "অ্যাক্সিডেন্ট", "হাসপাতাল", "விபத்து", "ஆக்சிடென்ட்", "மருத்துவமனை",
    "ప్రమాదం", "యాక్సిడెంట్", "ఆసుపత్రి", "హాస్పిటల్", "ಅಪಘಾತ", "ಆಕ್ಸಿಡೆಂಟ್", "ಆಸ್ಪತ್ರೆ",
    "അപകട", "ആക്സിഡന്റ്", "ആശുപത്രി", "ਐਕਸੀਡੈਂਟ", "ਹਾਦਸਾ", "ਹਸਪਤਾਲ", "حادثہ", "ایکسیڈنٹ",
    "ہسپتال", "अपघात", "रुग्णालय", "हॉस्पिटल", "ଦୁର୍ଘଟଣା", "ଡାକ୍ତରଖାନା",
)

# A word that ends here: followed by a space, punctuation or the end. Python's \b
# is unreliable in Indic scripts, where vowel signs do not count as letters.
END = r"(?=[\s.,!?।۔،]|$)"

# "Send money" as a *request*. Only the command form counts: the verb stem alone
# also matches "I sent money", and "Dad is in hospital, I sent money for his
# medicines" is exactly the kind of family message that must not be called a scam.
SEND_MONEY = _any(
    rf"টাকা{S}{{0,12}}(?:পাঠাও|পাঠান|পাঠিয়ে\s*(?:দাও|দিন|দে){END})",
    rf"பணம்{S}{{0,12}}(?:அனுப்புங்க|அனுப்பவும்|அனுப்பு{END}|அனுப்பி\s*வை(?:யுங்க|க்கவும்|{END}))",
    rf"డబ్బు{S}{{0,12}}(?:పంపండి|పంపించండి|పంపు{END}|పంపించు{END})",
    rf"ಹಣ{S}{{0,12}}(?:ಕಳುಹಿಸಿ|ಕಳಿಸಿ|ಹಾಕಿ){END}",
    rf"പണം{S}{{0,12}}(?:അയയ്ക്കൂ|അയക്കൂ|അയച്ചു\s*(?:തരൂ|തരണം|താ))",
    rf"ਪੈਸੇ{S}{{0,12}}(?:ਭੇਜੋ|ਭੇਜ\s*ਦਿਓ|ਭੇਜ\s*ਦੇ{END})",
    rf"پیسے{S}{{0,12}}(?:بھیجو|بھیجیں|بھیج\s*دو|بھیج\s*دیں)",
    rf"पैसे{S}{{0,12}}(?:पाठवा|पाठव{END}|पाठवून\s*द्या)",
    rf"ଟଙ୍କା{S}{{0,12}}(?:ପଠାନ୍ତୁ|ପଠାଅ|ପଠାଇ\s*ଦିଅ)",
    rf"টকা{S}{{0,12}}(?:পঠিয়াই\s*দিয়া|পঠাই\s*দিয়া|পঠিয়াওক|পঠাওক)",
)

GUARANTEE = _any(
    "গ্যারান্টি", "கேரண்டி", "உத்தரவாத", "గ్యారంటీ", "హామీ", "ಗ್ಯಾರಂಟಿ", "ಖಾತರಿ", "ഗ്യാരണ്ടി",
    "ਗਾਰੰਟੀ", "گارنٹی", "ضمانت", "गॅरंटी", "हमी", "ଗ୍ୟାରେଣ୍ଟି",
)

PROFIT = _any(
    "রিটার্ন", "মুনাফা", "லாபம்", "ரிட்டர்ன்", "లాభం", "రాబడి", "రిటర్న్", "ಲಾಭ", "ರಿಟರ್ನ್",
    "ലാഭം", "റിട്ടേൺ", "ਮੁਨਾਫ਼ਾ", "ਰਿਟਰਨ", "منافع", "ریٹرن", "परतावा", "नफा", "ଲାଭ",
)

# Imperative "tell me / send / share". Genuine SMS use the negated form instead.
TELL_OR_SEND = _any(
    "বলুন", "বলো", r"বলে\s*দিন", "পাঠান", "சொல்லுங்கள்", "சொல்லவும்", "அனுப்புங்கள்",
    "చెప్పండి", "పంపండి", "షేర్", "ಹೇಳಿ", "ತಿಳಿಸಿ", "ಕಳಿಸಿ", "ಶೇರ್", r"പറഞ്ഞു\s*തര", "പറയൂ",
    "അയയ്ക്കൂ", "ਦੱਸੋ", "ਭੇਜੋ", "بتائیں", "بتاؤ", "بھیجیں", "सांगा", "पाठवा", "शेअर",
    "କୁହନ୍ତୁ", "ପଠାନ୍ତୁ", "કહો", "મોકલો", "જણાવો",
    # Hindi, as it is *spoken* on a call rather than written in an SMS. Live call
    # mode brought these in: "अभी जो OTP आया है वो बता दीजिए" is what a scammer
    # actually says, and none of the SMS patterns matched it.
    r"बता\s*दीजिए", r"बता\s*दीजिये", "बताइए", "बताइये", r"बता\s*दो", r"बता\s*दें",
    "बताओ", "बताएं", r"भेज\s*दीजिए", "भेजिए", "भेजिये", "भेजो", r"शेयर\s*कर",
)

WITHOUT = _any("বিনা", "ছাড়া", "ছাড়াই", "இல்லாமல்", "లేకుండా", "ಇಲ್ಲದೆ", "ഇല്ലാതെ", "ਬਿਨਾਂ", "بغیر", "बिना", "विना", "ବିନା")
CIBIL = _any("cibil", "সিবিল", "சிபில்", "సిబిల్", "ಸಿಬಿಲ್", "സിബിൽ", "ਸਿਬਿਲ", "سبل", "سی\\s*بل", "सिबिल", "ସିବିଲ")

# --- patterns, keyed by the rule they extend ---------------------------------

PATTERNS: dict[str, list[str]] = {
    "phrase.digital_arrest": [
        r"(?:ডিজিটাল|ডিজিটেল)\s*(?:অ্যারেস্ট|এরেস্ট|গ্রেপ্তার|গ্ৰেপ্তাৰ)",
        r"டிஜிட்டல்\s*(?:கைது|அரெஸ்ட்)",
        r"డిజిటల్\s*(?:అరెస్ట్|అరెస్టు)",
        r"ಡಿಜಿಟಲ್\s*(?:ಅರೆಸ್ಟ್|ಬಂಧನ)",
        r"ഡിജിറ്റൽ\s*അറസ്റ്റ",
        r"ਡਿਜੀਟਲ\s*(?:ਅਰੈਸਟ|ਗ੍ਰਿਫ਼ਤਾਰੀ|ਗ੍ਰਿਫਤਾਰੀ)",
        r"ڈیجیٹل\s*(?:گرفتاری|اریسٹ|ارسٹ)",
        r"ଡିଜିଟାଲ\s*(?:ଗିରଫ|ଆରେଷ୍ଟ)",
        r"ડિજિટલ\s*(?:અરેસ્ટ|ધરપકડ)",
    ],
    "phrase.kyc_threat": [
        rf"kyc{S}{{0,40}}{BLOCK_OR_UPDATE}",
        rf"{BLOCK_OR_UPDATE}{S}{{0,40}}kyc",
        rf"{ACCOUNT}{S}{{0,30}}(?:বন্ধ|ব্লক|முடக்க|மூட|బ్లాక్|నిలిపి|ಬ್ಲಾಕ್|ಸ್ಥಗಿತ|ബ്ലോക്ക്|മരവിപ്പി|ਬਲਾਕ|ਬੰਦ|بلاک|معطل|बंद होईल|ब्लॉक|ବ୍ଲକ)",
    ],
    "phrase.electricity_cut": [
        # A bill *and* a cut. A maintenance notice mentions a cut but no bill, so
        # it is deliberately not matched.
        rf"{BILL}{S}{{0,100}}{POWER_CUT}",
    ],
    "phrase.task_job": [
        rf"{DAILY}{S}{{0,40}}{EARN}",
        rf"{LIKE}{S}{{0,30}}{VIDEO}",
        rf"{VIDEO}{S}{{0,30}}{LIKE}",
    ],
    "phrase.advance_fee": [
        rf"{PROCESSING}{S}{{0,15}}{FEE}",
    ],
    "phrase.lottery_prize": [
        rf"{LOTTERY}{S}{{0,60}}{WON}",
        rf"{WON}{S}{{0,60}}{LOTTERY}",
    ],
    "phrase.relative_trouble": [
        rf"{ACCIDENT_OR_HOSPITAL}{S}{{0,80}}{SEND_MONEY}",
    ],
    "phrase.investment_guarantee": [
        rf"{GUARANTEE}{S}{{0,25}}{PROFIT}",
        rf"{PROFIT}{S}{{0,25}}{GUARANTEE}",
    ],
    "phrase.secrecy": [
        rf"কাউকে{S}{{0,15}}(?:বলবেন|জানাবেন){S}{{0,4}}না",
        rf"யாரிடமும்{S}{{0,20}}(?:சொல்ல|கூற){S}{{0,6}}(?:வேண்டாம்|கூடாது)",
        rf"ఎవరికీ{S}{{0,20}}(?:చెప్పవద్దు|చెప్పకండి|చెప్పొద్దు)",
        rf"ಯಾರಿಗೂ{S}{{0,20}}(?:ಹೇಳಬೇಡಿ|ಹೇಳಬೇಡ|ತಿಳಿಸಬೇಡಿ)",
        rf"ആരോടും{S}{{0,20}}(?:പറയരുത്|പറയേണ്ട)",
        rf"(?:ਕਿਸੇ|ਪਾਪਾ|ਮੰਮੀ|ਘਰ){S}{{0,15}}ਨਾ\s*ਦੱਸ",
        rf"کسی\s*کو{S}{{0,15}}(?:مت|نہ)\s*بتا",
        rf"(?:कोणालाही|कुणालाही){S}{{0,15}}सांगू\s*नका",
        rf"କାହାକୁ{S}{{0,15}}(?:କୁହନ୍ତୁ|କହନ୍ତୁ)\s*ନାହିଁ",
    ],
    "phrase.loan_trap": [
        # "Without CIBIL". Hindi and Punjabi put "without" first; Tamil, Telugu,
        # Kannada, Malayalam, Bengali and Urdu put it after, as a postposition.
        rf"{WITHOUT}{S}{{0,12}}{CIBIL}",
        rf"{CIBIL}{S}{{0,12}}{WITHOUT}",
    ],
}

# The Latin "OTP" plus an imperative verb in the same sentence.
OTP_REQUEST_PATTERNS = [
    rf"otp{S}{{0,25}}{TELL_OR_SEND}",
]

# Negations that come *before* the verb, as in Hindi: Urdu "مت بتائیں", Punjabi
# "ਨਾ ਦੱਸੋ", Maithili "नहि कहू", Nepali "नभन्नुहोस्". Without these, the bank's own
# "never tell anyone your OTP" read as a request for it.
def _word(token: str) -> str:
    return rf"(?<!\S){token}{END}"


PRE_NEGATION = _any(
    _word("مت"), _word("نہ"), _word("نا"), r"کبھی\s*نہ",
    _word("ਨਾ"), "ਨਹੀਂ", _word("ਮਤ"), r"ਕਦੇ\s*ਨਾ",
    "नहि", _word("न"), "कहिल्यै", r"(?<!\S)न(?=भन|दिन|गर|पठा|देखा)",
    "কেতিয়াও", r"(?<!\S)ন(?=দি|কৰ|ক'ব|কব)",
)

# Negations that follow the verb in subject-object-verb languages. Checked just
# after a payment-trap match, so "OTP ... షేర్ చేయవద్దు" (do not share) is not
# read as a request.
POST_NEGATION = _any(
    r"(?<!\w)না(?!\w)", "নাই", "வேண்டாம்", "கூடாது", "వద్దు", "చేయకండి", "ಬೇಡಿ", "ಬೇಡ",
    "അരുത്", r"(?<!\w)ਨਾ(?!\w)", r"(?<!\w)نہ(?!\w)", r"(?<!\w)مت(?!\w)", "नका", "नको",
    "ନାହିଁ", "નહીં", "નહિ", "नहीं", "नगर्नु",
)
