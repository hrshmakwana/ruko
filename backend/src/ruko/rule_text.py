"""Translated reasons for each rule.

A rule hit can appear as a red flag in the verdict, so the person must be able
to read it. `rules.py` keeps its English reason for logs and the eval table;
this file is what they actually see.

Templates may use {brand}, {real}, {tld} and {count}.
"""

from __future__ import annotations

REASONS: dict[str, dict[str, str]] = {
    "link.shortener": {
        "en": "A shortened link hides where it really goes. Never open one from a message you did not expect.",
        "hi": "छोटा किया गया लिंक छिपा देता है कि वह असल में कहाँ ले जाएगा। बिना उम्मीद वाले संदेश का ऐसा लिंक कभी न खोलें।",
        "gu": "ટૂંકી કરેલી લિંક છુપાવે છે કે તે ખરેખર ક્યાં લઈ જશે. અણધાર્યા સંદેશની આવી લિંક ક્યારેય ન ખોલો.",
    },
    "link.brand_lookalike": {
        "en": "This is not a {brand} website. The real one is {real}.",
        "hi": "यह {brand} की वेबसाइट नहीं है। असली वेबसाइट {real} है।",
        "gu": "આ {brand} ની વેબસાઇટ નથી. સાચી વેબસાઇટ {real} છે.",
    },
    "link.punycode": {
        "en": "This address uses look-alike letters from another alphabet to imitate a real site.",
        "hi": "इस पते में दूसरी लिपि के मिलते-जुलते अक्षर इस्तेमाल हुए हैं, ताकि असली साइट जैसा लगे।",
        "gu": "આ સરનામામાં બીજી લિપિના મળતા આવતા અક્ષરો વપરાયા છે, જેથી સાચી સાઇટ જેવું લાગે.",
    },
    "link.risky_tld": {
        "en": "Addresses ending in .{tld} are cheap to buy and are used for scams far more than anything else.",
        "hi": ".{tld} पर खत्म होने वाले पते सस्ते मिलते हैं और ज़्यादातर ठगी में ही इस्तेमाल होते हैं।",
        "gu": ".{tld} પર પૂરા થતા સરનામાં સસ્તાં મળે છે અને મોટે ભાગે છેતરપિંડીમાં જ વપરાય છે.",
    },
    "link.raw_ip": {
        "en": "A real company never sends you a bare numeric address instead of a website name.",
        "hi": "कोई असली कंपनी वेबसाइट के नाम की जगह सिर्फ़ अंकों वाला पता कभी नहीं भेजती।",
        "gu": "કોઈ સાચી કંપની વેબસાઇટના નામની જગ્યાએ ફક્ત આંકડાવાળું સરનામું ક્યારેય મોકલતી નથી.",
    },
    "link.apk_download": {
        "en": "This installs an app from outside the Play Store. That is how phones get taken over.",
        "hi": "यह Play Store के बाहर से ऐप इंस्टॉल करता है। फ़ोन इसी तरह दूसरों के कब्ज़े में जाता है।",
        "gu": "આ Play Store બહારથી એપ ઇન્સ્ટોલ કરે છે. ફોન આ જ રીતે બીજાના કબજામાં જાય છે.",
    },
    "payment.otp_request": {
        "en": "Nobody legitimate ever needs your OTP, PIN, CVV or password — not even your bank.",
        "hi": "आपका OTP, PIN, CVV या पासवर्ड किसी को भी नहीं चाहिए — आपके बैंक को भी नहीं।",
        "gu": "તમારો OTP, PIN, CVV કે પાસવર્ડ કોઈને પણ જોઈતો નથી — તમારી બેંકને પણ નહીં.",
    },
    "payment.upi_collect_trap": {
        "en": "You never enter your UPI PIN to receive money. Entering it sends money out.",
        "hi": "पैसे लेने के लिए UPI PIN कभी नहीं डाला जाता। PIN डालने से पैसे जाते हैं, आते नहीं।",
        "gu": "પૈસા લેવા માટે UPI PIN ક્યારેય નાખવાનો હોતો નથી. PIN નાખવાથી પૈસા જાય છે, આવતા નથી.",
    },
    "phrase.digital_arrest": {
        "en": "Real police never arrest anyone over a video call, and never ask for money to close a case.",
        "hi": "असली पुलिस वीडियो कॉल पर किसी को गिरफ़्तार नहीं करती, और केस बंद करने के पैसे नहीं माँगती।",
        "gu": "સાચી પોલીસ વીડિયો કૉલ પર કોઈની ધરપકડ કરતી નથી, અને કેસ બંધ કરવાના પૈસા માગતી નથી.",
    },
    "phrase.kyc_threat": {
        "en": "Banks do not suspend accounts over SMS, and never fix KYC through a link.",
        "hi": "बैंक SMS से खाता बंद नहीं करते, और KYC कभी लिंक से नहीं होता।",
        "gu": "બેંક SMS થી ખાતું બંધ કરતી નથી, અને KYC ક્યારેય લિંક દ્વારા થતું નથી.",
    },
    "phrase.electricity_cut": {
        "en": "Electricity boards send bills and notices, not same-night disconnection threats by SMS.",
        "hi": "बिजली विभाग बिल और नोटिस भेजता है, SMS पर उसी रात कनेक्शन काटने की धमकी नहीं।",
        "gu": "વીજ કંપની બિલ અને નોટિસ મોકલે છે, SMS પર એ જ રાતે કનેક્શન કાપવાની ધમકી નહીં.",
    },
    "phrase.parcel_customs": {
        "en": "Customs and couriers do not collect fees or read out case numbers over the phone.",
        "hi": "कस्टम और कूरियर फ़ोन पर पैसे नहीं लेते और न ही केस नंबर सुनाते हैं।",
        "gu": "કસ્ટમ અને કુરિયર ફોન પર પૈસા લેતા નથી કે કેસ નંબર સંભળાવતા નથી.",
    },
    "phrase.task_job": {
        "en": "No real job pays a daily amount for liking videos or rating hotels.",
        "hi": "कोई असली नौकरी वीडियो लाइक करने या होटल रेटिंग देने के रोज़ पैसे नहीं देती।",
        "gu": "કોઈ સાચી નોકરી વીડિયો લાઇક કરવા કે હોટેલ રેટિંગ આપવા રોજના પૈસા આપતી નથી.",
    },
    "phrase.investment_guarantee": {
        "en": "Guaranteed returns do not exist. SEBI-registered advisers are not allowed to promise them.",
        "hi": "गारंटीड रिटर्न होता ही नहीं। SEBI में पंजीकृत सलाहकार ऐसा वादा कर ही नहीं सकते।",
        "gu": "ગેરંટીવાળું વળતર હોતું જ નથી. SEBI માં નોંધાયેલા સલાહકારો એવું વચન આપી શકતા નથી.",
    },
    "phrase.lottery_prize": {
        "en": "You cannot win a lottery you never entered, and real prizes never need a fee first.",
        "hi": "जिस लॉटरी में आपने हिस्सा ही नहीं लिया, वह जीती नहीं जा सकती। असली इनाम के लिए पहले पैसे नहीं लगते।",
        "gu": "જે લોટરીમાં તમે ભાગ જ લીધો નથી તે જીતાય નહીં. સાચા ઇનામ માટે પહેલાં પૈસા ભરવાના હોતા નથી.",
    },
    "phrase.relative_trouble": {
        "en": "Check by calling the relative directly on the number you already have.",
        "hi": "जिस रिश्तेदार की बात हो रही है, उसे अपने पास पहले से मौजूद नंबर पर खुद फ़ोन करके पक्का करें।",
        "gu": "જે સગાની વાત થાય છે તેને તમારી પાસે પહેલેથી હોય તે નંબર પર જાતે ફોન કરીને ખાતરી કરો.",
    },
    "phrase.blackmail": {
        "en": "Do not pay and do not reply. Report it — paying makes the demands continue.",
        "hi": "पैसे न दें और जवाब न दें। शिकायत करें — पैसे देने से माँगें बंद नहीं होतीं, बढ़ती हैं।",
        "gu": "પૈસા ન આપો અને જવાબ ન આપો. ફરિયાદ કરો — પૈસા આપવાથી માગણી બંધ થતી નથી, વધે છે.",
    },
    "phrase.secrecy": {
        "en": "Being told to keep it secret is the tell. No real authority asks that.",
        "hi": "“किसी को मत बताना” ही सबसे बड़ा सुराग है। कोई असली अधिकारी ऐसा नहीं कहता।",
        "gu": "“કોઈને કહેશો નહીં” એ જ સૌથી મોટો સંકેત છે. કોઈ સાચો અધિકારી એવું કહેતો નથી.",
    },
    "phrase.urgency": {
        "en": "Manufactured urgency stops you checking. Nothing real expires in the next ten minutes.",
        "hi": "जल्दबाज़ी इसलिए मचाई जाती है ताकि आप जाँच न करें। असली कोई चीज़ दस मिनट में खत्म नहीं होती।",
        "gu": "ઉતાવળ એટલા માટે કરાવાય છે કે તમે તપાસ ન કરો. સાચી કોઈ વસ્તુ દસ મિનિટમાં પૂરી થતી નથી.",
    },
    "community.reported": {
        "en": "Other people have reported this {count} times.",
        "hi": "दूसरे लोग इसे {count} बार रिपोर्ट कर चुके हैं।",
        "gu": "બીજા લોકો આને {count} વાર રિપોર્ટ કરી ચૂક્યા છે.",
    },
    "ai.injection": {
        "en": "This message contains hidden instructions aimed at AI tools, telling them to call it safe. Only a scam needs to do that.",
        "hi": "इस संदेश में AI के लिए छिपे निर्देश हैं, ताकि AI इसे सुरक्षित बता दे। ऐसा सिर्फ़ ठगी में किया जाता है।",
        "gu": "આ સંદેશમાં AI માટે છુપા સૂચનો છે, જેથી AI તેને સલામત કહી દે. આવું ફક્ત છેતરપિંડીમાં જ થાય છે.",
    },
}


def reason_for(rule_id: str, language: str, fallback: str, params: dict | None = None) -> str:
    """The translated reason, or the English one if we have no translation."""
    template = REASONS.get(rule_id, {}).get(language)
    if not template:
        return fallback
    try:
        return template.format(**(params or {}))
    except (KeyError, IndexError):
        return fallback
