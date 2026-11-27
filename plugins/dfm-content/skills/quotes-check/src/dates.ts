// Dates written year first ("2026-11-28") are one number: in a text the whole date
// must be in a source, never its year, month and day found in different places.
// A source still offers the parts: "since 2026" is found in a source that says "2026-11-28".

import type { Span } from "./span.ts";

const DATE = /(?<!\d)\d{4}-\d{2}-\d{2}(?!\d)/g;
const WHOLE_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function findDates(line: string): Span[] {
  return [...line.matchAll(DATE)].map((match) => {
    const start = match.index ?? 0;
    return { start, end: start + match[0].length };
  });
}

export function isDate(key: string): boolean {
  return WHOLE_DATE.test(key);
}

// The year, month and day of a date, as number keys: "2026-01-04" gives "2026", "1" and "4".
export function dateParts(date: string): string[] {
  return date.split("-").map((part) => String(Number(part)));
}
