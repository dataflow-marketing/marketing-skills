// Replaces stretches of a line with spaces, keeping its length.
// What was found once is then not found again by the next finder.

import type { Span } from "./span.ts";

export function blankOut(line: string, spans: readonly Span[]): string {
  let result = line;
  for (const span of spans) {
    const before = result.slice(0, span.start);
    const blank = " ".repeat(span.end - span.start);
    const after = result.slice(span.end);
    result = before + blank + after;
  }
  return result;
}
