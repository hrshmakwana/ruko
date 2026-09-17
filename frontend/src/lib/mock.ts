import type { CheckRequest, Verdict } from "../types";

/** Local stand-in for the API, used only when VITE_API_URL is unset.
 *
 * It is deliberately crude — just enough keyword matching to exercise all three
 * risk levels in the UI while the real backend is being built. */
export async function mockCheck(req: CheckRequest): Promise<Verdict> {
  await new Promise((r) => setTimeout(r, 900));

  const text = (req.text ?? "").toLowerCase();
  const scammy = /kyc|otp|blocked|block ho|suspend|arrest|refund|lottery|urgent|expire/.test(text);
  const linky = /https?:\/\/|www\.|\.in\b|\.xyz\b|bit\.ly/.test(text);
  const score = scammy ? 88 : linky ? 55 : 12;

  return {
    check_id: `mock-${Date.now()}`,
    risk_level: score >= 75 ? "scam" : score >= 40 ? "suspicious" : "no_scam_signs",
    risk_score: score,
    scam_type: scammy ? "kyc_update" : linky ? "other_scam" : "none_detected",
    headline: scammy
      ? "This is a fake SBI message built to steal your netbanking password."
      : linky
        ? "This message contains a link we cannot verify."
        : "We found no scam signs in this message.",
    red_flags: scammy
      ? [
          {
            evidence: "blocked today",
            why: "Real banks never threaten to block an account the same day over SMS.",
            source: "rule",
          },
          {
            evidence: "sbi-kyc-verify.in",
            why: "Not an SBI website. SBI only uses onlinesbi.sbi and sbi.co.in.",
            source: "rule",
          },
          {
            evidence: "9876543210",
            why: "A personal mobile number. SBI calls from a short code, never a 10-digit mobile.",
            source: "rule",
          },
        ]
      : linky
        ? [
            {
              evidence: "link",
              why: "Links in unexpected messages are the most common way money is stolen.",
              source: "rule",
            },
          ]
        : [],
    consequence_chain: scammy
      ? [
          { step: "You tap the link because the message says today." },
          { step: "A page opens that looks exactly like SBI netbanking." },
          { step: "You type your username, password and the OTP that arrives." },
          { step: "They log in as you and empty the account in under 4 minutes.", is_loss: true },
        ]
      : [],
    do_now: scammy
      ? [
          "Do not open the link.",
          "Call the number printed on the back of your bank card.",
          "Delete the message and block the sender.",
        ]
      : ["If you did not expect this message, verify with the sender on a number you already have."],
    dont_do: scammy
      ? [
          "Never share an OTP, PIN or password, not even with a bank employee.",
          "Do not install any app this message asks you to install.",
        ]
      : ["Never share an OTP, PIN or password, not even with a bank employee."],
    callback_script: scammy
      ? "I do not discuss my account on calls I did not make. I will call my bank on the number printed on my card."
      : null,
    teach_me: scammy
      ? "A bank will never send you a link to fix your KYC. Real KYC is done in the branch or in the bank's own app."
      : null,
    complaint: null,
    extracted: {
      urls: linky ? ["sbi-kyc-verify.in"] : [],
      upi_ids: [],
      phone_numbers: scammy ? ["9876543210"] : [],
      amounts: [],
      transaction_ids: [],
      sender_name: null,
      platform: "SMS",
    },
    community: scammy
      ? [
          { masked: "sbi-kyc-xxxx.in", report_count: 7 },
          { masked: "98xxxxxx10", report_count: 3 },
        ]
      : [],
    language: req.language,
    rule_hits: ["mock.local"],
    partial: false,
    engine: "stub",
  };
}
