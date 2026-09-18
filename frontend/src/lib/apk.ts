/** Reading an Android app's permissions without installing it.
 *
 * The scam: a stranger sends an APK on WhatsApp — "install this to get your
 * refund / your loan / your prize". Installing it hands over the phone. The
 * person cannot see what the app will be allowed to do until it is too late,
 * because Android only shows that after installation, one permission at a time.
 *
 * Ruko opens the file here, in the browser, and reads the app's own manifest.
 * The APK is never uploaded: it is read from the phone's own storage, so this
 * works offline, costs nothing, and the file stays where it was.
 *
 * An APK is a zip whose AndroidManifest.xml is not text but Android's binary XML
 * ("AXML"): a string pool followed by element chunks. Only what is needed is
 * parsed — the package name and every <uses-permission>.
 */

export interface ApkInfo {
  packageName: string | null;
  permissions: string[];
}

const ZIP_EOCD = 0x06054b50;
const ZIP_CENTRAL = 0x02014b50;

// Chunk types in a binary XML file.
const CHUNK_STRING_POOL = 0x0001;
const CHUNK_START_ELEMENT = 0x0102;

const UTF8_POOL_FLAG = 1 << 8;

export class NotAnApk extends Error {}

async function slice(file: Blob, start: number, end: number): Promise<DataView> {
  const buffer = await file.slice(start, end).arrayBuffer();
  return new DataView(buffer);
}

/** Find AndroidManifest.xml through the zip's central directory.
 *
 * Reading the directory rather than scanning the file means a 100 MB app costs
 * a few kilobytes of reading, which matters on the phones Ruko is built for.
 */
async function findManifestEntry(file: Blob): Promise<{ offset: number; compressed: boolean; size: number }> {
  const tailSize = Math.min(file.size, 66_000); // enough for a zip comment
  const tail = await slice(file, file.size - tailSize, file.size);

  let eocd = -1;
  for (let at = tail.byteLength - 22; at >= 0; at--) {
    if (tail.getUint32(at, true) === ZIP_EOCD) {
      eocd = at;
      break;
    }
  }
  if (eocd < 0) throw new NotAnApk("no zip directory");

  const entries = tail.getUint16(eocd + 10, true);
  const directoryOffset = tail.getUint32(eocd + 16, true);
  const directorySize = tail.getUint32(eocd + 12, true);
  const directory = await slice(file, directoryOffset, directoryOffset + directorySize);

  let at = 0;
  const decoder = new TextDecoder();
  for (let i = 0; i < entries; i++) {
    if (directory.getUint32(at, true) !== ZIP_CENTRAL) break;
    const method = directory.getUint16(at + 10, true);
    const compressedSize = directory.getUint32(at + 20, true);
    const nameLength = directory.getUint16(at + 28, true);
    const extraLength = directory.getUint16(at + 30, true);
    const commentLength = directory.getUint16(at + 32, true);
    const localOffset = directory.getUint32(at + 42, true);
    const name = decoder.decode(new Uint8Array(directory.buffer, directory.byteOffset + at + 46, nameLength));

    if (name === "AndroidManifest.xml") {
      return { offset: localOffset, compressed: method === 8, size: compressedSize };
    }
    at += 46 + nameLength + extraLength + commentLength;
  }
  throw new NotAnApk("no AndroidManifest.xml");
}

