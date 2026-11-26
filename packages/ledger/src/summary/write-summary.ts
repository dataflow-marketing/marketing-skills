// The summary of a ledger (spec/ledger.md, Summary), written from its graph, plan and done parts, never by hand.
// Every line ends with its summary source and says whether it is a want, an expectation or something that happened.
// Pure: takes the ledger as read and today's date, gives back the summary's lines.

import type { Ledger } from "../read/index.ts";
import { contentLines } from "./lines/content-lines.ts";
import { soFarLines, totalLines, weeklyLines } from "./lines/count-lines.ts";
import { forecastLines, goalLines } from "./lines/goal-lines.ts";
import { notCountedLines } from "./lines/not-counted-lines.ts";
import { rateLines } from "./lines/rate-lines.ts";
import { scannerLines } from "./lines/scanner-lines.ts";
import { stepLines } from "./lines/step-lines.ts";

export function writeSummary(ledger: Ledger, today: string): string[] {
  const done = ledger.done ?? { weeks: {}, facts: [], others: [] };
  const want = ledger.plan?.want;
  return [
    ...goalLines(want),
    ...weeklyLines(done, want?.fact),
    ...totalLines(done),
    ...soFarLines(done),
    ...stepLines(ledger.plan, done, today),
    ...rateLines(ledger.graph),
    ...forecastLines(want, done, today),
    ...contentLines(done),
    ...scannerLines(done),
    ...notCountedLines(ledger.graph, done),
  ];
}
