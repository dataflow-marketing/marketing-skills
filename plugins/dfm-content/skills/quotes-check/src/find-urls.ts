// Finds the web addresses in a line. An address is a link, not a quote, a name or a number:
// it is blanked out before the other finders read the line.

import type { Span } from "./span.ts";

const ADDRESS = /(?:https?:\/\/|www\.)\S+/g;

export function findUrls(line: string): Span[] {
  const spans: Span[] = [];
  for (const match of line.matchAll(ADDRESS)) {
    const start = match.index ?? 0;
    spans.push({ start, end: start + match[0].length });
  }
  return spans;
}