async function readManifestBytes(file: Blob): Promise<Uint8Array> {
  const entry = await findManifestEntry(file);
  // The local header repeats the name and extra fields, with its own lengths.
  const header = await slice(file, entry.offset, entry.offset + 30);
  const nameLength = header.getUint16(26, true);
  const extraLength = header.getUint16(28, true);
  const start = entry.offset + 30 + nameLength + extraLength;
  const raw = file.slice(start, start + entry.size);

  if (!entry.compressed) return new Uint8Array(await raw.arrayBuffer());

  const stream = raw.stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** The string pool: every name and value in the file, by index. */
function readStringPool(view: DataView, start: number): string[] {
  const stringCount = view.getUint32(start + 8, true);
  const flags = view.getUint32(start + 16, true);
  const stringsStart = start + view.getUint32(start + 20, true);
  const utf8 = (flags & UTF8_POOL_FLAG) !== 0;

  const strings: string[] = [];
  const decoder = new TextDecoder(utf8 ? "utf-8" : "utf-16le");

  for (let i = 0; i < stringCount; i++) {
    const at = stringsStart + view.getUint32(start + 28 + i * 4, true);
    if (utf8) {
      // Two lengths, each one or two bytes: characters, then bytes.
      let cursor = at;
      const skip = (): void => {
        const first = view.getUint8(cursor++);
        if (first & 0x80) cursor++;
      };
      skip();
      const firstByte = view.getUint8(cursor++);
      const byteLength = firstByte & 0x80 ? ((firstByte & 0x7f) << 8) | view.getUint8(cursor++) : firstByte;
      strings.push(decoder.decode(new Uint8Array(view.buffer, view.byteOffset + cursor, byteLength)));
    } else {
      const first = view.getUint16(at, true);
      const charCount = first & 0x8000 ? ((first & 0x7fff) << 16) | view.getUint16(at + 2, true) : first;
      const from = at + (first & 0x8000 ? 4 : 2);
      strings.push(decoder.decode(new Uint8Array(view.buffer, view.byteOffset + from, charCount * 2)));
    }
  }
  return strings;
}

export async function readApk(file: Blob): Promise<ApkInfo> {
  return parseManifest(await readManifestBytes(file));
}

/** The binary XML parser on its own, so it can be tested against a manifest
 *  pulled out of a real app without going through the zip reader. */
export function parseManifest(bytes: Uint8Array): ApkInfo {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  let strings: string[] = [];
  const permissions: string[] = [];
  let packageName: string | null = null;

  // Walk the chunks. Each has a type, a header size and a total size.
  let at = 8; // past the file header
  while (at + 8 <= view.byteLength) {
    const type = view.getUint16(at, true);
    const size = view.getUint32(at + 4, true);
    if (size <= 0 || at + size > view.byteLength) break;

    if (type === CHUNK_STRING_POOL) {
      strings = readStringPool(view, at);
    } else if (type === CHUNK_START_ELEMENT) {
      const nameIndex = view.getUint32(at + 20, true);
      const attributeStart = view.getUint16(at + 24, true);
      const attributeSize = view.getUint16(at + 26, true);
      const attributeCount = view.getUint16(at + 28, true);
      const element = strings[nameIndex] ?? "";

      if (element === "manifest" || element === "uses-permission") {
        // attributeStart counts from the element header (16 bytes in), not from
        // the start of the chunk. Measuring it from the chunk finds nothing at
        // all, silently, on every app.
        const attributesAt = at + 16 + attributeStart;
        for (let i = 0; i < attributeCount; i++) {
          const a = attributesAt + i * attributeSize;
          const attrNameIndex = view.getUint32(a + 4, true);
          const rawValueIndex = view.getUint32(a + 8, true);
          const attrName = strings[attrNameIndex] ?? "";
          // 0xffffffff means "no raw string", and then the typed value holds it.
          const typedValue = view.getUint32(a + 16, true);
          const value =
            rawValueIndex !== 0xffffffff ? strings[rawValueIndex] : strings[typedValue];

          if (element === "manifest" && attrName === "package" && value) {
            packageName = value;
          }
          if (element === "uses-permission" && attrName === "name" && value) {
            if (!permissions.includes(value)) permissions.push(value);
          }
        }
      }
    }
    at += size;
  }

  if (!packageName && permissions.length === 0) throw new NotAnApk("manifest not understood");
  return { packageName, permissions };
}

// --- what those permissions mean for the person holding the phone -----------

export type ApkFlagLevel = "danger" | "warn";

export interface ApkFlag {
  level: ApkFlagLevel;
  /** Key into the translated explanations, so this file stays language-free. */
  id: string;
  permission: string;
}

/** Permissions that let an app take money, grouped by what they actually do.
 *
 * The dangerous set is not "scary sounding" — it is the set used by the loan and
 * refund apps that clean out accounts: read the OTP from SMS, watch the screen,
 * install more apps, and stay on top of whatever you are looking at.
 */
const DANGER: Record<string, string> = {
  "android.permission.READ_SMS": "sms",
  "android.permission.RECEIVE_SMS": "sms",
  "android.permission.SEND_SMS": "send_sms",
  "android.permission.REQUEST_INSTALL_PACKAGES": "install_apps",
  "android.permission.SYSTEM_ALERT_WINDOW": "overlay",
  "android.permission.BIND_ACCESSIBILITY_SERVICE": "accessibility",
  "android.permission.READ_CONTACTS": "contacts",
  "android.permission.PROCESS_OUTGOING_CALLS": "calls",
  "android.permission.ANSWER_PHONE_CALLS": "calls",
  "android.permission.READ_CALL_LOG": "call_log",
  "android.permission.BIND_NOTIFICATION_LISTENER_SERVICE": "notifications",
};

const WARN: Record<string, string> = {
  "android.permission.RECORD_AUDIO": "microphone",
  "android.permission.CAMERA": "camera",
  "android.permission.ACCESS_FINE_LOCATION": "location",
  "android.permission.READ_EXTERNAL_STORAGE": "photos",
  "android.permission.READ_MEDIA_IMAGES": "photos",
  "android.permission.CALL_PHONE": "dial",
  "android.permission.READ_PHONE_STATE": "phone_identity",
};

export interface ApkReport extends ApkInfo {
  flags: ApkFlag[];
  /** True when the combination is the one used to drain an account. */
  drainsAccounts: boolean;
}

export function assess(info: ApkInfo): ApkReport {
  const flags: ApkFlag[] = [];
  const seen = new Set<string>();

  for (const permission of info.permissions) {
    const danger = DANGER[permission];
    const warn = WARN[permission];
    const id = danger ?? warn;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    flags.push({ level: danger ? "danger" : "warn", id, permission });
  }

  flags.sort((a, b) => (a.level === b.level ? 0 : a.level === "danger" ? -1 : 1));

  // Reading the OTP plus one way to use it is the whole attack in two lines.
  const reachesOtp = seen.has("sms") || seen.has("notifications") || seen.has("accessibility");
  const takesOver = seen.has("overlay") || seen.has("install_apps") || seen.has("accessibility");
  return { ...info, flags, drainsAccounts: reachesOtp && takesOver };
}
