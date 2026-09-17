export type { Language } from "./i18n/languages";
import type { Language } from "./i18n/languages";

export type RiskLevel = "no_scam_signs" | "suspicious" | "scam";

export type ScamType =
  | "digital_arrest"
  | "kyc_update"
  | "electricity_bill"
  | "parcel_customs"
  | "upi_refund_collect"
  | "investment_trading"
  | "task_job"
  | "lottery_prize"
  | "loan_app"
  | "fake_customer_care"
  | "relative_in_trouble"
  | "blackmail"
  | "other_scam"
  | "none_detected";

export interface RedFlag {
  /** Short exact snippet from the message, used to highlight the original text. */
  evidence: string;
  why: string;
  source: "rule" | "model";
}

export interface Extracted {
  urls: string[];
  upi_ids: string[];
  phone_numbers: string[];
  amounts: string[];
  transaction_ids: string[];
  sender_name: string | null;
  platform: string | null;
}

export interface CommunityHit {
  masked: string;
  report_count: number;
}

/** One step in "what they are trying to do to you". The last step is the loss. */
export interface ConsequenceStep {
  step: string;
  /** Set on the final step so the UI can render it as the outcome. */
  is_loss?: boolean;
}

export interface ComplaintPack {
  date_time: string;
  amount: string | null;
  transaction_id: string | null;
  scammer_contact: string | null;
  platform: string | null;
  description: string;
  /** Pre-rendered plain text, ready to paste into cybercrime.gov.in. */
  text: string;
}

export interface Verdict {
  check_id: string;
  risk_level: RiskLevel;
  risk_score: number;
  scam_type: ScamType;
  headline: string;
  red_flags: RedFlag[];
  do_now: string[];
  dont_do: string[];
  extracted: Extracted;
  community: CommunityHit[];
  /** What the scammer is trying to make happen, step by step. */
  consequence_chain: ConsequenceStep[];
  /** Two lines to say if they ring back, in the chosen language. */
  callback_script: string | null;
  /** One line: how to spot this kind of message next time. */
  teach_me: string | null;
  /** Only present once the person says they already paid. */
  complaint: ComplaintPack | null;
  language: Language;
  /** Debug only, never rendered. */
  rule_hits: string[];
  partial: boolean;
  engine: "stub" | "rules" | "model";
}

export interface CheckRequest {
  text?: string;
  image_key?: string;
  language: Language;
  family_code?: string;
}
