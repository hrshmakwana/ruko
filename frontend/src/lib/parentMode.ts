/** Parent Mode: the same app, sized for someone who is sixty.
 *
 * Not the browser's zoom — that reflows a layout into something broken. This
 * multiplies one CSS variable, and because every size in Ruko is in rem, the
 * whole interface grows together and the tap targets grow with it.
 *
 * It is remembered per phone, because the person who needs it needs it always.
 */
const KEY = "ruko.parentMode";

export function loadParentMode(): boolean {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

export function applyParentMode(on: boolean): void {
  document.documentElement.dataset.parent = on ? "on" : "off";
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // Not remembering it is survivable; not applying it is not.
  }
}
