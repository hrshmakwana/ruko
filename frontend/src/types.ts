export type Language = "en" | "hi" | "gu";

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
