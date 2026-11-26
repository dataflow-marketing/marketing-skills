// Writes the check report in the shape of spec/check-report.md:
// text for a person and the same as data for --json.
// Money is reported on number lines: the spec has no money line.

import type { ScriptResult } from "@dataflow-marketing/core";
import type { CheckLine, CheckResult, MentionKind, Where } from "./types.ts";

export type ReportFiles = {
  checked: string;
  against: string[];
};

const LABELS: Record<MentionKind, string> = {
  quote: "quote",
  name: "name",
  number: "number",
  money: "number",
  claim: "claim to read",
};

export function writeReport(files: ReportFiles, result: CheckResult): ScriptResult {
  const severalSources = files.against.length > 1;
  const lines: string[] = [];

  lines.push("spec 1");
  lines.push(`checked: ${files.checked}`);
  for (const source of files.against) {
    lines.push(`against: ${source}`);
  }
  lines.push(`result: ${resultWords(result.problems)}`);
  lines.push("");
  for (const line of result.lines) {
    lines.push(reportLine(line, severalSources));
  }

  return { text: lines.join("\n").trimEnd(), data: reportData(files, result) };
}

function resultWords(problems: number): string {
  if (problems === 0) {
    return "passed";
  }
  if (problems === 1) {
    return "1 problem";
  }
  return `${problems} problems`;
}

function reportLine(line: CheckLine, severalSources: boolean): string {
  const label = LABELS[line.kind];
  if (line.kind === "claim") {
    return `${label}: ${line.written}`;
  }
  if (!line.found || !line.where) {
    return `${label} not found: ${line.written}`;
  }
  return `${label} found: ${line.written} (${whereWords(line.where, severalSources)})`;
}

function whereWords(where: Where, severalSources: boolean): string {
  if (severalSources) {
    return `${where.source} line ${where.line}`;
  }
  return `line ${where.line}`;
}

function reportData(files: ReportFiles, result: CheckResult) {
  return {
    spec: 1,
    checked: files.checked,
    against: files.against,
    result: result.problems === 0 ? "passed" : "problems",
    problems: result.problems,
    lines: result.lines,
  };
}
