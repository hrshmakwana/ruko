#!/usr/bin/env node --experimental-strip-types
/**
 * Guard the binary frame Ruko sends to Amazon Transcribe.
 *
 * Live call mode hand-writes the AWS event-stream format, because pulling the
 * AWS SDK into the browser to send microphone audio is not worth the weight. A
 * wrong byte there does not throw: Transcribe simply closes the socket, and the
 * screen looks like it is listening while hearing nothing.
 *
 * The expected bytes below were produced by the Python encoder that a live
 * Transcribe stream accepted on 18 Sept, so this compares against something
 * that actually worked rather than against itself.
 *
 *   node --experimental-strip-types scripts/check-eventstream.mjs
 */
import { encodeAudioEvent, decodeFrame } from "../frontend/src/lib/eventstream.ts";

let failures = 0;
const check = (name, got, want) => {
  const ok = got === want;
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"} ${name}`);
  if (!ok) console.log(`       got:  ${got}\n       want: ${want}`);
};

// --- the AudioEvent frame ---------------------------------------------------

const GOLDEN =
  "0000007000000058f940e6600d3a6d6573736167652d747970650700056576656e740b3a6576656e742d7479" +
  "706507000a417564696f4576656e740d3a636f6e74656e742d747970650700186170706c69636174696f6e2f" +
  "6f637465742d73747265616d00010203fafbfcfd4de4d63f";

const frame = encodeAudioEvent(new Uint8Array([0, 1, 2, 3, 250, 251, 252, 253]));
check("AudioEvent frame matches the bytes Transcribe accepted", Buffer.from(frame).toString("hex"), GOLDEN);

// An empty frame is how the socket is told the speech has ended.
check("empty AudioEvent is still a valid frame", encodeAudioEvent(new Uint8Array(0)).length, 104);

// --- reading what Transcribe sends back -------------------------------------

function transcribeFrame(headers, body) {
  const payload = Buffer.from(JSON.stringify(body));
  let head = Buffer.alloc(0);
  for (const [name, value] of headers) {
    const n = Buffer.from(name);
    const v = Buffer.from(value);
    const len = Buffer.alloc(2);
    len.writeUInt16BE(v.length);
    head = Buffer.concat([head, Buffer.from([n.length]), n, Buffer.from([7]), len, v]);
  }
  const total = 16 + head.length + payload.length;
  const out = Buffer.alloc(total);
  out.writeUInt32BE(total, 0);
  out.writeUInt32BE(head.length, 4);
  head.copy(out, 12);
  payload.copy(out, 12 + head.length);
  return out.buffer.slice(out.byteOffset, out.byteOffset + out.length);
}

const settled = decodeFrame(
  transcribeFrame(
    [[":event-type", "TranscriptEvent"], [":message-type", "event"]],
    { Transcript: { Results: [{ Alternatives: [{ Transcript: "tell me the OTP" }], IsPartial: false }] } },
  ),
);
check("a settled transcript is read", settled?.text, "tell me the OTP");
check("a settled transcript is not marked partial", settled?.partial, false);

const partial = decodeFrame(
  transcribeFrame(
    [[":event-type", "TranscriptEvent"], [":message-type", "event"]],
    { Transcript: { Results: [{ Alternatives: [{ Transcript: "tell me the" }], IsPartial: true }] } },
  ),
);
check("a partial transcript is marked partial", partial?.partial, true);

const failed = decodeFrame(
  transcribeFrame(
    [[":message-type", "exception"], [":exception-type", "BadRequestException"]],
    { Message: "Your request timed out because no new audio was received." },
  ),
);
check(
  "an exception frame comes back as an error, not a transcript",
  failed?.error,
  "Your request timed out because no new audio was received.",
);

// A heartbeat with no results must not be mistaken for silence worth showing.
const empty = decodeFrame(
  transcribeFrame([[":event-type", "TranscriptEvent"], [":message-type", "event"]], { Transcript: { Results: [] } }),
);
check("an empty transcript event is ignored", empty, null);

console.log(failures === 0 ? "\nevent stream: all good" : `\nevent stream: ${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
