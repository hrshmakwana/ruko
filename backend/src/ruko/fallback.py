"""Text for the rules-only verdict.

Used when Bedrock is unreachable or returns nothing usable. The person still
gets a real answer from the rules rather than an error, marked as a partial
check so they know it was not the full analysis.
"""

from __future__ import annotations

_TEXT = {
    "en": {
        "scam": "This message has clear scam signs. Do not pay, click or reply.",
        "suspicious": "Something is wrong with this message. Slow down and check before you act.",
        "no_scam_signs": "We found no scam signs in this message.",
        "do_now": [
            "Do not open any link in this message.",
            "If it claims to be your bank, call the number printed on your card.",
            "Delete the message and block the sender.",
        ],
        "dont_do": [
            "Never share an OTP, PIN, CVV or password with anyone.",
            "Do not install an app that a message asks you to install.",
        ],
        "do_now_clean": [
            "If you did not expect this message, check with the sender on a number you already have.",
        ],
        "dont_do_clean": ["Never share an OTP, PIN or password, whoever is asking."],
    },
    "hi": {
        "scam": "इस संदेश में धोखे के साफ़ लक्षण हैं। पैसे न भेजें, लिंक न खोलें, जवाब न दें।",
        "suspicious": "इस संदेश में कुछ गड़बड़ है। कुछ भी करने से पहले रुककर जाँच लें।",
        "no_scam_signs": "इस संदेश में धोखे के लक्षण नहीं मिले।",
        "do_now": [
            "इस संदेश का कोई भी लिंक न खोलें।",
            "अगर यह बैंक के नाम से है, तो अपने कार्ड पर लिखे नंबर पर फ़ोन करें।",
            "संदेश हटा दें और भेजने वाले को ब्लॉक करें।",
        ],
        "dont_do": [
            "OTP, PIN, CVV या पासवर्ड किसी को भी न बताएं।",
            "संदेश में कहा गया कोई ऐप इंस्टॉल न करें।",
        ],
        "do_now_clean": [
            "अगर यह संदेश अपेक्षित नहीं था, तो भेजने वाले से पहले से मौजूद नंबर पर पुष्टि करें।",
        ],
        "dont_do_clean": ["OTP, PIN या पासवर्ड किसी को न बताएं, चाहे कोई भी माँगे।"],
    },
    "gu": {
        "scam": "આ સંદેશમાં છેતરપિંડીના સ્પષ્ટ ચિહ્ન છે. પૈસા ન મોકલો, લિંક ન ખોલો, જવાબ ન આપો.",
        "suspicious": "આ સંદેશમાં કંઈક ખોટું છે. કંઈ પણ કરતાં પહેલાં થોભીને તપાસો.",
        "no_scam_signs": "આ સંદેશમાં છેતરપિંડીના ચિહ્ન મળ્યા નથી.",
        "do_now": [
            "આ સંદેશની કોઈ પણ લિંક ન ખોલો.",
            "જો આ બેંકના નામે હોય, તો તમારા કાર્ડ પર લખેલા નંબર પર ફોન કરો.",
            "સંદેશ કાઢી નાખો અને મોકલનારને બ્લોક કરો.",
        ],
        "dont_do": [
            "OTP, PIN, CVV કે પાસવર્ડ કોઈને પણ ન આપો.",
            "સંદેશમાં કહેલી કોઈ એપ ઇન્સ્ટોલ ન કરો.",
        ],
        "do_now_clean": [
            "જો આ સંદેશ અપેક્ષિત ન હતો, તો મોકલનારને પહેલેથી હોય તે નંબર પર પૂછીને ખાતરી કરો.",
        ],
        "dont_do_clean": ["OTP, PIN કે પાસવર્ડ કોઈને ન આપો, ભલે કોઈ પણ માગે."],
    },
}


def text(language: str) -> dict:
    return _TEXT.get(language, _TEXT["en"])
