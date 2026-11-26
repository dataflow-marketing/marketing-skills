// plan-make's script: starts a business's first ledger from the starter plan, this week, in a new file. The
// conversation that shapes it (the goal, what to count, one change at a time) is Claude's, by SKILL.md, checked with
// dfm-ledger:plan-check. It never writes over a ledger.
//
// node dist/run.js --ledger <file> --settings <file> [--followers <n>] [--preview | --go] [--run-log <file>] [--json]
// Exit code: 0 done, 2 refused or failed (such as a ledger already there).

import { EXIT_DONE, EXIT_REFUSED_OR_FAILED, nowIn, outputMode, parseSettings, writeMode } from "@dataflow-marketing/core";
import { appendRunLine, printOutput, readText, runLogPath, writeText } from "@dataflow-marketing/core/node";
import { makeLedger } from "./make-ledger.ts";
import { readArgs } from "./read-args.ts";

const SKILL = "dfm-ledger:plan-make";

async function main(args: string[]): Promise<number> {
  const output = outputMode(args);
  const mode = writeMode(args);
  if (!mode.ok) {
    return failed(mode.problem);
  }
  if (mode.mode === "read-back") {
    return failed("plan-make starts a ledger: check it with dfm-ledger:plan-check.");
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
  if ((await readText(asked.args.ledger)) !== undefined) {
    return failed(`${asked.args.ledger} is already there: plan-make never writes over a ledger.`);
  }

  const ledger = makeLedger(nowIn(timeZone).today, asked.args.followers);
  if (mode.mode === "preview") {
    printOutput({ text: `preview: nothing written\nwould start ${asked.args.ledger}:\n\n${ledger}`, data: { ledger } }, output);
    return EXIT_DONE;
  }
  await writeText(asked.args.ledger, ledger);
  await appendRunLine(runLogPath(asked.args.settings, asked.args.runLog), {
    when: new Date(),
    skill: SKILL,
    what: "ledger started from the starter plan",
    where: `ledger ${asked.args.ledger}`,
    before: "",
    after: "the starter plan",
  });
  const back = await readText(asked.args.ledger);
  if (back !== ledger) {
    return failed(`Read back: ${asked.args.ledger} is not what was written.`);
  }
  printOutput({ text: `started ${asked.args.ledger} from the starter plan\nread back: it is there\n\n${ledger}`, data: { ledger } }, output);
  return EXIT_DONE;
}

function failed(problem: string): number {
  process.stderr.write(`${problem}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

process.exitCode = await main(process.argv.slice(2));
