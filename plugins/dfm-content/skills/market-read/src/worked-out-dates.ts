// The dates a market ledger works out, for quotes-check and for a person to read (spec/market.md, Checked).
// Code writes each Monday with the day it is for; a line the model wrote (a date from words) is kept.

import { readDone } from "./done-lines.ts";
import { splitParts } from "./ledger-parts.ts";

const A_MONDAY = / is the Monday of the week of /;

export function workedOutDates(ledgerText: string, before: string): string {
  const done = readDone(splitParts(ledgerText).done);
  const mondays = [...done.reads, ...done.said].map((each) => `${each.monday} is the Monday of the week of ${each.day}`);
  const fromWords = before.split(/\r?\n/).filter((line) => line.trim() !== "" && !A_MONDAY.test(line));
  return `${[...new Set([...mondays].sort()), ...fromWords].join("\n")}\n`;
}
