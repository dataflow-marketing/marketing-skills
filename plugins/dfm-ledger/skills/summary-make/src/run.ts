// summary-make: writes a ledger's summary part from the lines above it (spec/ledger.md, Summary), never by hand.
// A scripted write: it previews by default, writes with --go and reads back.
//
// node dist/run.js --ledger <file> --settings <file> [--today <date>] [--preview | --go | --read-back] [--run-log <file>] [--json]
// Exit code: 0 done (or current), 1 read back found the summary not current, 2 refused or failed.

import { EXIT_DONE, EXIT_PROBLEMS_FOUND, EXIT_REFUSED_OR_FAILED, nowIn, outputMode, parseSettings, writeMode } from "@dataflow-marketing/core";
import { appendRunLine, printOutput, readText, runLogPath, writeText } from "@dataflow-marketing/core/node";
import { readLedger } from "@dataflow-marketing/ledger/read";
import { writeSummary } from "@dataflow-marketing/ledger/summary";
import { describeResult } from "./describe-result.ts";
import { putSummary, summaryIn } from "./put-summary.ts";
import { readArgs } from "./read-args.ts";

const SKILL = "dfm-ledger:summary-make";

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

  const settingsText = await readText(asked.args.settings);
  if (settingsText === undefined) {
    return failed(`Cannot read the settings: ${asked.args.settings}`);
  }
  const settings = parseSettings(settingsText);
  if (settings.problems.length > 0 || !settings.settings.timeZone) {
    return failed(`Fix the settings first: ${settings.problems.join("; ")}`);
  }
  const ledgerText = await readText(asked.args.ledger);
  if (ledgerText === undefined) {
    return failed(`Cannot read the ledger: ${asked.args.ledger}`);
  }
  const ledger = readLedger(ledgerText);
  if (ledger.unreadable.length > 0) {
    return failed(`The ledger has lines that cannot be read: run dfm-ledger:plan-check and fix them first.`);
  }

  const today = asked.args.today ?? nowIn(settings.settings.timeZone).today;
  const summary = writeSummary(ledger, today);

  if (mode.mode === "read-back") {
    const current = summaryIn(ledgerText).join("\n") === summary.join("\n");
    printOutput(describeResult(current ? "current" : "not current", asked.args.ledger, summary), output);
    return current ? EXIT_DONE : EXIT_PROBLEMS_FOUND;
  }
  if (mode.mode === "preview") {
    printOutput(describeResult("preview", asked.args.ledger, summary), output);
    return EXIT_DONE;
  }
  return writeAndReadBack(asked.args.ledger, ledgerText, summary, runLogPath(asked.args.settings, asked.args.runLog), output);
}

async function writeAndReadBack(
  ledgerPath: string,
  ledgerText: string,
  summary: string[],
  runLog: string,
  output: ReturnType<typeof outputMode>,
): Promise<number> {
  await writeText(ledgerPath, putSummary(ledgerText, summary));
  await appendRunLine(runLog, {
    when: new Date(),
    skill: SKILL,
    what: "summary written",
    where: `ledger ${ledgerPath}`,
    before: summaryIn(ledgerText).join(" | "),
    after: summary.join(" | "),
  });
  const back = summaryIn((await readText(ledgerPath)) ?? "");
  const same = back.join("\n") === summary.join("\n");
  printOutput(describeResult(same ? "written" : "not current", ledgerPath, summary), output);
  return same ? EXIT_DONE : EXIT_REFUSED_OR_FAILED;
}

function failed(problem: string): number {
  process.stderr.write(`${problem}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

process.exitCode = await main(process.argv.slice(2));
