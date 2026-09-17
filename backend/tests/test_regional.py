"""Scams and near-misses in the languages beyond English, Hindi and Gujarati.

Each pattern in ruko/regional.py gets two kinds of case here:

- a scam it must catch, written the way these messages actually arrive (no link,
  no number, so a phrase is the only signal), and
- a genuine message that shares its words — the bank's own OTP warning, a
  family update from a hospital, a maintenance notice — which it must not flag.

The second list matters more. It was written by looking for the messages a
parent really receives, and two of them (a hospital update that says "I sent
money", and an Urdu "never tell anyone your OTP") were flagged as scams by the
first version of these patterns.
"""

import csv
from pathlib import Path

import pytest

from ruko.extract import extract_all
from ruko.rules import run_rules

SCAM_FLOOR = 75


def check(text: str):
    return run_rules(text, extract_all(text), {})


# --- scams the rules must catch on their own ----------------------------------

SCAMS = [
    # (rule id, language, message)
    ("phrase.digital_arrest", "ta", "நீங்கள் டிஜிட்டல் கைது செய்யப்பட்டுள்ளீர்கள். வீடியோ அழைப்பை துண்டிக்க வேண்டாம்."),
    ("phrase.digital_arrest", "bn", "আপনাকে ডিজিটাল অ্যারেস্ট করা হয়েছে, ভিডিও কল কাটবেন না।"),
    ("phrase.digital_arrest", "ur", "آپ ڈیجیٹل گرفتاری میں ہیں، ویڈیو کال بند نہ کریں۔"),
    ("phrase.kyc_threat", "bn", "আপনার KYC আপডেট হয়নি, আজ রাতে অ্যাকাউন্ট ব্লক হবে।"),
    ("phrase.kyc_threat", "te", "మీ KYC అప్డేట్ కాలేదు, ఈరోజు ఖాతా బ్లాక్ అవుతుంది."),
    ("phrase.kyc_threat", "kn", "ನಿಮ್ಮ KYC ಅಪ್ಡೇಟ್ ಆಗಿಲ್ಲ, ಇಂದು ಖಾತೆ ಬ್ಲಾಕ್ ಆಗುತ್ತದೆ."),
    ("phrase.electricity_cut", "mr", "तुमचे वीज बिल भरलेले नसल्यामुळे आज रात्री वीज पुरवठा खंडित केला जाईल."),
    ("phrase.electricity_cut", "ta", "உங்கள் மின் பில் செலுத்தப்படவில்லை, இன்று இரவு மின்சாரம் துண்டிக்கப்படும்."),
    ("phrase.task_job", "te", "యూట్యూబ్ వీడియోలకు లైక్ చేస్తే రోజుకు 5000 రూపాయలు."),
    ("phrase.task_job", "bn", "প্রতিদিন ঘরে বসে 3000 টাকা আয় করুন।"),
    ("phrase.advance_fee", "kn", "ಬಹುಮಾನ ಪಡೆಯಲು ಪ್ರೊಸೆಸಿಂಗ್ ಫೀಸ್ ಪಾವತಿಸಿ."),
    ("phrase.lottery_prize", "kn", "ನೀವು KBC ಲಕ್ಕಿ ಡ್ರಾದಲ್ಲಿ 25 ಲಕ್ಷ ಗೆದ್ದಿದ್ದೀರಿ."),
    ("phrase.lottery_prize", "bn", "অভিনন্দন! আপনি লটারিতে ১০ লাখ টাকা জিতেছেন।"),
    ("phrase.relative_trouble", "pa", "ਮੇਰਾ ਐਕਸੀਡੈਂਟ ਹੋ ਗਿਆ ਹੈ ਤੇ ਹਸਪਤਾਲ ਵਿੱਚ ਹਾਂ, ਜਲਦੀ ਪੈਸੇ ਭੇਜੋ।"),
    ("phrase.relative_trouble", "bn", "আমার অ্যাক্সিডেন্ট হয়েছে, হাসপাতালে আছি, এখনই টাকা পাঠাও।"),
    ("phrase.relative_trouble", "ta", "எனக்கு விபத்து, மருத்துவமனையில் இருக்கிறேன், உடனே பணம் அனுப்புங்கள்."),
    ("phrase.relative_trouble", "te", "నాకు ప్రమాదం జరిగింది, ఆసుపత్రిలో ఉన్నాను, వెంటనే డబ్బు పంపండి."),
    ("phrase.relative_trouble", "kn", "ನನಗೆ ಅಪಘಾತವಾಗಿದೆ, ಆಸ್ಪತ್ರೆಯಲ್ಲಿದ್ದೇನೆ, ತಕ್ಷಣ ಹಣ ಕಳುಹಿಸಿ."),
    ("phrase.relative_trouble", "ml", "എനിക്ക് അപകടം പറ്റി, ആശുപത്രിയിലാണ്, പെട്ടെന്ന് പണം അയയ്ക്കൂ."),
    ("phrase.relative_trouble", "mr", "माझा अपघात झाला, हॉस्पिटलमध्ये आहे, लगेच पैसे पाठवा."),
    ("phrase.relative_trouble", "ur", "میرا ایکسیڈنٹ ہو گیا ہے، ہسپتال میں ہوں، جلدی پیسے بھیجو۔"),
    ("phrase.relative_trouble", "or", "ମୋର ଦୁର୍ଘଟଣା ହୋଇଛି, ଡାକ୍ତରଖାନାରେ ଅଛି, ଶୀଘ୍ର ଟଙ୍କା ପଠାନ୍ତୁ।"),
    ("phrase.investment_guarantee", "ur", "ہر مہینے 30% گارنٹی منافع کمائیں۔"),
    ("phrase.loan_trap", "hi", "बिना CIBIL के तुरंत 5 लाख का लोन पाएं।"),
    ("phrase.loan_trap", "ta", "சிபில் இல்லாமல் உடனடி கடன்."),
    ("phrase.loan_trap", "ur", "سبل کے بغیر فوری قرض حاصل کریں۔"),
    ("phrase.loan_trap", "bn", "CIBIL ছাড়াই তাৎক্ষণিক লোন।"),
    ("phrase.remote_access", "en", "Sir download AnyDesk and tell me the 9 digit code."),
    ("phrase.remote_access", "en", "Install Team Viewer so I can fix your bank app."),
    ("payment.otp_request", "ml", "കാർഡ് ബ്ലോക്ക് ആകാതിരിക്കാൻ ഇപ്പോൾ വന്ന OTP പറഞ്ഞു തരൂ."),
    ("payment.otp_request", "ur", "بینک سے بول رہا ہوں، ابھی آیا OTP بتائیں۔"),
    ("payment.otp_request", "pa", "ਬੈਂਕ ਤੋਂ ਬੋਲ ਰਿਹਾ ਹਾਂ, ਹੁਣੇ ਆਇਆ OTP ਦੱਸੋ।"),
    ("payment.otp_request", "te", "మీ ఫోన్‌కి వచ్చిన OTP చెప్పండి."),
]


