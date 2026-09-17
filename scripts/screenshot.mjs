#!/usr/bin/env node
/**
 * Screenshot Ruko at a real phone viewport.
 *
 * Headless Chrome refuses to make a window narrower than 500px, so --window-size
 * alone silently renders at 500 and crops - which looks exactly like a layout bug.
 * This drives Chrome over CDP and uses Emulation.setDeviceMetricsOverride, which
 * gives a genuine 360px viewport.
 *
 * Usage:
 *   node scripts/screenshot.mjs <url> <out.png> [--width=360] [--height=800]
 *                               [--dark] [--full] [--click=<selector>]
 *                               [--type=<selector>:<text>] [--wait=<ms>]
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = Number(process.env.CDP_PORT ?? 9333);

const [url, out, ...flags] = process.argv.slice(2);
if (!url || !out) {
  console.error("usage: screenshot.mjs <url> <out.png> [flags]");
  process.exit(1);
}
const flag = (name, fallback) => {
  const hit = flags.find((f) => f.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const has = (name) => flags.includes(`--${name}`);

const width = Number(flag("width", 360));
const height = Number(flag("height", 800));
const waitMs = Number(flag("wait", 1200));

const profileDir = mkdtempSync(join(tmpdir(), "ruko-shot-"));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    `--remote-debugging-port=${PORT}`,
    // A fresh profile per run: a shared one races when shots run back to back
    // and the previous Chrome has not finished letting go of it.
    `--user-data-dir=${profileDir}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = list.find((t) => t.type === "page");
      if (page?.webSocketDebuggerUrl) return page;
    } catch {
      /* chrome still starting */
    }
    await sleep(200);
  }
  throw new Error("Chrome did not expose a debuggable page");
}

const target = await findTarget();
const ws = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let nextId = 0;

ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  const resolve = pending.get(msg.id);
  if (resolve) {
    pending.delete(msg.id);
    resolve(msg.result ?? {});
  }
});
await new Promise((resolve) => ws.addEventListener("open", resolve));

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++nextId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

const evaluate = (expression) =>
  send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width,
  height,
  deviceScaleFactor: 2,
  mobile: true,
});
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-color-scheme", value: has("dark") ? "dark" : "light" }],
});

await send("Page.navigate", { url });
await sleep(waitMs);

// Ruko remembers the chosen language in localStorage, so setting it and
// reloading is the honest way to screenshot a language — it exercises the same
// path a returning user takes.
const langArg = flag("lang", null);
// --seed='{"ruko.family.code":"ABC123"}' puts the app into a given state before
// the shot, which is how the signed-in and linked screens get captured without
// driving a whole sign-up flow each time.
const seedArg = flag("seed", null);
if (langArg || seedArg) {
  const seed = { ...(seedArg ? JSON.parse(seedArg) : {}) };
  if (langArg) seed["ruko.language"] = langArg;
  await evaluate(`try {
    const seed = ${JSON.stringify(seed)};
    for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, v);
  } catch {}`);
  await send("Page.reload");
  await sleep(waitMs);
}

const typeArg = flag("type", null);
if (typeArg) {
  const split = typeArg.indexOf(":");
  const selector = typeArg.slice(0, split);
  const text = typeArg.slice(split + 1);
  await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return "no-el";
    const setter = Object.getOwnPropertyDescriptor(el.constructor.prototype, "value").set;
    setter.call(el, ${JSON.stringify(text)});
    el.dispatchEvent(new Event("input", { bubbles: true }));
    return "ok";
  })()`);
  await sleep(200);
}

const clickArg = flag("click", null);
if (clickArg) {
  for (const selector of clickArg.split(",")) {
    const result = await evaluate(`(() => {
      const els = [...document.querySelectorAll("button, a")];
      const el = document.querySelector(${JSON.stringify(selector)}) ??
        els.find((e) => e.textContent.trim().includes(${JSON.stringify(selector)}));
      if (!el) return "no-el:" + ${JSON.stringify(selector)};
      el.click();
      return "ok";
    })()`);
    if (result.result?.value !== "ok") console.error("click:", result.result?.value);
    await sleep(2200);
  }
}

// --wait-gone="Looking it up" polls until that text has left the page, so a
// slow or cold API response is waited for rather than photographed mid-flight.
const waitGone = flag("wait-gone", null);
if (waitGone) {
  for (let i = 0; i < 60; i++) {
    const r = await evaluate(`document.body.innerText.includes(${JSON.stringify(waitGone)})`);
    if (r.result?.value === false) break;
    await sleep(250);
  }
  await sleep(400);
}

// Ruko staggers sections in with animation-delay and fill-mode: both, so a
// section whose delay has not elapsed is still at opacity 0. Capturing mid-
// stagger silently drops half the page, which looks like a rendering bug.
// Cancelling the animations leaves every element in its settled state.
await evaluate(`(() => {
  document.querySelectorAll(".ruko-rise, .ruko-slam").forEach((el) => {
    el.style.animation = "none";
  });
  return document.querySelectorAll(".ruko-rise, .ruko-slam").length;
})()`);
await sleep(300);

let clip;
if (has("full")) {
  const metrics = await send("Page.getLayoutMetrics");
  const full = metrics.cssContentSize ?? metrics.contentSize;
  clip = { x: 0, y: 0, width, height: Math.ceil(full.height), scale: 1 };
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: Math.ceil(full.height),
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(250);
}

const shot = await send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: has("full"),
  ...(clip ? { clip } : {}),
});
writeFileSync(out, Buffer.from(shot.data, "base64"));

const audit = await evaluate(`JSON.stringify({
  viewport: document.documentElement.clientWidth,
  scrollWidth: document.documentElement.scrollWidth,
  tooSmallTapTargets: [...document.querySelectorAll("button, a, input, textarea, select")]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.height < 44;
    })
    .map((el) => (el.textContent || el.tagName).trim().slice(0, 24)),
})`);

console.log(`${out}  ${audit.result?.value ?? ""}`);

ws.close();
chrome.kill();
// Give Chrome a moment to release the profile before removing it.
await sleep(300);
try {
  rmSync(profileDir, { recursive: true, force: true });
} catch {
  /* best effort */
}
process.exit(0);
