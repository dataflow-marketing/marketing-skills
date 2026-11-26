// Writes what plan-check found as a short report for a person and as data for another script.
//
//   spec 1
//   checked: ledger.txt
//   result: 1 problem
//
//   step with no link: market stall (line 33)
//   not read yet: business (line 3)

import type { ScriptResult } from "@dataflow-marketing/core";
import type { CheckFiles } from "./read-args.ts";
import type { CheckResult, Problem, SetAside } from "./problem.ts";

export function writeReport(files: CheckFiles, result: CheckResult): ScriptResult {
  const outcome = resultLine(result.problems.length);
  const lines = ["spec 1", `checked: ${files.ledger}`];
  if (files.settings) {
    lines.push(`settings: ${files.settings}`);
  }
  lines.push(`result: ${outcome}`);

  const found = [...result.problems.map(problemLine), ...result.setAside.map(setAsideLine)];
  if (!result.ledgerChecked) {
    found.push("ledger not checked: resolve the settings first");
  }
  if (found.length > 0) {
    lines.push("", ...found);
  }

  return {
    text: lines.join("\n"),
    data: { spec: 1, checked: files.ledger, settings: files.settings, result: outcome, ...result },
  };
}

function resultLine(problems: number): string {
  if (problems === 0) {
    return "passed";
  }
  if (problems === 1) {
    return "1 problem";
  }
  return `${problems} problems`;
}

function problemLine(problem: Problem): string {
  if (problem.lines.length === 0) {
    return `${problem.kind}: ${problem.about}`;
  }
  return `${problem.kind}: ${problem.about} (${linesText(problem.lines)})`;
}

function setAsideLine(line: SetAside): string {
  return `not read yet: ${line.word} (line ${line.line})`;
}

function linesText(lines: number[]): string {
  if (lines.length === 1) {
    return `line ${lines[0]}`;
  }
  const allButLast = lines.slice(0, -1).join(", ");
  return `lines ${allButLast} and ${lines[lines.length - 1]}`;
}
