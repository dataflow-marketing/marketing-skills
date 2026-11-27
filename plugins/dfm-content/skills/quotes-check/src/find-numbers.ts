// Finds the numbers in one line, in figures ("6.30", "1,000"), as dates ("2026-11-28")
// or in words ("four"). Each comes with the key it is matched on: "four" and "4" are
// the same number; a date is matched whole.

import { findDates } from "./dates.ts";
import { numberKey } from "./number-key.ts";
import { findNumberWords } from "./number-words.ts";
import type { Span } from "./span.ts";

export type NumberMention = Span & {
  written: string;
  key: string;
};

const FIGURES = /\d(?:[\d,.]*\d)?/g;

export function findNumbers(line: string): NumberMention[] {
  const found: NumberMention[] = [];

  for (const date of findDates(line)) {
    const written = line.slice(date.start, date.end);
    found.push({ ...date, written, key: written });
  }

  for (const match of line.matchAll(FIGURES)) {
    const start = match.index ?? 0;
    if (insideAny(found, start)) {
      continue;
    }
    found.push({
      start,
      end: start + match[0].length,
      written: match[0],
      key: numberKey(match[0]),
    });
  }

  for (const words of findNumberWords(line)) {
    found.push({
      start: words.start,
      end: words.end,
      written: words.written,
      key: String(words.value),
    });
  }

  return found.sort((first, second) => first.start - second.start);
}

function insideAny(spans: readonly Span[], at: number): boolean {
  return spans.some((span) => at >= span.start && at < span.end);
}
