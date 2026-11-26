// Finds every mention in the text that must be in the source, line by line.
// Each finder blanks out what it found, in this order. Nothing is then counted twice:
// web addresses (not checked), quotes, money, numbers, then names.

import { blankOut } from "./blank-out.ts";
import { findMoney } from "./find-money.ts";
import { findNames } from "./find-names.ts";
import { findNumbers } from "./find-numbers.ts";
import { findQuotes } from "./find-quotes.ts";
import { findUrls } from "./find-urls.ts";
import { plain } from "./plain.ts";
import type { Mention } from "./types.ts";

const PUNCTUATION_AT_THE_ENDS = /^[\s.,;:!?()]+|[\s.,;:!?()]+$/g;

export function findMentions(lines: readonly string[]): Mention[] {
  const mentions: Mention[] = [];

  lines.forEach((original, index) => {
    const textLine = index + 1;
    let line = blankOut(original, findUrls(original));

    const quotes = findQuotes(line);
    for (const quote of quotes.quotes) {
      const key = quoteKey(quote.inner);
      if (key !== "") {
        mentions.push({ kind: "quote", written: `"${quote.inner}"`, key, textLine });
      }
    }
    if (quotes.unpaired) {
      const written = `a quote mark with no pair on line ${textLine} of the text`;
      mentions.push({ kind: "claim", written, key: written, textLine });
    }
    line = blankOut(line, quotes.quotes);

    const money = findMoney(line);
    for (const amount of money) {
      mentions.push({ kind: "money", written: amount.written, key: amount.key, textLine });
    }
    line = blankOut(line, money);

    const numbers = findNumbers(line);
    for (const number of numbers) {
      mentions.push({ kind: "number", written: number.written, key: number.key, textLine });
    }
    line = blankOut(line, numbers);

    for (const name of findNames(line, original)) {
      mentions.push({ kind: "name", written: name.written, key: plain(name.written), textLine });
    }
  });

  return mentions;
}

function quoteKey(inner: string): string {
  return plain(inner).replace(PUNCTUATION_AT_THE_ENDS, "");
}
