// plan-change: makes the Change: lines from an AI chat's response (or written by hand) into the ledger, after a yes
// (spec/ask-ai.md, The way back). A scripted write: it previews by default, writes with --go and reads back.
// The whole change is refused when any line is not a ledger line: nothing is guessed.
//
// node dist/run.js --ledger <file> --settings <file> --changes <file> [--preview | --go | --read-back] [--run-log <file>] [--json]
// Exit code: 0 done, 1 read back found a line missing, 2 refused or failed.
// The whole change is worked out first (change-plan.ts); nothing is written when any line is not a ledger line.

import type { OutputMode } from "@dataflow-marketing/core";
import { EXIT_DONE, EXIT_PROBLEMS_FOUND, EXIT_REFUSED_OR_FAILED, outputMode, parseSettings, writeMode } from "@dataflow-marketing/core";
import { appendRunLine, printOutput, readText, runLogPath, writeText } from "@dataflow-marketing/core/node";
import type { PartChange } from "@dataflow-marketing/ledger/put-in-part";
import { putInPart } from "@dataflow-marketing/ledger/put-in-part";
import type { PartName } from "@dataflow-marketing/ledger/read";
import { readLedger } from "@dataflow-marketing/ledger/read";
import { changePlan } from "./change-plan.ts";
import type { ChangeItem, PartChanges } from "./change-plan.ts";
import type { Outcome } from "./describe-result.ts";
import { describeResult } from "./describe-result.ts";
import { findChanges } from "./find-changes.ts";
import { readArgs } from "./read-args.ts";

const SKILL = "dfm-ledger:plan-change";

async function main(args: string[]): Promise<number> {
  const output = outputMode(args);
  const mode = writeMode(args);
  if (!mode.ok) {
    return failed(mode.problem);
  }
  const asked = readArgs(args);
  if (!asked.ok) {
    return failed(asked.problem);
  }
  const settings = parseSettings((await readText(asked.args.settings)) ?? "");
  if (settings.problems.length > 0) {
    return failed(`Fix the settings first: ${settings.problems.join("; ")}`);
  }
  const ledgerText = await readText(asked.args.ledger);
  const response = await readText(asked.args.changes);
  if (ledgerText === undefined || response === undefined) {
    return failed(`Cannot read ${ledgerText === undefined ? asked.args.ledger : asked.args.changes}`);
  }
  if (readLedger(ledgerText).unreadable.length > 0) {
    return failed("The ledger has lines that cannot be read: run dfm-ledger:plan-check and fix them first.");
  }

  const plan = changePlan(ledgerText, findChanges(response));
  if (!plan.ok) {
    return failed(plan.problems.join("\n"));
  }
  if (mode.mode === "preview") {
    printOutput(describeResult("preview", asked.args.ledger, plan.items), output);
    return EXIT_DONE;
  }
  if (mode.mode === "go") {
    const changed = applyEachPart(ledgerText, plan.parts);
    if (readLedger(changed).unreadable.length > 0) {
      return failed("The changed ledger would have lines that cannot be read: nothing was written.");
    }
    await writeText(asked.args.ledger, changed);
    await appendRunLine(runLogPath(asked.args.settings, asked.args.runLog), {
      when: new Date(),
      skill: SKILL,
      what: "plan changed",
      where: `ledger ${asked.args.ledger}`,
      before: plan.items.flatMap((item) => (item.kind === "replace" ? item.old : [])).join(" | "),
      after: plan.items.filter((item) => item.kind !== "already there").map((item) => item.line).join(" | "),
    });
  }
  return readBack(asked.args.ledger, plan.items, output, mode.mode === "go" ? "written" : "read back");
}

// each part's change, in turn
function applyEachPart(ledgerText: string, parts: PartChanges): string {
  let text = ledgerText;
  for (const [part, change] of Object.entries(parts) as [PartName, PartChange][]) {
    text = putInPart(text, part, change);
  }
  return text;
}

// every change line is now in the ledger, read fresh from the file
async function readBack(ledgerPath: string, items: ChangeItem[], output: OutputMode, outcome: Outcome): Promise<number> {
  const there = ((await readText(ledgerPath)) ?? "").split("\n").map((line) => line.trim());
  const missing = items.map((item) => item.line).filter((line) => !there.includes(line));
  printOutput(describeResult(outcome, ledgerPath, items, missing), output);
  return missing.length === 0 ? EXIT_DONE : EXIT_PROBLEMS_FOUND;
}

function failed(problem: string): number {
  process.stderr.write(`${problem}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

process.exitCode = await main(process.argv.slice(2));
