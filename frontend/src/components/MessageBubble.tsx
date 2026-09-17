import type { RedFlag } from "../types";

interface Props {
  text: string;
  imagePreview: string | null;
  flags: RedFlag[];
  label: string;
}

interface Mark {
  start: number;
  end: number;
  /** 1-based, matches the numbered card in "Why we think so". */
  n: number;
}

/** Locate every red flag's evidence inside the original message so it can be
 *  marked up in place. Anything the model paraphrased simply will not match,
 *  and that is fine - the numbered card below still explains it. */
function findMarks(text: string, flags: RedFlag[]): Mark[] {
  const haystack = text.toLowerCase();
  const found: Mark[] = [];

  flags.forEach((flag, i) => {
    const needle = flag.evidence.trim().toLowerCase();
    if (needle.length < 3) return;
    let from = 0;
    for (;;) {
      const at = haystack.indexOf(needle, from);
      if (at === -1) break;
      found.push({ start: at, end: at + needle.length, n: i + 1 });
      from = at + needle.length;
    }
  });

  found.sort((a, b) => a.start - b.start);
  const merged: Mark[] = [];
  for (const mark of found) {
    const last = merged[merged.length - 1];
    // Overlaps keep the earlier flag's number rather than drawing two marks.
    if (last && mark.start < last.end) {
      last.end = Math.max(last.end, mark.end);
    } else {
      merged.push({ ...mark });
    }
  }
  return merged;
}

/** The message shown the way it arrived - as a chat bubble - with the scam
 *  parts marked in place, like a forensic exhibit rather than a bullet list. */
export function MessageBubble({ text, imagePreview, flags, label }: Props) {
  const marks = findMarks(text, flags);

  const body: React.ReactNode[] = [];
  let cursor = 0;
  marks.forEach((mark, i) => {
    if (mark.start > cursor) body.push(text.slice(cursor, mark.start));
    body.push(
      <span key={i} className="ruko-mark">
        {text.slice(mark.start, mark.end)}
        <sup className="ml-0.5 inline-flex h-[1.15em] w-[1.15em] items-center justify-center rounded-full bg-red-panel align-super text-[0.6em] font-bold text-white">
          {mark.n}
        </sup>
      </span>,
    );
    cursor = mark.end;
  });
  if (cursor < text.length) body.push(text.slice(cursor));

  return (
    <section>
      <h3 className="mb-2 text-[0.78rem] font-bold uppercase tracking-wider text-muted">
        {label}
      </h3>
      <div className="relative">
        {/* The tail, so it reads as a received message and not a quote block. */}
        <span className="absolute -left-1 top-5 h-4 w-4 rotate-45 rounded-[3px] bg-surface ring-1 ring-line" />
        <div className="relative rounded-2xl rounded-tl-md border border-line bg-surface p-4 shadow-sm">
          {text && (
            <p className="text-[1rem] leading-relaxed break-words whitespace-pre-wrap">{body}</p>
          )}
          {imagePreview && (
            <img
              src={imagePreview}
              alt=""
              className={`w-full rounded-xl border border-line ${text ? "mt-3" : ""}`}
            />
          )}
        </div>
      </div>
    </section>
  );
}
