import type { RiskLevel, Verdict } from "../types";

/** The last few checks, kept on the phone only.
 *
 * What is stored is deliberately thin: the headline Ruko wrote, the level, and
 * when. Never the message, never the screenshot, never anything the person
 * pasted — the rest of Ruko promises not to keep those, and a history list is
 * exactly where that promise would quietly break.
 *
 * It lives in localStorage, so it is per phone, survives a reload, and is gone
 * when they clear the browser. Nothing is sent anywhere.
 */
const KEY = "ruko.recent";
const LIMIT = 3;

export interface RecentCheck {
  id: string;
  headline: string;
  level: RiskLevel;
  scamType: string;
  at: number;
}

export function recentChecks(): RecentCheck[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecent).slice(0, LIMIT);
  } catch {
    return [];
  }
}

function isRecent(value: unknown): value is RecentCheck {
  const item = value as RecentCheck;
  return Boolean(item && typeof item.id === "string" && typeof item.headline === "string");
}

export function rememberCheck(verdict: Verdict): void {
  const entry: RecentCheck = {
    id: verdict.check_id,
    headline: verdict.headline,
    level: verdict.risk_level,
    scamType: verdict.scam_type,
    at: Math.floor(Date.now() / 1000),
  };
  try {
    const next = [entry, ...recentChecks().filter((c) => c.id !== entry.id)].slice(0, LIMIT);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // A history that cannot be written is not worth interrupting anyone for.
  }
}

export function forgetChecks(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}

/** "10 minutes ago", in the person's own language, from the browser's own data
 *  rather than fifteen more translated strings. */
export function timeAgo(at: number, language: string): string {
  const seconds = Math.max(0, Math.floor(Date.now() / 1000) - at);
  try {
    const rtf = new Intl.RelativeTimeFormat(language, { numeric: "auto" });
    if (seconds < 60) return rtf.format(-seconds, "second");
    if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), "minute");
    if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), "hour");
    return rtf.format(-Math.floor(seconds / 86400), "day");
  } catch {
    return "";
  }
}
