/** Installing Ruko, and receiving a screenshot shared into it.
 *
 * The point of installing is not novelty. A scam call is happening *now*: an
 * icon on the home screen and a share-sheet entry are the difference between
 * "I'll check it later on that website" and checking it while the person is
 * still on the line. Installed, Ruko also keeps the microphone permission it
 * was granted, so call mode starts in one tap the second time.
 */

const SHARE_CACHE = "ruko-share";

export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) return;
  // Registration failing is not worth a message: the app works without it.
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
  });
}

export interface SharedPayload {
  file: File | null;
  text: string;
}

/** Pick up whatever the share sheet handed the service worker, once. */
export async function takeSharedPayload(): Promise<SharedPayload | null> {
  if (!("caches" in window)) return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get("shared") !== "1") return null;

  // Clean the address bar straight away, so a reload does not re-import the
  // same screenshot and surprise someone with an old verdict.
  const url = new URL(window.location.href);
  url.searchParams.delete("shared");
  window.history.replaceState({}, "", url.toString());

  try {
    const cache = await caches.open(SHARE_CACHE);
    const imageResponse = await cache.match("/__shared-image");
    const textResponse = await cache.match("/__shared-text");
    const text = textResponse ? (await textResponse.text()).trim() : "";

    let file: File | null = null;
    if (imageResponse) {
      const blob = await imageResponse.blob();
      const type = blob.type || "image/jpeg";
      file = new File([blob], `shared.${type.includes("png") ? "png" : "jpg"}`, { type });
    }

    await cache.delete("/__shared-image");
    await cache.delete("/__shared-text");

    return file || text ? { file, text } : null;
  } catch {
    return null;
  }
}

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferred: InstallPrompt | null = null;
const listeners = new Set<(available: boolean) => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    // Chrome shows its own mini-infobar otherwise, at a moment we do not choose.
    event.preventDefault();
    deferred = event as InstallPrompt;
    listeners.forEach((listener) => listener(true));
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    listeners.forEach((listener) => listener(false));
  });
}

export function isInstalled(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

/** iPhones have no install prompt: Safari only offers Share → Add to Home Screen. */
export function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return iOS && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
}

export function onInstallAvailability(listener: (available: boolean) => void): () => void {
  listeners.add(listener);
  listener(deferred !== null);
  return () => listeners.delete(listener);
}

export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferred) return "unavailable";
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;
  if (outcome === "accepted") deferred = null;
  return outcome;
}
