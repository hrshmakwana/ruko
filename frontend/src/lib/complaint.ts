import type { ComplaintPack, Verdict } from "../types";

const SCAM_TYPE_PHRASE: Record<string, string> = {
  digital_arrest: "impersonating police / a 'digital arrest' call",
  kyc_update: "a fake KYC update request",
  electricity_bill: "a fake electricity bill disconnection threat",
  parcel_customs: "a fake parcel / customs charge",
  upi_refund_collect: "a fake UPI refund that was really a collect request",
  investment_trading: "a fake investment or trading scheme",
  task_job: "a task-based job scam",
  lottery_prize: "a fake lottery or prize claim",
  loan_app: "a predatory loan app",
  fake_customer_care: "a fake customer care number",
  relative_in_trouble: "someone posing as a relative in trouble",
  blackmail: "blackmail / sextortion",
  other_scam: "an online fraud attempt",
  none_detected: "a suspicious message",
};

/** Build the complaint the person can paste into cybercrime.gov.in.
 *
 * Everything here already exists in the verdict — the value is purely in having
 * it laid out the way the portal asks for it, at the moment when nobody can
 * think straight. It is written in English because that is what the portal and
 * the 1930 operators work in. */
export function buildComplaint(verdict: Verdict): ComplaintPack {
  const now = new Date();
  const dateTime = now.toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const contact =
    verdict.extracted.upi_ids[0] ??
    verdict.extracted.phone_numbers[0] ??
    verdict.extracted.urls[0] ??
    null;

  const phrase = SCAM_TYPE_PHRASE[verdict.scam_type] ?? SCAM_TYPE_PHRASE.other_scam;
  const description =
    `I received a fraudulent message which appears to be ${phrase}. ` +
    `I acted on it and money has been taken from my account. ` +
    `I am reporting this immediately so the transaction can be frozen.`;

  const pack: Omit<ComplaintPack, "text"> = {
    date_time: dateTime,
    amount: verdict.extracted.amounts[0] ?? null,
    transaction_id: verdict.extracted.transaction_ids[0] ?? null,
    scammer_contact: contact,
    platform: verdict.extracted.platform,
    description,
  };

  const line = (label: string, value: string | null) => `${label}: ${value ?? "(please fill in)"}`;

  const text = [
    "CYBER FRAUD COMPLAINT",
    "",
    line("Date and time of incident", pack.date_time),
    line("Amount lost", pack.amount),
    line("Transaction / UTR ID", pack.transaction_id),
    line("Scammer's number / UPI ID / website", pack.scammer_contact),
    line("Platform used", pack.platform),
    "",
    "What happened:",
    pack.description,
    "",
    "Evidence I can provide: the original message and a screenshot.",
  ].join("\n");

  return { ...pack, text };
}
