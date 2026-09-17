/** The alarm the guardian hears.
 *
 * Deliberately built with the Web Audio API rather than an audio file: no asset
 * to download, it works offline, and it starts instantly — which matters when
 * the whole point is that somebody is being pressured right now.
 *
 * Browsers block audio until the user has interacted with the page, so the
 * dashboard primes this on the sign-in tap.
 */
let ctx: AudioContext | null = null;
let stopAt = 0;

export function primeAlarm(): void {
  try {
    ctx ??= new AudioContext();
    void ctx.resume();
  } catch {
    // No audio available; the visual alarm still fires.
  }
}

/** A two-tone rise-and-fall, like an emergency siren, for `seconds`. */
export function startAlarm(seconds = 6): void {
  try {
    ctx ??= new AudioContext();
    void ctx.resume();
  } catch {
    return;
  }
  if (!ctx) return;

  const now = ctx.currentTime;
  if (now < stopAt) return; // already sounding
  stopAt = now + seconds;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.connect(ctx.destination);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.connect(gain);

  // Alternate 660Hz and 880Hz twice a second, fading out at the end.
  for (let t = 0; t < seconds; t += 0.5) {
    osc.frequency.setValueAtTime(t % 1 < 0.5 ? 660 : 880, now + t);
    gain.gain.setValueAtTime(0.14, now + t);
    gain.gain.setValueAtTime(0.0001, now + t + 0.42);
  }
  gain.gain.linearRampToValueAtTime(0.0001, now + seconds);

  osc.start(now);
  osc.stop(now + seconds + 0.05);
}

export function vibrate(): void {
  try {
    navigator.vibrate?.([300, 120, 300, 120, 600]);
  } catch {
    // Not supported on iOS; the sound and the screen carry it.
  }
}
