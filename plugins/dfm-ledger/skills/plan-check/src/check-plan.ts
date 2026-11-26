// plan-check's work: reads a ledger and names every problem in it.
//
//   1. settings, when given: anything bad stops the check until it is resolved (spec/settings.md)
//   2. read the ledger
//   3. lines it cannot read
//   4. counts and totals of a fact the graph does not declare
//   5. steps no link starts from
//   6. a count and a total of one fact in the same week
//
// Lines with a spec 1 word not read yet are set aside and named, never counted as problems.
// Pure: takes text, gives back what it found.

import { readLedger } from "@dataflow-marketing/ledger/read";
import { countAndTotal } from "./find/count-and-total.ts";
import { settingsProblems } from "./find/settings-problems.ts";
import { stepsWithoutLinks } from "./find/steps-without-links.ts";
import { undeclaredFacts } from "./find/undeclared-facts.ts";
import { unreadableLines } from "./find/unreadable-lines.ts";
import type { CheckResult } from "./problem.ts";

export function checkPlan(ledgerText: string, settingsText?: string): CheckResult {
  if (settingsText !== undefined) {
    const badSettings = settingsProblems(settingsText);
    if (badSettings.length > 0) {
      return { problems: badSettings, setAside: [], ledgerChecked: false };
    }
  }

  const ledger = readLedger(ledgerText);
  const problems = [
    ...unreadableLines(ledger),
    ...undeclaredFacts(ledger),
    ...stepsWithoutLinks(ledger),
    ...countAndTotal(ledger),
  ];
  const setAside = ledger.notReadYet.map((line) => ({ word: line.word, line: line.line }));

  return { problems, setAside, ledgerChecked: true };
}