@pytest.mark.parametrize(("rule_id", "language", "text"), SCAMS, ids=[f"{r}-{lang}" for r, lang, _ in SCAMS])
def test_scam_is_caught(rule_id, language, text):
    result = check(text)
    assert rule_id in result.ids, f"[{language}] expected {rule_id}, got {result.ids}"
    # A lottery claim on its own is a medium rule by design (shown as suspicious);
    # everything here must at least never read as "no scam signs".
    assert result.floor >= 50


# --- genuine messages that share the scam's words -----------------------------

GENUINE = [
    # (why it is a trap, message)
    ("Tamil OTP SMS: states the code, says never tell anyone",
     "உங்கள் OTP 482913. இந்த OTP-ஐ யாரிடமும் சொல்ல வேண்டாம்."),
    ("Telugu: do not share the OTP (negation after the verb)", "మీ OTP ఎవరితోనూ షేర్ చేయవద్దు. -SBI"),
    ("Kannada: do not tell anyone", "OTP ಅನ್ನು ಯಾರಿಗೂ ಹೇಳಬೇಡಿ. -Canara Bank"),
    ("Bengali: do not tell anyone", "আপনার OTP কাউকে বলবেন না। -SBI"),
    ("Urdu: never tell (negation before the verb)", "اپنا OTP کسی کو مت بتائیں۔"),
    ("Punjabi: do not tell (negation before the verb)", "ਆਪਣਾ OTP ਕਿਸੇ ਨੂੰ ਨਾ ਦੱਸੋ।"),
    ("Malayalam: must not tell", "നിങ്ങളുടെ OTP ആരോടും പറയരുത്."),
    ("Odia: do not tell", "ଆପଣଙ୍କ OTP କାହାକୁ କୁହନ୍ତୁ ନାହିଁ।"),
    ("Marathi: do not tell", "तुमचा OTP कोणालाही सांगू नका."),
    ("Nepali: do not tell", "आफ्नो OTP कसैलाई नभन्नुहोस्।"),
    ("Maithili: do not tell", "अपन OTP ककरो नहि कहू।"),
    ("Flipkart: an OTP you are meant to give the delivery agent",
     "Your Flipkart order will be delivered today. Share OTP 5821 with the delivery agent only."),
    ("Bengali: dad in hospital, *I* am sending money", "বাবা হাসপাতালে আছেন, আমি টাকা পাঠাচ্ছি। চিন্তা কোরো না।"),
    ("Urdu: dad in hospital, I have sent money", "ابو ہسپتال میں ہیں، میں نے پیسے بھیج دیے ہیں۔"),
    ("Tamil: in hospital, I sent money", "அப்பா மருத்துவமனையில், நான் பணம் அனுப்பினேன்."),
    ("Telugu: in hospital, I sent money", "నాన్న ఆసుపత్రిలో ఉన్నారు, నేను డబ్బు పంపాను."),
    ("Kannada: in hospital, I have sent money", "ಅಪ್ಪ ಆಸ್ಪತ್ರೆಯಲ್ಲಿದ್ದಾರೆ, ನಾನು ಹಣ ಕಳುಹಿಸಿದ್ದೇನೆ."),
    ("Malayalam: in hospital, I sent money", "അച്ഛൻ ആശുപത്രിയിലാണ്, ഞാൻ പണം അയച്ചു."),
    ("Punjabi: in hospital, I have sent money", "ਪਾਪਾ ਹਸਪਤਾਲ ਵਿੱਚ ਹਨ, ਮੈਂ ਪੈਸੇ ਭੇਜ ਦਿੱਤੇ ਹਨ।"),
    ("Marathi: in hospital, I have sent money", "बाबा हॉस्पिटलमध्ये आहेत, मी पैसे पाठवले आहेत."),
    ("Odia: in hospital, I have sent money", "ବାପା ଡାକ୍ତରଖାନାରେ ଅଛନ୍ତି, ମୁଁ ଟଙ୍କା ପଠାଇଛି।"),
    ("Gujarati: in hospital, the bill came to 5,000", "પપ્પા હોસ્પિટલમાં છે, બિલ 5,000 રૂપિયા આવ્યું."),
    ("Kerala runs a real state lottery; its results are shared everywhere",
     "കേരള ലോട്ടറി ഫലം: ഒന്നാം സമ്മാനം 75 ലക്ഷം രൂപ."),
    ("Marathi maintenance notice: a power cut, but no bill",
     "देखभाल कामासाठी उद्या सकाळी 10 ते 2 वीज पुरवठा खंडित राहील."),
    ("Tamil: electricity bill paid, thank you", "உங்கள் மின் பில் ₹850 செலுத்தப்பட்டது. நன்றி."),
    ("Bengali: new account opened", "আপনার নতুন অ্যাকাউন্ট খোলা হয়েছে। ধন্যবাদ।"),
    ("Urdu: the shop is closed today (بند is also 'blocked')", "دکان آج بند ہے، کل آنا۔"),
    ("Punjabi: the shop is closed today", "ਅੱਜ ਦੁਕਾਨ ਬੰਦ ਹੈ, ਕੱਲ੍ਹ ਆਉਣਾ।"),
    ("Hindi: talking about a KBC episode", "कल रात KBC में एक शिक्षक ने 25 लाख जीते, बहुत प्रेरणादायक था।"),
    ("English: 'ed' inside 'recorded' is not the Enforcement Directorate",
     "Your complaint has been recorded. We booked a video call with the doctor."),
    ("Bengali: a family chat about sending money", "মা, আমি তোমার ফোনে 2000 টাকা পাঠিয়ে দিয়েছি ওষুধের জন্য। পেলে জানিও।"),
    ("Real KYC reminder: visit the branch, bank never asks for OTP",
     "Please update your KYC by visiting your nearest HDFC Bank branch. HDFC Bank never asks for OTP or password."),
]


