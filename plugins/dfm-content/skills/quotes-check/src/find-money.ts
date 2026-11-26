// Finds amounts of money in one line ("$5.50", "AUD 12", "20 dollars")
// and currencies named with no amount ("dollars", "USD").
// Each is matched on its currency and its amount: "$5.50" is not found by "5.50" alone
// or by the same amount in pounds.

import { numberKey } from "./number-key.ts";
import type { Span } from "./span.ts";

export type MoneyMention = Span & {
  written: string;
  key: string;
};

const AMOUNT = String.raw`\d[\d,]*(?:\.\d+)?`;
const SYMBOL_THEN_AMOUNT = new RegExp(String.raw`(A\$|US\$|NZ\$|\$|\u00A3|\u20AC)\s?(${AMOUNT})`, "g");
const CODE_THEN_AMOUNT = new RegExp(String.raw`\b(AUD|USD|NZD|GBP|EUR)\s?(${AMOUNT})`, "g");
const AMOUNT_THEN_NAME = new RegExp(String.raw`(${AMOUNT})\s?(dollars?|euros?|AUD|USD|NZD|GBP|EUR)\b`, "gi");
const NAME_ALONE = /\b(dollars?|euros?|AUD|USD|NZD|GBP|EUR)\b/gi;

const CURRENCIES: Record<string, string> = {
  "$": "dollar",
  dollar: "dollar",
  dollars: "dollar",
  "a$": "AUD",
  aud: "AUD",
  "us$": "USD",
  usd: "USD",
  "nz$": "NZD",
  nzd: "NZD",
  "\u00A3": "GBP",
  gbp: "GBP",
  "\u20AC": "EUR",
  eur: "EUR",
  euro: "EUR",
  euros: "EUR",
};

export function findMoney(line: string): MoneyMention[] {
  const found: MoneyMention[] = [];

  for (const match of line.matchAll(SYMBOL_THEN_AMOUNT)) {
    addIfFree(found, match, match[1], match[2]);
  }
  for (const match of line.matchAll(CODE_THEN_AMOUNT)) {
    addIfFree(found, match, match[1], match[2]);
  }
  for (const match of line.matchAll(AMOUNT_THEN_NAME)) {
    addIfFree(found, match, match[2], match[1]);
  }
  for (const match of line.matchAll(NAME_ALONE)) {
    addIfFree(found, match, match[1], "");
  }

  return found.sort((first, second) => first.start - second.start);
}

export function currencyOf(key: string): string {
  return key.split(" ")[0];
}

function addIfFree(found: MoneyMention[], match: RegExpMatchArray, currency: string, amount: string): void {
  const start = match.index ?? 0;
  const end = start + match[0].length;
  for (const taken of found) {
    if (start < taken.end && taken.start < end) {
      return;
    }
  }
  found.push({ start, end, written: match[0], key: moneyKey(currency, amount) });
}

function moneyKey(currency: string, amount: string): string {
  const name = CURRENCIES[currency.toLowerCase()];
  if (amount === "") {
    return name;
  }
  return `${name} ${numberKey(amount)}`;
}
