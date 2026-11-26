// Finds numbers written as words in one line and works out their value:
// "four" is 4, "twenty five" and "twenty-five" are 25, "one hundred and fifty" is 150.
// A number word then matches its figure: "four" in a text is found by "4" in the source.

import type { Span } from "./span.ts";

export type NumberWords = Span & {
  written: string;
  value: number;
};

const SMALL: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const SCALES: Record<string, number> = {
  hundred: 100,
  thousand: 1000,
  million: 1000000,
};

const WORD = /\p{L}+/gu;
const JOINS_WORDS = /^[ -]$/;
const JOINS_AFTER_A_SCALE = /^ and $/;

type Word = Span & {
  text: string;
};

export function findNumberWords(line: string): NumberWords[] {
  const found: NumberWords[] = [];
  let run: Word[] = [];

  for (const word of wordsIn(line)) {
    if (word.text === "and" && endsWithAScale(run)) {
      continue;
    }
    if (!isNumberWord(word.text)) {
      found.push(...finishRun(line, run));
      run = [];
      continue;
    }
    if (run.length > 0 && !joinsRun(line, run[run.length - 1], word)) {
      found.push(...finishRun(line, run));
      run = [];
    }
    run.push(word);
  }
  found.push(...finishRun(line, run));

  return found;
}

function wordsIn(line: string): Word[] {
  const words: Word[] = [];
  for (const match of line.matchAll(WORD)) {
    const start = match.index ?? 0;
    words.push({ start, end: start + match[0].length, text: match[0].toLowerCase() });
  }
  return words;
}

function isNumberWord(text: string): boolean {
  return text in SMALL || text in SCALES;
}

// "and" may join a number only after a scale: "one hundred and fifty".
function endsWithAScale(run: readonly Word[]): boolean {
  if (run.length === 0) {
    return false;
  }
  return run[run.length - 1].text in SCALES;
}

function joinsRun(line: string, last: Word, next: Word): boolean {
  const between = line.slice(last.end, next.start);
  if (JOINS_WORDS.test(between)) {
    return true;
  }
  return last.text in SCALES && JOINS_AFTER_A_SCALE.test(between);
}

function finishRun(line: string, run: Word[]): NumberWords[] {
  if (run.length === 0) {
    return [];
  }
  const start = run[0].start;
  const end = run[run.length - 1].end;
  const value = valueOf(run.map((word) => word.text));
  return [{ start, end, written: line.slice(start, end), value }];
}

function valueOf(words: string[]): number {
  let total = 0;
  let current = 0;

  for (const word of words) {
    if (word in SMALL) {
      current += SMALL[word];
    } else if (word === "hundred") {
      current = Math.max(current, 1) * SCALES.hundred;
    } else {
      total += Math.max(current, 1) * SCALES[word];
      current = 0;
    }
  }

  return total + current;
}
