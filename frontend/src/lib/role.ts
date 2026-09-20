/** Who is holding the phone, and what that unlocks.
 *
 *   guardian  the phone being protected. Signs in with the family code their
 *             family gave them: call watching, panic, and the alerts that
 *             reach someone else.
 *   admin     the family member doing the watching. Signs in with an email and
 *             gets the dashboard.
 *   guest     nobody in particular. Checking a message, a screenshot, a number
 *             or an app file asks for no account and never will — the person
 *             being scammed right now must not meet a sign-up form.
 *
 * The line is simple: anything that reaches *another person's phone* needs an
 * account, because there is a second human on the other end of it.
 */
export type Role = "guardian" | "admin" | "guest";

const KEY = "ruko.role";

export function loadRole(): Role | null {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === "guardian" || saved === "admin" || saved === "guest" ? saved : null;
  } catch {
    return null;
  }
}

export function saveRole(role: Role | null): void {
  try {
    if (role) localStorage.setItem(KEY, role);
    else localStorage.removeItem(KEY);
  } catch {
    // Not remembering the choice only means asking again, which is survivable.
  }
}

/** What a guest may not do: everything that touches another person's phone. */
export function needsAccount(role: Role | null): boolean {
  return role !== "guardian" && role !== "admin";
}
