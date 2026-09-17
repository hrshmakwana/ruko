import type { Language } from "../types";

/** The warning someone forwards to their family.
 *
 * The point of this feature: people already forward scams to their family
 * group — usually the scam itself, sometimes with "is this real?" attached,
 * which spreads the thing. This gives them the *warning* to forward instead.
 *
 * Opens WhatsApp with a wa.me link. No API, no Business account, no cost.
 */
export interface WarnStrings {
  /** Leading line of the forwarded message. */
  lead: string;
  /** Closing line, before the link. */
  tail: string;
}

const dictionaries: Record<Language, WarnStrings> = {
  en: {
    lead: "⚠️ Careful — I just checked this and it is a scam:",
    tail: "Do not pay, do not tap any link, and never share an OTP. Check anything suspicious here:",
  },
  hi: {
    lead: "⚠️ सावधान — मैंने अभी जाँचा, यह धोखा है:",
    tail: "पैसे न भेजें, कोई लिंक न खोलें, और OTP किसी को न बताएं। कुछ भी संदिग्ध यहाँ जाँचें:",
  },
  bn: {
    lead: "⚠️ সাবধান — আমি এইমাত্র যাচাই করলাম, এটি প্রতারণা:",
    tail: "টাকা দেবেন না, কোনও লিঙ্কে চাপবেন না, OTP কাউকে জানাবেন না। সন্দেহজনক কিছু এখানে যাচাই করুন:",
  },
  mr: {
    lead: "⚠️ सावध — मी आत्ताच तपासले, ही फसवणूक आहे:",
    tail: "पैसे देऊ नका, कोणतीही लिंक उघडू नका, OTP कोणालाही सांगू नका. संशयास्पद काहीही इथे तपासा:",
  },
  te: {
    lead: "⚠️ జాగ్రత్త — నేను ఇప్పుడే పరిశీలించాను, ఇది మోసం:",
    tail: "డబ్బు ఇవ్వవద్దు, ఏ లింక్ తెరవవద్దు, OTP ఎవరికీ చెప్పవద్దు. అనుమానాస్పదమైనది ఇక్కడ పరిశీలించండి:",
  },
  ta: {
    lead: "⚠️ கவனம் — நான் இப்போதுதான் சரிபார்த்தேன், இது மோசடி:",
    tail: "பணம் தராதீர்கள், எந்த இணைப்பையும் திறக்காதீர்கள், OTP யாரிடமும் சொல்லாதீர்கள். சந்தேகமானதை இங்கே சரிபாருங்கள்:",
  },
  gu: {
    lead: "⚠️ સાવધાન — મેં હમણાં જ તપાસ્યું, આ છેતરપિંડી છે:",
    tail: "પૈસા ન આપો, કોઈ લિંક ન ખોલો, OTP કોઈને ન કહો. શંકાસ્પદ કંઈ પણ અહીં તપાસો:",
  },
  ur: {
    lead: "⚠️ خبردار — میں نے ابھی جانچا، یہ فراڈ ہے:",
    tail: "پیسے نہ دیں، کوئی لنک نہ کھولیں، OTP کسی کو نہ بتائیں۔ کوئی بھی مشکوک چیز یہاں جانچیں:",
  },
  kn: {
    lead: "⚠️ ಎಚ್ಚರ — ನಾನು ಈಗಷ್ಟೇ ಪರಿಶೀಲಿಸಿದೆ, ಇದು ಮೋಸ:",
    tail: "ಹಣ ಕೊಡಬೇಡಿ, ಯಾವ ಲಿಂಕ್ ತೆರೆಯಬೇಡಿ, OTP ಯಾರಿಗೂ ಹೇಳಬೇಡಿ. ಸಂಶಯಾಸ್ಪದವಾದದ್ದನ್ನು ಇಲ್ಲಿ ಪರಿಶೀಲಿಸಿ:",
  },
  or: {
    lead: "⚠️ ସାବଧାନ — ମୁଁ ଏବେ ଯାଞ୍ଚ କଲି, ଏହା ଠକାମି:",
    tail: "ଟଙ୍କା ଦିଅନ୍ତୁ ନାହିଁ, କୌଣସି ଲିଙ୍କ ଖୋଲନ୍ତୁ ନାହିଁ, OTP କାହାରିକୁ କୁହନ୍ତୁ ନାହିଁ। ସନ୍ଦେହଜନକ କିଛି ଏଠାରେ ଯାଞ୍ଚ କରନ୍ତୁ:",
  },
  ml: {
    lead: "⚠️ ശ്രദ്ധിക്കുക — ഞാൻ ഇപ്പോൾ പരിശോധിച്ചു, ഇത് തട്ടിപ്പാണ്:",
    tail: "പണം നൽകരുത്, ഒരു ലിങ്കും തുറക്കരുത്, OTP ആരോടും പറയരുത്. സംശയമുള്ളത് ഇവിടെ പരിശോധിക്കുക:",
  },
  pa: {
    lead: "⚠️ ਸਾਵਧਾਨ — ਮੈਂ ਹੁਣੇ ਜਾਂਚਿਆ, ਇਹ ਠੱਗੀ ਹੈ:",
    tail: "ਪੈਸੇ ਨਾ ਦਿਓ, ਕੋਈ ਲਿੰਕ ਨਾ ਖੋਲ੍ਹੋ, OTP ਕਿਸੇ ਨੂੰ ਨਾ ਦੱਸੋ। ਕੋਈ ਵੀ ਸ਼ੱਕੀ ਚੀਜ਼ ਇੱਥੇ ਜਾਂਚੋ:",
  },
  as: {
    lead: "⚠️ সাৱধান — মই এইমাত্ৰ পৰীক্ষা কৰিলোঁ, এইটো প্ৰতাৰণা:",
    tail: "টকা নিদিব, কোনো লিংক নুখুলিব, OTP কাকো নক'ব। সন্দেহজনক যিকোনো বস্তু ইয়াত পৰীক্ষা কৰক:",
  },
  mai: {
    lead: "⚠️ सावधान — हम अखने जाँचलहुँ, ई ठकी अछि:",
    tail: "पाइ नहि दिअ, कोनो लिंक नहि खोलू, OTP ककरो नहि कहू। कोनो संदेहजनक चीज एतऽ जाँचू:",
  },
  ne: {
    lead: "⚠️ होसियार — मैले भर्खरै जाँचें, यो ठगी हो:",
    tail: "पैसा नदिनुहोस्, कुनै लिंक नखोल्नुहोस्, OTP कसैलाई नभन्नुहोस्। शंकास्पद कुनै कुरा यहाँ जाँच्नुहोस्:",
  },
};

export function warnFor(language: Language): WarnStrings {
  return dictionaries[language] ?? dictionaries.en;
}

const APP_URL =
  import.meta.env.VITE_SITE_URL ?? "https://main.d1qvcci82uzrvx.amplifyapp.com/check";

/** Build the WhatsApp share link for a verdict. */
export function whatsappWarningUrl(
  language: Language,
  headline: string,
  scamTypeLabel: string,
): string {
  const w = warnFor(language);
  const body = [w.lead, "", `${scamTypeLabel} — ${headline}`, "", w.tail, APP_URL].join("\n");
  return `https://wa.me/?text=${encodeURIComponent(body)}`;
}
