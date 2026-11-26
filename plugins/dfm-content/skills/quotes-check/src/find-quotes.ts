// Finds the quotes in one line: text between double quote marks, straight or curly.
// Marks are paired in order, first with second, third with fourth.
// Pairing in order keeps a list such as "regulars", "the counter" apart
// and is not thrown by a quote inside brackets.
// A mark left over has no pair: code cannot say what it quotes.

import type { Span } from "./span.ts";

export type Quote = Span & {
  inner: string;
};

export type QuotesInLine = {
  quotes: Quote[];
  unpaired: boolean;
};

const QUOTE_MARK = /["\u201C\u201D]/g;

export function findQuotes(line: string): QuotesInLine {
  const marks = quoteMarkPositions(line);
  const quotes: Quote[] = [];

  for (let index = 0; index + 1 < marks.length; index += 2) {
    const open = marks[index];
    const close = marks[index + 1];
    quotes.push({
      start: open,
      end: close + 1,
      inner: line.slice(open + 1, close),
    });
  }

  const unpaired = marks.length % 2 === 1;
  return { quotes, unpaired };
}

function quoteMarkPositions(line: string): number[] {
  const positions: number[] = [];
  for (const match of line.matchAll(QUOTE_MARK)) {
    positions.push(match.index ?? 0);
  }
  return positions;
}
