// counts-record: adds what the person told for one week to the ledger's done part: counts, totals and ticks.
// A scripted write: it previews by default, writes with --go and reads back. The summary is then out of date:
// dfm-ledger:summary-make writes it again.
//
// node dist/run.js --ledger <file> --settings <file> [--week <Monday>] [--count <fact=n>]... [--total <fact=n>]...
//   [--done <step>]... [--not-done <step>]... [--preview | --go | --read-back] [--run-log <file>] [--json]
// Exit code: 0 done, 1 read back found a line missing, 2 refused or failed.

import { EXIT_DONE, EXIT_PROBLEMS_FOUND, EXIT_REFUSED_OR_FAILED, outputMode, parseSettings, writeMode } from "@dataflow-marketing/core";
import type { OutputMode } from "@dataflow-marketing/core";
import { appendRunLine, printOutput, runLogPath } from "@dataflow-marketing/core/node";
import { mondayOf } from "@dataflow-marketing/ledger/dates";
import { readLedger } from "@dataflow-marketing/ledger/read";
import { describeResult } from "./describe-result.ts";
import { readText, writeText } from "./node/ledger-file.ts";
import { nowIn } from "./node/now-in.ts";
import { putDoneLines } from "./put-done-lines.ts";
import { readArgs } from "./read-args.ts";
import type { CountsArgs } from "./read-args.ts";
import { recordPlan } from "./record-plan.ts";
import type { DoneChange, WhatWasTold } from "./record-plan.ts";
import { readTold } from "./told.ts";
import type { Told } from "./told.ts";

const SKILL = "dfm-ledger:counts-record";

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
  const told = whatWasTold(asked.args);
  if (!told.ok) {
    return failed(told.problem);
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
  const ledger = readLedger(ledgerText);
  if (ledger.unreadable.length > 0) {
    return failed("The ledger has lines that cannot be read: run dfm-ledger:plan-check and fix them first.");
  }

  const { today, stamp } = nowIn(timeZone);
  const plan = recordPlan(ledger, told.told, { week: asked.args.week ?? mondayOf(today), today, stamp, timeZone });
  if (!plan.ok) {
    return failed(plan.problems.join("\n"));
  }

  if (mode.mode === "read-back") {
    return readBack(asked.args.ledger, ledgerText, plan.change, output);
  }
  if (mode.mode === "preview") {
    printOutput(describeResult("preview", asked.args.ledger, plan.change.add), output);
    return EXIT_DONE;
  }
  await writeText(asked.args.ledger, putDoneLines(ledgerText, plan.change));
  await appendRunLine(runLogPath(asked.args.settings, asked.args.runLog), {
    when: new Date(),
    skill: SKILL,
    what: "counts recorded",
    where: `ledger ${asked.args.ledger}`,
    before: "",
    after: plan.change.add.join(" | "),
  });
  return readBack(asked.args.ledger, (await readText(asked.args.ledger)) ?? "", plan.change, output, "written");
}

// every line that was to be added is in the ledger (a tick's time is left out: it is when the tick was made)
function readBack(ledgerPath: string, ledgerText: string, change: DoneChange, output: OutputMode, outcome: "written" | "read back" = "read back"): number {
  const lines = ledgerText.split("\n");
  const missing = change.add.filter((line) => !lines.some((there) => there.startsWith(withoutTime(line))));
  printOutput(describeResult(outcome, ledgerPath, change.add, missing), output);
  if (missing.length === 0) {
    return EXIT_DONE;
  }
  return outcome === "written" ? EXIT_REFUSED_OR_FAILED : EXIT_PROBLEMS_FOUND;
}

function withoutTime(line: string): string {
  return line.replace(/ done at .*$/, " done");
}

function whatWasTold(args: CountsArgs): { ok: true; told: WhatWasTold } | { ok: false; problem: string } {
  const counts: Told[] = [];
  const totals: Told[] = [];
  for (const [texts, into] of [[args.counts, counts], [args.totals, totals]] as const) {
    for (const text of texts) {
      const read = readTold(text);
      if (!read.ok) {
        return read;
      }
      into.push(read.told);
    }
  }
  const told = { counts, totals, done: args.done, notDone: args.notDone };
  if (counts.length + totals.length + told.done.length + told.notDone.length === 0) {
    return { ok: false, problem: "Nothing was told: give at least one --count, --total, --done or --not-done." };
  }
  return { ok: true, told };
}

function failed(problem: string): number {
  process.stderr.write(`${problem}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

process.exitCode = await main(process.argv.slice(2));
