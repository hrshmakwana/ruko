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
