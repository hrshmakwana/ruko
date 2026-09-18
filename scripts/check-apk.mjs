#!/usr/bin/env node --experimental-strip-types
/**
 * Guard the APK reader.
 *
 * The parser was written against two real apps (F-Droid and NewPipe) pulled from
 * f-droid.org on 18 Sept, which is how the one bug that mattered was found: the
 * attribute offset is measured from the element header, not from the chunk, and
 * measuring it wrongly finds no permissions at all — silently, on every app.
 *
 * Real APKs are far too big to keep in the repo, so this builds a small binary
 * manifest by hand and checks both the parser and, more importantly, the danger
 * judgement: which permission combinations mean "do not install this".
 *
 *   node --experimental-strip-types scripts/check-apk.mjs
 */
import { parseManifest, assess } from "../frontend/src/lib/apk.ts";

let failures = 0;
const check = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"} ${name}`);
  if (!ok) console.log(`       got:  ${JSON.stringify(got)}\n       want: ${JSON.stringify(want)}`);
};

// --- build a binary AndroidManifest.xml the way aapt does -------------------

function buildManifest(packageName, permissions) {
  const strings = ["package", "name", "manifest", "uses-permission", packageName, ...permissions];
  const encoder = new TextEncoder();

  // String pool: UTF-8, each entry prefixed by character length and byte length.
  const bodies = strings.map((value) => {
    const bytes = encoder.encode(value);
    return Uint8Array.from([bytes.length, bytes.length, ...bytes, 0]);
  });
  const offsets = [];
  let running = 0;
  for (const body of bodies) {
    offsets.push(running);
    running += body.length;
  }
  const poolHeader = 28 + strings.length * 4;
  const poolSize = poolHeader + running;
  const pool = new Uint8Array(poolSize);
  const poolView = new DataView(pool.buffer);
  poolView.setUint16(0, 0x0001, true); // string pool chunk
  poolView.setUint16(2, 28, true);
  poolView.setUint32(4, poolSize, true);
  poolView.setUint32(8, strings.length, true);
  poolView.setUint32(12, 0, true);
  poolView.setUint32(16, 1 << 8, true); // UTF-8 flag
  poolView.setUint32(20, poolHeader, true);
  poolView.setUint32(24, 0, true);
  offsets.forEach((offset, i) => poolView.setUint32(28 + i * 4, offset, true));
  let at = poolHeader;
  for (const body of bodies) {
    pool.set(body, at);
    at += body.length;
  }

  // One start-element chunk, with one attribute.
  const element = (nameIndex, attrNameIndex, valueIndex) => {
    const size = 16 + 20 + 20;
    const bytes = new Uint8Array(size);
    const view = new DataView(bytes.buffer);
    view.setUint16(0, 0x0102, true); // start element
    view.setUint16(2, 16, true);
    view.setUint32(4, size, true);
    view.setUint32(8, 1, true); // line number
    view.setUint32(12, 0xffffffff, true); // comment
    view.setUint32(16, 0xffffffff, true); // namespace
    view.setUint32(20, nameIndex, true);
    view.setUint16(24, 20, true); // attributes start, from the element header
    view.setUint16(26, 20, true); // attribute size
    view.setUint16(28, 1, true); // attribute count
    const a = 36;
    view.setUint32(a, 0xffffffff, true); // attribute namespace
    view.setUint32(a + 4, attrNameIndex, true);
    view.setUint32(a + 8, valueIndex, true); // raw value
    view.setUint16(a + 12, 8, true);
    view.setUint8(a + 15, 3); // string type
    view.setUint32(a + 16, valueIndex, true);
    return bytes;
  };

  const chunks = [pool, element(2, 0, 4)];
  permissions.forEach((_, i) => chunks.push(element(3, 1, 5 + i)));

  const total = 8 + chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setUint16(0, 0x0003, true); // XML file
  view.setUint16(2, 8, true);
  view.setUint32(4, total, true);
  let cursor = 8;
  for (const chunk of chunks) {
    out.set(chunk, cursor);
    cursor += chunk.length;
  }
  return out;
}

// --- the parser -------------------------------------------------------------

const loanApp = parseManifest(
  buildManifest("com.fast.loan", [
    "android.permission.READ_SMS",
    "android.permission.SYSTEM_ALERT_WINDOW",
    "android.permission.READ_CONTACTS",
    "android.permission.INTERNET",
  ]),
);
check("reads the package name", loanApp.packageName, "com.fast.loan");
check("reads every permission", loanApp.permissions.length, 4);

// --- the judgement ----------------------------------------------------------

const drain = assess(loanApp);
check(
  "SMS plus screen overlay is named as account draining",
  drain.drainsAccounts,
  true,
);
check(
  "dangerous permissions come first",
  drain.flags[0].level,
  "danger",
);

const torch = assess({ packageName: "com.simple.torch", permissions: ["android.permission.CAMERA"] });
check("a torch app is not called dangerous", torch.flags.map((f) => f.level), ["warn"]);
check("a torch app does not drain accounts", torch.drainsAccounts, false);

const store = assess({
  packageName: "org.fdroid.fdroid",
  permissions: ["android.permission.REQUEST_INSTALL_PACKAGES", "android.permission.READ_EXTERNAL_STORAGE"],
});
check(
  "an app store installs apps but cannot reach the OTP, so it is not a drainer",
  store.drainsAccounts,
  false,
);

const notifications = assess({
  packageName: "com.fake.support",
  permissions: [
    "android.permission.BIND_NOTIFICATION_LISTENER_SERVICE",
    "android.permission.BIND_ACCESSIBILITY_SERVICE",
  ],
});
check(
  "reading notifications plus controlling the screen is the same attack without SMS",
  notifications.drainsAccounts,
  true,
);

const empty = assess({ packageName: "com.quiet.app", permissions: ["android.permission.INTERNET"] });
check("an app with nothing dangerous shows no flags", empty.flags.length, 0);

console.log(failures === 0 ? "\napk reader: all good" : `\napk reader: ${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
