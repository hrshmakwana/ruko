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
      ? "This looks like a fake KYC message trying to steal your bank login."
      : linky
        ? "This message contains a link we cannot verify."
        : "We found no scam signs in this message.",
    red_flags: scammy
      ? [
          {
            evidence: "your account will be blocked today",
            why: "Real banks do not threaten to block an account the same day over SMS.",
            source: "rule",
          },
          {
            evidence: "sbi-kyc-verify.in",
            why: "This is not an SBI website. The real one is onlinesbi.sbi",
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
    do_now: scammy
      ? [
          "Do not open the link.",
          "Call the number printed on the back of your bank card.",
          "Delete the message and block the sender.",
        ]
      : ["If you did not expect this message, verify with the sender on a number you already have."],
    dont_do: ["Never share an OTP, PIN or password, not even with a bank employee."],
    extracted: {
      urls: linky ? ["sbi-kyc-verify.in"] : [],
      upi_ids: [],
      phone_numbers: [],
      amounts: [],
      transaction_ids: [],
      sender_name: null,
      platform: null,
    },
    community: scammy ? [{ masked: "sbi-kyc-xxxx.in", report_count: 7 }] : [],
    language: req.language,
    rule_hits: ["mock.local"],
    partial: false,
    engine: "stub",
  };
}
