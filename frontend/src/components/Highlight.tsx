interface Props {
  text: string;
  /** Exact snippets from the verdict's red flags. Anything not found is skipped. */
  evidence: string[];
}

interface Range {
  start: number;
  end: number;
}

function findRanges(text: string, evidence: string[]): Range[] {
  const haystack = text.toLowerCase();
  const ranges: Range[] = [];

  for (const snippet of evidence) {
    const needle = snippet.trim().toLowerCase();
    if (needle.length < 3) continue;
    let from = 0;
    // Highlight every occurrence, not just the first: scam texts repeat the
    // fake link more than once.
    for (;;) {
      const at = haystack.indexOf(needle, from);
      if (at === -1) break;
      ranges.push({ start: at, end: at + needle.length });
      from = at + needle.length;
    }
  }

  ranges.sort((a, b) => a.start - b.start);
  const merged: Range[] = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}

export function Highlight({ text, evidence }: Props) {
  const ranges = findRanges(text, evidence);
  if (ranges.length === 0) return <>{text}</>;

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach((range, i) => {
    if (range.start > cursor) parts.push(text.slice(cursor, range.start));
    parts.push(
      <mark
        key={i}
        className="rounded-sm bg-suspicious-tint px-0.5 font-semibold text-ink decoration-scam decoration-2 underline-offset-4 underline"
      >
        {text.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));

  return <>{parts}</>;
}
