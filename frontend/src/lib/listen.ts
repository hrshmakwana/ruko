/** Microphone → Amazon Transcribe, for when the scammer is on speakerphone.
 *
 * Android does not let a web page touch the call audio, and recording calls is
 * restricted for good reasons. So Ruko listens the way a person sitting next to
 * you would: through the microphone, while the call is on speaker. Nothing is
 * recorded. Audio goes from the phone straight to Transcribe over a signed
 * socket, and only the text comes back to Ruko's rules.
 *
 * If that socket cannot be opened — no permission to stream, a blocked network,
 * an old browser — it falls back to the speech recognition built into the phone,
 * so the feature degrades instead of disappearing. The screen says which one is
 * listening, because one of them sends audio to AWS and the other does not.
 */

import { liveToken } from "./api";
import { decodeFrame, encodeAudioEvent } from "./eventstream";
import type { Language } from "../types";

export type ListenSource = "transcribe" | "device";
export type ListenError = "mic_denied" | "unsupported" | "stream" | "network";

export interface ListenHandlers {
  /** Settled text so far, plus the words still being spoken. */
  onTranscript: (settled: string, partial: string) => void;
  onSource: (source: ListenSource, streamLanguage: string, borrowed: boolean) => void;
  onError: (error: ListenError, detail?: string) => void;
  onStopped: (reason: "user" | "limit" | "error") => void;
}

export interface ListenSession {
  stop: () => void;
}

const TARGET_RATE = 16000;
/** ~100 ms of audio per frame: small enough to feel live, large enough that the
 *  socket is not woken up for every buffer. */
const FRAME_SAMPLES = 1600;

// The device's own recogniser, where it exists. Named differently per browser.
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
};

function deviceRecogniser(): SpeechRecognitionLike | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

/** Linear resample to 16 kHz. Phones hand us 44.1 or 48 kHz; Transcribe is told
 *  16 kHz, and sending anything else makes every word come out wrong. */
function downsample(input: Float32Array, fromRate: number): Int16Array {
  if (fromRate === TARGET_RATE) return toPcm16(input);
  const ratio = fromRate / TARGET_RATE;
  const length = Math.floor(input.length / ratio);
  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const at = i * ratio;
    const low = Math.floor(at);
    const high = Math.min(low + 1, input.length - 1);
    out[i] = input[low] + (input[high] - input[low]) * (at - low);
  }
  return toPcm16(out);
}

function toPcm16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const sample = Math.max(-1, Math.min(1, input[i]));
    out[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return out;
}

