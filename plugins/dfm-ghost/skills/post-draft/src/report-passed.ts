// The guardrail before anything goes to Ghost: a quotes-check report that passed,
// for this words file, checked against the source the words file names in from
// and made after the words file last changed.

import type { CheckReport } from "./read-report.ts";
import { samePath } from "./same-path.ts";

export type ReportFor = {
  wordsPath: string;
  from: string;
  reportIsNewer: boolean;
};

const AGAIN = "Run dfm-content:quotes-check again.";

export function reportPassed(report: CheckReport, wordsFor: ReportFor): string[] {
  const problems: string[] = [];

  if (report.spec !== "spec 1") {
    problems.push("The report is not a check report: it does not start with spec 1.");
    return problems;
  }
  if (report.result !== "passed") {
    problems.push(`The check report says: ${report.result ?? "no result"}. A draft with problems goes nowhere: remove what was not found. ${AGAIN}`);
  }
  if (!report.checked || !samePath(report.checked, wordsFor.wordsPath)) {
    problems.push(`The check report is for ${report.checked ?? "no file"}, not ${wordsFor.wordsPath}.`);
  }
  if (!checkedAgainst(report, wordsFor.from)) {
    problems.push(`The check report was not checked against ${wordsFor.from}, the source named in the words file. ${AGAIN}`);
  }
  if (!wordsFor.reportIsNewer) {
    problems.push(`The words file changed after the check. ${AGAIN}`);
  }

  return problems;
}

function checkedAgainst(report: CheckReport, from: string): boolean {
  for (const source of report.against) {
    if (samePath(source, from)) {
      return true;
    }
  }
  return false;
}
