/* Ruko's service worker.
 *
 * It does two jobs and deliberately no more:
 *
 * 1. Share target. On Android, Ruko appears in the share sheet, so a screenshot
 *    can go from WhatsApp straight into a check. The shared file arrives as a
 *    POST, which a page cannot receive — only a service worker can. It is put in
 *    a cache and the app is opened to read it.
 *
 * 2. An offline shell. If the phone has no signal the app still opens and says
 *    so, instead of showing the browser's dinosaur. A check itself needs the
 *    network, and the app says that too rather than pretending.
 *
 * What it does NOT do: cache API responses. A verdict is about a message someone
 * received; keeping it on the device after the 24h expiry would break the
 * promise the rest of Ruko makes.
 */

const VERSION = "ruko-v4";
const SHELL = `${VERSION}-shell`;
const SHARE = "ruko-share";

const SHELL_FILES = ["/", "/check", "/attack", "/icon.svg", "/icon-192.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(SHELL_FILES))
      .catch(() => undefined) // a missing file must never block the install
      .then(() => self.skipWaiting()),
  );
});

// A new worker takes over the moment it is ready, and every open tab is told
// to reload. Without this, a phone that opened Ruko once keeps running the old
// app after a deploy — which looks exactly like a feature that was never built.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith("ruko-v") && key !== SHELL).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim())
      .then(async () => {
        const clients = await self.clients.matchAll({ type: "window" });
        for (const client of clients) client.postMessage({ type: "ruko-updated" });
      }),
  );
});

async function receiveShare(request) {
  const form = await request.formData();
  const cache = await caches.open(SHARE);
  const file = form.get("image");
  const text = [form.get("title"), form.get("text"), form.get("url")].filter(Boolean).join(" ").trim();

  if (file && file.size) {
    await cache.put(
      "/__shared-image",
      new Response(file, { headers: { "content-type": file.type || "image/jpeg" } }),
    );
  } else {
    await cache.delete("/__shared-image");
  }

  if (text) {
    await cache.put("/__shared-text", new Response(text, { headers: { "content-type": "text/plain" } }));
  } else {
    await cache.delete("/__shared-text");
  }

  return Response.redirect("/check?shared=1", 303);
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method === "POST" && url.pathname === "/check/share") {
    event.respondWith(receiveShare(event.request));
    return;
  }

  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

  // Pages: try the network, fall back to whatever was cached at install.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL).then((cache) => cache.put(event.request, copy)).catch(() => undefined);
          return response;
        })
        .catch(async () => (await caches.match(event.request)) ?? (await caches.match("/check")) ?? Response.error()),
    );
    return;
  }

  // Built assets are content-hashed, so a cache hit is always the right file.
  if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icon")) {
    event.respondWith(
      caches.match(event.request).then(
        (hit) =>
          hit ??
          fetch(event.request).then((response) => {
            const copy = response.clone();
            caches.open(SHELL).then((cache) => cache.put(event.request, copy)).catch(() => undefined);
            return response;
          }),
      ),
    );
  }
});
