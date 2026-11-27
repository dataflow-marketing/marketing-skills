// weeks-archive: keeps a ledger under its store's limit. Past 75% of the limit (by default), the done lines of every
// week before the last 26 move, whole, into the business's history. A scripted write: it previews by default,
// writes with --go and reads back. In a store, the ledger and the history are each written back with
// dfm-store:object-change (or object-add for a history not there yet).
//
// node dist/run.js --ledger <file> --history <file> --settings <file> [--today <date>] [--keep <weeks>]
//   [--limit <bytes>] [--at <percent>] [--preview | --go | --read-back] [--run-log <file>] [--json]
// Exit code: 0 done (or nothing to move), 1 read back found a line missing, 2 refused or failed.

import { EXIT_DONE, EXIT_PROBLEMS_FOUND, EXIT_REFUSED_OR_FAILED, nowIn, outputMode, parseSettings, writeMode } from "@dataflow-marketing/core";
import { appendRunLine, printOutput, readText, runLogPath, writeText } from "@dataflow-marketing/core/node";
import { describeResult } from "./describe-result.ts";
import { doneLines, planArchive } from "./plan-archive.ts";
import { readArgs } from "./read-args.ts";

const SKILL = "dfm-ledger:weeks-archive";

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
  const timeZone = settings.settings.timeZone;
  if (settings.problems.length > 0 || !timeZone) {
    return failed(`Fix the settings first: ${settings.problems.join("; ") || "they cannot be read"}`);
  }
  const ledgerText = await readText(asked.args.ledger);
  if (ledgerText === undefined) {
    return failed(`Cannot read the ledger: ${asked.args.ledger}`);
  }
  const historyText = (await readText(asked.args.history)) ?? "";

  const today = asked.args.today ?? nowIn(timeZone).today;
  const plan = planArchive(ledgerText, historyText, today, asked.args.rules);

  if (mode.mode === "read-back") {
    return readBack(asked.args.ledger, asked.args.history, output);
  }
  if (plan.kind !== "move" || mode.mode === "preview") {
    printOutput(describeResult("preview", asked.args.ledger, asked.args.history, plan, asked.args.rules), output);
    return EXIT_DONE;
  }

  await writeText(asked.args.history, plan.history);
  await writeText(asked.args.ledger, plan.ledger);
  await appendRunLine(runLogPath(asked.args.settings, asked.args.runLog), {
    when: new Date(),
    skill: SKILL,
    what: `moved ${plan.moving.length} done lines before ${plan.keepFrom}`,
    where: `ledger ${asked.args.ledger}, history ${asked.args.history}`,
    before: "",
    after: "",
  });
  printOutput(describeResult("written", asked.args.ledger, asked.args.history, plan, asked.args.rules), output);
  return checkMoved(asked.args.ledger, asked.args.history, plan.moving);
}

// every moved line is in the history and none is left in the ledger
async function checkMoved(ledgerPath: string, historyPath: string, moving: readonly string[]): Promise<number> {
  const inLedger = new Set(doneLines((await readText(ledgerPath)) ?? ""));
  const inHistory = new Set(doneLines((await readText(historyPath)) ?? ""));
  const missing = moving.filter((line) => !inHistory.has(line) || inLedger.has(line));
  if (missing.length > 0) {
    process.stderr.write(`read back: ${missing.length} moved lines are not where they should be\n`);
    return EXIT_PROBLEMS_FOUND;
  }
  return EXIT_DONE;
}

async function readBack(ledgerPath: string, historyPath: string, output: "text" | "json"): Promise<number> {
  const history = doneLines((await readText(historyPath)) ?? "");
  const ledger = new Set(doneLines((await readText(ledgerPath)) ?? ""));
  const both = history.filter((line) => ledger.has(line));
  printOutput({ text: `history: ${history.length} done lines; in both: ${both.length}`, data: { history: history.length, inBoth: both.length } }, output);
  return both.length > 0 ? EXIT_PROBLEMS_FOUND : EXIT_DONE;
}

function failed(problem: string): number {
  process.stderr.write(`${problem}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

process.exitCode = await main(process.argv.slice(2));
