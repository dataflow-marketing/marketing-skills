// Finds the numbers in one line, in figures ("6.30", "1,000") or in words ("four").
// Each comes with the key it is matched on: "four" and "4" are the same number.

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

  for (const match of line.matchAll(FIGURES)) {
    const start = match.index ?? 0;
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
