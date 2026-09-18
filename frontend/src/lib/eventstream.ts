/** The binary frame format Amazon Transcribe speaks over a WebSocket.
 *
 * Transcribe streaming does not accept plain audio on a socket: every message is
 * an AWS "event stream" frame — a prelude with two lengths and a CRC, then
 * headers, then the payload, then a CRC of the whole thing. The AWS SDK does
 * this for you, but pulling the SDK into the browser to send microphone audio
 * costs far more than the eighty lines below.
 *
 * Only what Ruko needs is implemented: writing an AudioEvent, and reading a
 * TranscriptEvent or an error frame. Header values are always strings here.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

const AUDIO_HEADERS: [string, string][] = [
  [":message-type", "event"],
  [":event-type", "AudioEvent"],
  [":content-type", "application/octet-stream"],
];

/** Wrap raw 16-bit PCM in an AudioEvent frame, ready to send down the socket. */
// The ArrayBuffer in the return type is not decoration: WebSocket.send will
// not take a view that might sit on a SharedArrayBuffer.
export function encodeAudioEvent(pcm: Uint8Array): Uint8Array<ArrayBuffer> {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  for (const [name, value] of AUDIO_HEADERS) {
    const nameBytes = encoder.encode(name);
    const valueBytes = encoder.encode(value);
    const header = new Uint8Array(1 + nameBytes.length + 1 + 2 + valueBytes.length);
    const view = new DataView(header.buffer);
    let at = 0;
    header[at++] = nameBytes.length;
    header.set(nameBytes, at);
    at += nameBytes.length;
    header[at++] = 7; // value type 7 = string
    view.setUint16(at, valueBytes.length);
    at += 2;
    header.set(valueBytes, at);
    parts.push(header);
  }

  const headerBytes = concat(parts);
  const total = 16 + headerBytes.length + pcm.length;
  const frame = new Uint8Array(total);
  const view = new DataView(frame.buffer);

  view.setUint32(0, total);
  view.setUint32(4, headerBytes.length);
  view.setUint32(8, crc32(frame.subarray(0, 8)));
  frame.set(headerBytes, 12);
  frame.set(pcm, 12 + headerBytes.length);
  view.setUint32(total - 4, crc32(frame.subarray(0, total - 4)));
  return frame;
}

function concat(parts: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(size);
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

export interface TranscriptFrame {
  /** What has been heard so far in this segment. */
  text: string;
  /** Partial results are rewritten as the speaker continues; finals are settled. */
  partial: boolean;
  /** Set when Transcribe reports a problem instead of a transcript. */
  error?: string;
}

/** Read one frame from Transcribe. Returns null for frames we do not act on. */
export function decodeFrame(buffer: ArrayBuffer): TranscriptFrame | null {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const headersLength = view.getUint32(4);
  const decoder = new TextDecoder();

  const headers: Record<string, string> = {};
  let at = 12;
  const headersEnd = 12 + headersLength;
  while (at < headersEnd) {
    const nameLength = bytes[at++];
    const name = decoder.decode(bytes.subarray(at, at + nameLength));
    at += nameLength;
    at++; // value type; always 7 (string) on this API
    const valueLength = view.getUint16(at);
    at += 2;
    headers[name] = decoder.decode(bytes.subarray(at, at + valueLength));
    at += valueLength;
  }

  const payload = decoder.decode(bytes.subarray(headersEnd, bytes.length - 4));

  if (headers[":message-type"] === "exception" || headers[":exception-type"]) {
    let message = headers[":exception-type"] ?? "stream error";
    try {
      message = (JSON.parse(payload) as { Message?: string }).Message ?? message;
    } catch {
      /* keep the header's name */
    }
    return { text: "", partial: false, error: message };
  }

  if (headers[":event-type"] !== "TranscriptEvent") return null;

  try {
    const body = JSON.parse(payload) as {
      Transcript?: { Results?: { Alternatives?: { Transcript?: string }[]; IsPartial?: boolean }[] };
    };
    const result = body.Transcript?.Results?.[0];
    const text = result?.Alternatives?.[0]?.Transcript;
    if (!result || !text) return null;
    return { text, partial: result.IsPartial !== false };
  } catch {
    return null;
  }
}
