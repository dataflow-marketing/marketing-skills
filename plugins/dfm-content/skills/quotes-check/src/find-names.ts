// Finds the names in one line: words that start with a capital letter.
// A capital that starts a sentence is not a name ("Cake comes from next door"):
// a word is skipped at the start of a line, a list item or a bracket
// and after a full stop, question mark, exclamation mark or colon.

import type { Span } from "./span.ts";

export type NameMention = Span & {
  written: string;
};

const CAPITALISED_WORD = /(?<![\p{L}\p{N}])\p{Lu}\p{L}+/gu;
const OPENING_MARKS = /[\s(["'\u201C\u2018]+$/;
const ONLY_A_LIST_MARKER = /^[\s\-*+>#]*$/;
const ENDS_A_SENTENCE = /[.!?:]$/;

export function findNames(line: string): NameMention[] {
  const found: NameMention[] = [];

  for (const match of line.matchAll(CAPITALISED_WORD)) {
    const start = match.index ?? 0;
    if (startsASentence(line.slice(0, start))) {
      continue;
    }
    found.push({ start, end: start + match[0].length, written: match[0] });
  }

  return found;
}

function startsASentence(before: string): boolean {
  const withoutOpeningMarks = before.replace(OPENING_MARKS, "");
  if (ONLY_A_LIST_MARKER.test(withoutOpeningMarks)) {
    return true;
  }
  return ENDS_A_SENTENCE.test(withoutOpeningMarks);
}
