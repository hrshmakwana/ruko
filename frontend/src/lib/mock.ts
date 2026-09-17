import type { CheckRequest, ScamType, Verdict } from "../types";

/** Local stand-in for the API, used only when VITE_API_URL is unset.
 *
 * Crude on purpose — keyword matching, no model — but it recognises the three
 * example messages so the UI can be exercised end to end before the backend is
 * deployed. The Check screen shows a "demo mode" badge whenever this is live. */

interface Canned {
  type: ScamType;
  score: number;
  headline: string;
  flags: { evidence: string; why: string }[];
  chain: string[];
  script: string;
  teach: string;
  community: { masked: string; report_count: number }[];
}

const KYC: Canned = {
  type: "kyc_update",
  score: 88,
  headline: "This is a fake SBI message built to steal your netbanking password.",
  flags: [
    {
      evidence: "blocked today",
      why: "Real banks never threaten to block an account the same day over SMS.",
    },
    {
      evidence: "sbi-kyc-verify.in",
      why: "Not an SBI website. SBI only uses onlinesbi.sbi and sbi.co.in.",
    },
    {
      evidence: "9876543210",
      why: "A personal mobile number. SBI calls from a short code, never a 10-digit mobile.",
    },
  ],
  chain: [
    "You tap the link because the message says today.",
    "A page opens that looks exactly like SBI netbanking.",
    "You type your username, password and the OTP that arrives.",
    "They log in as you and empty the account in under 4 minutes.",
  ],
  script:
    "I do not discuss my account on calls I did not make. I will call my bank on the number printed on my card.",
  teach:
    "A bank will never send you a link to fix your KYC. Real KYC is done in the branch or in the bank's own app.",
  community: [
    { masked: "sbi-kyc-xxxx.in", report_count: 14 },
    { masked: "98xxxxxx10", report_count: 21 },
  ],
};

const UPI: Canned = {
  type: "upi_refund_collect",
  score: 92,
  headline: "This is not a refund. Entering your PIN would send your money to them.",
  flags: [
    {
      evidence: "enter your UPI PIN",
      why: "You never enter a UPI PIN to receive money. A PIN only ever sends money out.",
    },
    {
      evidence: "accept the payment request",
      why: "That is a collect request. Accepting it takes money from you, it does not give you any.",
    },
    {
      evidence: "refund of Rs 4,999",
      why: "A real refund arrives on its own. Nobody has to ask you to approve it.",
    },
  ],
  chain: [
    "They send a UPI collect request that looks like a refund.",
    "Your app asks for your PIN to 'approve' it.",
    "You enter the PIN, believing money is coming in.",
    "₹4,999 leaves your account instead, and cannot be recalled.",
  ],
  script:
    "I am not approving any request. If you sent money by mistake, raise it with your own bank.",
  teach: "Money coming in never needs your PIN. If a PIN is asked for, money is going out.",
  community: [{ masked: "rexxxx@okaxis", report_count: 17 }],
};

const ARREST: Canned = {
  type: "digital_arrest",
  score: 96,
  headline: "Nobody can arrest you over a video call. This is a fake police call.",
  flags: [
    {
      evidence: "Delhi Cyber Crime Branch",
      why: "Police do not contact people this way, and never open a case with a phone call.",
    },
    {
      evidence: "video call",
      why: "There is no such thing as a 'digital arrest'. No real investigation happens on a video call.",
    },
    {
      evidence: "Do not tell anyone",
      why: "Secrecy is the tell. Real police never ask you to hide it from your family.",
    },
    {
      evidence: "non-bailable warrant",
      why: "Legal threats over the phone are pressure, not law. Warrants are served in person.",
    },
  ],
  chain: [
    "They keep you on a video call so you cannot ask anyone.",
    "Fake officers and fake documents make the case feel real.",
    "You are told to move money to a 'verification account' to clear your name.",
    "The money is gone within minutes, and there was never a case.",
  ],
  script:
    "I do not accept police matters over a phone call. I am hanging up and going to my local police station myself.",
  teach:
    "No police force in India arrests anyone over a video call, and none will ever ask you to transfer money.",
  community: [{ masked: "98xxxxxx78", report_count: 11 }],
};

function classify(text: string): Canned | null {
  const t = text.toLowerCase();
  if (/arrest|cbi|cyber crime|warrant|narcotic|parcel.*illegal|पुलिस|ધરપકડ/.test(t)) return ARREST;
  if (/upi pin|collect|refund|रिफंड|રિફંડ/.test(t)) return UPI;
  if (/kyc|blocked|suspend|expire|केवाईसी|બ્લોક/.test(t)) return KYC;
  return null;
}

export async function mockCheck(req: CheckRequest): Promise<Verdict> {
  await new Promise((r) => setTimeout(r, 1100));

  const text = req.text ?? "";
  const canned = classify(text);
  const linky = /https?:\/\/|www\.|\.in\b|\.xyz\b|bit\.ly/.test(text.toLowerCase());
  const score = canned ? canned.score : linky ? 55 : 12;

  return {
    check_id: `mock-${Date.now()}`,
    risk_level: score >= 75 ? "scam" : score >= 40 ? "suspicious" : "no_scam_signs",
    risk_score: score,
    scam_type: canned ? canned.type : linky ? "other_scam" : "none_detected",
    headline: canned
      ? canned.headline
      : linky
        ? "This message contains a link we cannot verify."
        : "We found no scam signs in this message.",
    red_flags: canned
      ? canned.flags.map((f) => ({ ...f, source: "rule" as const }))
      : linky
        ? [
            {
              evidence: "link",
              why: "Links in unexpected messages are the most common way money is stolen.",
              source: "rule" as const,
            },
          ]
        : [],
    consequence_chain: canned
      ? canned.chain.map((step, i) => ({ step, is_loss: i === canned.chain.length - 1 }))
      : [],
    do_now: canned
      ? [
          "Do not reply, tap anything or pay.",
          "If it claims to be your bank, call the number printed on your card.",
          "Delete the message and block the sender.",
        ]
      : ["If you did not expect this message, verify with the sender on a number you already have."],
    dont_do: [
      "Never share an OTP, PIN or password, not even with a bank employee.",
      ...(canned ? ["Do not install any app this message asks you to install."] : []),
    ],
    callback_script: canned ? canned.script : null,
    teach_me: canned ? canned.teach : null,
    complaint: null,
    extracted: {
      urls: linky ? ["sbi-kyc-verify.in"] : [],
      upi_ids: canned === UPI ? ["refund@okaxis"] : [],
      phone_numbers: /9876543210/.test(text) ? ["9876543210"] : [],
      amounts: /4,?999/.test(text) ? ["₹4,999"] : [],
      transaction_ids: [],
      sender_name: null,
      platform: "SMS",
    },
    community: canned ? canned.community : [],
    language: req.language,
    screenshot_text: null,
    image_unread: false,
    rule_hits: ["mock.local"],
    partial: false,
    engine: "stub",
  };
}
