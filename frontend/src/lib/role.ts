/** Who is holding the phone.
 *
 * Ruko serves two people with opposite needs. The parent is being protected:
 * they check things, and they need one button per situation. The son or
 * daughter is doing the protecting: they watch, they get told, they send STOP.
 *
 * Showing both sets of controls on one screen — which is what the app did until
 * now — means neither person can find theirs. So the role is chosen once, and
 * from then on the app is only that person's app. It can be changed in settings,
 * because one phone is sometimes handed over.
 */
export type Role = "parent" | "guardian";

const KEY = "ruko.role";

export function loadRole(): Role | null {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === "parent" || saved === "guardian" ? saved : null;
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