@pytest.mark.parametrize(("why", "text"), GENUINE, ids=[why for why, _ in GENUINE])
def test_genuine_message_is_not_flagged(why, text):
    result = check(text)
    assert result.floor < 40, f"false alarm ({why}): {result.ids}"


# --- tie-break on scam type --------------------------------------------------

def test_remote_access_decides_the_type_over_the_kyc_story():
    text = (
        "Paytm Customer Care: Your KYC is pending and wallet will be frozen. "
        "Please download AnyDesk and share the 9 digit code with us."
    )
    assert check(text).suggested_scam_type() == "fake_customer_care"


# --- the committed sample set, rules only -------------------------------------
#
# The same files scripts/eval.py sends to the live API. Running them here means a
# pattern change that breaks a sample fails the build, not the demo.

SAMPLES = Path(__file__).resolve().parents[2] / "samples"


def _committed_samples():
    with open(SAMPLES / "expected.csv", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            path = SAMPLES / row["file"]
            if path.suffix == ".txt" and path.exists():
                yield pytest.param(path, row["expected_level"], id=path.name)


@pytest.mark.parametrize(("path", "expected_level"), list(_committed_samples()))
def test_committed_sample(path, expected_level):
    result = check(path.read_text(encoding="utf-8"))
    if expected_level == "scam":
        assert result.floor >= SCAM_FLOOR, f"missed scam: {result.ids}"
    elif expected_level == "no_scam_signs":
        assert result.floor < 40, f"false alarm: {result.ids}"