export async function startListening(
  language: Language,
  handlers: ListenHandlers,
): Promise<ListenSession> {
  let stopped = false;
  let stream: MediaStream | null = null;
  let context: AudioContext | null = null;
  let socket: WebSocket | null = null;
  let recogniser: SpeechRecognitionLike | null = null;
  let limitTimer: number | null = null;

  const settled: string[] = [];

  function cleanUp() {
    if (limitTimer) window.clearTimeout(limitTimer);
    try {
      recogniser?.stop();
    } catch {
      /* already stopped */
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
      // An empty audio frame is how you tell Transcribe the speech is over.
      try {
        socket.send(encodeAudioEvent(new Uint8Array(0)));
      } catch {
        /* closing anyway */
      }
      socket.close();
    }
    stream?.getTracks().forEach((track) => track.stop());
    void context?.close().catch(() => undefined);
    stream = null;
    context = null;
    socket = null;
    recogniser = null;
  }

  function finish(reason: "user" | "limit" | "error") {
    if (stopped) return;
    stopped = true;
    cleanUp();
    handlers.onStopped(reason);
  }

  // --- the device's own recogniser, used when the socket cannot be opened ----
  function listenWithDevice(streamLanguage: string) {
    const recognition = deviceRecogniser();
    if (!recognition) {
      handlers.onError("unsupported");
      finish("error");
      return;
    }
    recogniser = recognition;
    recognition.lang = streamLanguage;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: unknown) => {
      const results = (event as { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> })
        .results;
      let partial = "";
      settled.length = 0;
      for (let i = 0; i < results.length; i++) {
        const text = results[i][0]?.transcript ?? "";
        if (results[i].isFinal) settled.push(text.trim());
        else partial = text;
      }
      handlers.onTranscript(settled.join(" "), partial);
    };
    recognition.onerror = (event: unknown) => {
      const code = (event as { error?: string }).error;
      if (code === "not-allowed" || code === "service-not-allowed") {
        handlers.onError("mic_denied");
        finish("error");
      }
    };
    recognition.onend = () => {
      // Chrome stops after a pause; keep going until the person says stop.
      if (!stopped) {
        try {
          recognition.start();
        } catch {
          /* restarting too fast, the next onend will retry */
        }
      }
    };
    handlers.onSource("device", streamLanguage, false);
    recognition.start();
  }

  // --- the real thing: microphone straight to Transcribe --------------------
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    });
  } catch {
    handlers.onError("mic_denied");
    finish("error");
    return { stop: () => finish("user") };
  }

  let token: Awaited<ReturnType<typeof liveToken>> | null = null;
  try {
    token = await liveToken(language);
  } catch {
    // No token: fall back rather than leaving the person with nothing.
    listenWithDevice(language === "en" ? "en-IN" : `${language}-IN`);
    return { stop: () => finish("user") };
  }

  if (stopped) return { stop: () => undefined };

  limitTimer = window.setTimeout(() => finish("limit"), token.max_seconds * 1000);

  let opened = false;
  try {
    socket = new WebSocket(token.url);
  } catch {
    listenWithDevice(token.stream_language);
    return { stop: () => finish("user") };
  }
  socket.binaryType = "arraybuffer";

  socket.onopen = () => {
    opened = true;
    handlers.onSource("transcribe", token.stream_language, token.borrowed);

    // ScriptProcessor rather than an AudioWorklet: it is deprecated, but it is
    // the one that works on every Android phone Ruko is meant for, and the work
    // per buffer here is a copy and a multiply.
    context = new AudioContext();
    const source = context.createMediaStreamSource(stream!);
    const processor = context.createScriptProcessor(4096, 1, 1);
    let pending = new Int16Array(0);

    processor.onaudioprocess = (event) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      const chunk = downsample(event.inputBuffer.getChannelData(0), context!.sampleRate);
      const merged = new Int16Array(pending.length + chunk.length);
      merged.set(pending);
      merged.set(chunk, pending.length);

      let at = 0;
      while (merged.length - at >= FRAME_SAMPLES) {
        const slice = merged.subarray(at, at + FRAME_SAMPLES);
        socket.send(encodeAudioEvent(new Uint8Array(slice.buffer, slice.byteOffset, slice.byteLength)));
        at += FRAME_SAMPLES;
      }
      pending = merged.slice(at);
    };

    source.connect(processor);
    // Chrome will not run a ScriptProcessor that is not connected to an output.
    // A zero gain keeps the call from being played back through the speaker,
    // which would otherwise echo into the same microphone.
    const silence = context.createGain();
    silence.gain.value = 0;
    processor.connect(silence);
    silence.connect(context.destination);
  };

  socket.onmessage = (event) => {
    const frame = decodeFrame(event.data as ArrayBuffer);
    if (!frame) return;
    if (frame.error) {
      handlers.onError("stream", frame.error);
      finish("error");
      return;
    }
    if (frame.partial) {
      handlers.onTranscript(settled.join(" "), frame.text);
    } else {
      settled.push(frame.text.trim());
      handlers.onTranscript(settled.join(" "), "");
    }
  };

  socket.onerror = () => {
    if (!opened && !stopped) {
      // Never connected: the device recogniser is better than an error screen.
      socket = null;
      listenWithDevice(token.stream_language);
    }
  };

  socket.onclose = () => {
    if (!stopped && opened) finish("error");
  };

  return { stop: () => finish("user") };
}
