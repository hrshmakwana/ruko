import type { CheckRequest, Language, Verdict } from "../types";
import { mockCheck } from "./mock";

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

/** With no API URL configured we run against a local mock so the UI is still
 *  workable offline. The Check screen shows a badge when this is on. */
export const IS_MOCK = API_URL === "";

export class ApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("network", "network");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const code = (data as { error?: { code?: string } })?.error?.code ?? "http_error";
    throw new ApiError(code, `${path} failed with ${res.status}`);
  }
  return data as T;
}

export async function checkMessage(req: CheckRequest): Promise<Verdict> {
  if (IS_MOCK) return mockCheck(req);
  return post<Verdict>("/check", req);
}

interface UploadUrlResponse {
  upload_url: string;
  key: string;
  headers: Record<string, string>;
}

/** Ask for a presigned PUT, then send the image straight to S3. */
export async function uploadImage(blob: Blob, contentType: string): Promise<string> {
  if (IS_MOCK) return "uploads/mock-key.jpg";

  const presigned = await post<UploadUrlResponse>("/upload-url", {
    content_type: contentType,
    size_bytes: blob.size,
  });

  const put = await fetch(presigned.upload_url, {
    method: "PUT",
    headers: presigned.headers,
    body: blob,
  });
  if (!put.ok) throw new ApiError("upload_failed", `upload failed with ${put.status}`);

  return presigned.key;
}

export async function reportScam(checkId: string): Promise<{ ok: boolean }> {
  if (IS_MOCK) return { ok: true };
  return post<{ ok: boolean }>("/report", { check_id: checkId });
}

export async function health(): Promise<unknown> {
  if (IS_MOCK) return { ok: true, mock: true };
  const res = await fetch(`${API_URL}/health`);
  return res.json();
}

export type { Language };

export interface LiveToken {
  url: string;
  language: Language;
  stream_language: string;
  borrowed: boolean;
  sample_rate: number;
  expires_in: number;
  max_seconds: number;
}

/** A short-lived signed WebSocket URL for Amazon Transcribe streaming. The audio
 *  goes from the phone straight to Transcribe; it never passes through Ruko. */
export async function liveToken(language: Language): Promise<LiveToken> {
  return post<LiveToken>("/live/token", { language });
}

export interface LiveAlert {
  rule: string;
  evidence: string;
  why: string;
  severity: "high" | "medium" | "low";
}

export interface LiveVerdict {
  risk_level: "no_scam_signs" | "suspicious" | "scam";
  risk_score: number;
  scam_type: string;
  alerts: LiveAlert[];
  language: Language;
  /** True once the family has been told about this call. */
  family_told?: boolean;
  /** One sentence about the call, written by the model on a deep pass. */
  headline?: string;
  engine?: string;
}

/** Run the rules over what has been heard so far. Nothing is stored. */
export async function liveAnalyse(
  text: string,
  language: Language,
  familyCode?: string | null,
  deep = false,
): Promise<LiveVerdict> {
  if (IS_MOCK) {
    const lower = text.toLowerCase();
    const hit = /otp|digital arrest|anydesk|upi pin/.test(lower);
    return {
      risk_level: hit ? "scam" : "no_scam_signs",
      risk_score: hit ? 80 : 0,
      scam_type: hit ? "other_scam" : "none_detected",
      alerts: hit
        ? [
            {
              rule: "payment.otp_request",
              evidence: "OTP",
              why: "Nobody legitimate ever needs your OTP — not even your bank.",
              severity: "high",
            },
          ]
        : [],
      language,
    };
  }
  return post<LiveVerdict>("/live/analyse", {
    text,
    language,
    family_code: familyCode ?? undefined,
    deep,
  });
}
