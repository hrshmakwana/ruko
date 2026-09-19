import type { Language } from "../types";

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
export const GUARDIAN_MOCK = API_URL === "";

export interface Alert {
  id: string;
  at: number;
  kind: "scam" | "panic" | "live_call";
  risk_level: string | null;
  risk_score: number;
  scam_type: string | null;
  headline: string;
  language: string;
  acknowledged: boolean;
}

export interface Directive {
  action: "stop" | "safe";
  note: string | null;
  by: string;
  at: number;
}

export interface Session {
  token: string;
  family_code: string;
  email_masked: string;
}

export class GuardianError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...(init.headers ?? {}) },
    });
  } catch {
    throw new GuardianError("network", "Could not reach Ruko.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (data as { error?: { code?: string; message?: string } })?.error;
    throw new GuardianError(err?.code ?? "http_error", err?.message ?? "Something went wrong.");
  }
  return data as T;
}

// --- guardian --------------------------------------------------------------

export const signup = (email: string, password: string) =>
  call<Session>("/guardian/signup", { method: "POST", body: JSON.stringify({ email, password }) });

export const login = (email: string, password: string) =>
  call<Session>("/guardian/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const fetchAlerts = (token: string) =>
  call<{ family_code: string; alerts: Alert[]; directive: Directive | null }>("/guardian/alerts", {
    headers: { authorization: `Bearer ${token}` },
  });

export const sendDirective = (
  token: string,
  action: "stop" | "safe" | "clear",
  options: { alert_id?: string; note?: string } = {},
) =>
  call<{ ok: boolean; directive: Directive | null }>("/guardian/directive", {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, ...options }),
  });

// --- parent side -----------------------------------------------------------

export const linkFamily = (family_code: string) =>
  call<{ ok: boolean; family_code: string }>("/family/link", {
    method: "POST",
    body: JSON.stringify({ family_code }),
  });

export const familyStatus = (family_code: string) =>
  call<{ directive: Directive | null }>(
    `/family/status?family_code=${encodeURIComponent(family_code)}`,
  );

export const raisePanic = (family_code: string, language: Language) =>
  call<{ ok: boolean; alert_id: string }>("/panic", {
    method: "POST",
    body: JSON.stringify({ family_code, language }),
  });

// --- local state -----------------------------------------------------------

const SESSION_KEY = "ruko.guardian.session";
const FAMILY_KEY = "ruko.family.code";

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session | null): void {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* private browsing */
  }
}

export function loadFamilyCode(): string | null {
  try {
    return localStorage.getItem(FAMILY_KEY);
  } catch {
    return null;
  }
}

export function saveFamilyCode(code: string | null): void {
  try {
    if (code) localStorage.setItem(FAMILY_KEY, code);
    else localStorage.removeItem(FAMILY_KEY);
  } catch {
    /* private browsing */
  }
}
