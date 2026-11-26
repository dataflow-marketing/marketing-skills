// store-add: names a store in settings (a folder of files or a Ghost site's member fields), a binding that says
// which store keeps which object (or both). It writes settings only; it never reads or writes an object.
//
// node dist/run.js --store <name> --settings <file> [--connector file|ghost --where <folder or site>]
//   [--object <kind> --business <name> --place <place>] [--preview | --go | --read-back] [--run-log <file>] [--json]
// For a Ghost store the place is a member's email and a field, in quotes: --place "owner@example.com next".
// --preview (the default) shows the lines and writes nothing; --go appends them; --read-back checks them.
// Exit code: 0 done, 1 problems found, 2 refused or failed.

import { EXIT_DONE, EXIT_PROBLEMS_FOUND, EXIT_REFUSED_OR_FAILED, outputMode, writeMode } from "@dataflow-marketing/core";
import type { OutputMode } from "@dataflow-marketing/core";
import { appendRunLine, printOutput, runLogPath } from "@dataflow-marketing/core/node";
import { readFlags } from "@dataflow-marketing/store";
import { checkReadBack } from "./check-read-back.ts";
import { describeAdded, describePlan, describeReadBack } from "./describe-result.ts";
import { appendSettingsText, readSettingsText } from "./node/settings-file.ts";
import { planAdd } from "./plan-add.ts";
import { readRequest } from "./read-request.ts";

const SKILL = "dfm-store:store-add";
const USAGE =
  'node dist/run.js --store <name> --settings <file> [--connector file|ghost --where <folder or site>] [--object <kind> --business <name> --place "<place>"] [--preview | --go | --read-back] [--run-log <file>] [--json]';
const FLAGS = {
  valueFlags: ["--store", "--settings", "--connector", "--where", "--object", "--business", "--place", "--run-log"],
  required: ["--store", "--settings"],
  usage: USAGE,
};

async function main(args: string[]): Promise<number> {
  const output = outputMode(args);

  const mode = writeMode(args);
  if (!mode.ok) {
    return failed(mode.problem);
  }
  const flags = readFlags(args, FLAGS);
  if (!flags.ok) {
    return failed(flags.problem);
  }
  const asked = readRequest(flags.values);
  if (!asked.ok) {
    return failed(asked.problem);
  }
  const settingsPath = flags.values["--settings"];

  const before = await readSettingsText(settingsPath);
  const plan = planAdd(before, asked.request);

  if (mode.mode === "read-back") {
    return readBack(plan, settingsPath, output);
  }
  if (plan.kind === "refused") {
    printOutput(describePlan(plan, settingsPath), output);
    return EXIT_REFUSED_OR_FAILED;
  }
  if (plan.kind === "already there" || mode.mode === "preview") {
    printOutput(describePlan(plan, settingsPath), output);
    return EXIT_DONE;
  }

  await appendSettingsText(settingsPath, plan.append);
  await appendRunLine(runLogPath(settingsPath, flags.values["--run-log"]), {
    when: new Date(),
    skill: SKILL,
    what: "store lines added",
    where: `settings ${settingsPath}`,
    before: "",
    after: plan.lines.join(" | "),
  });

  const problems = checkReadBack(await readSettingsText(settingsPath), plan.lines);
  printOutput(describeAdded(plan.lines, settingsPath, problems), output);
  return problems.length === 0 ? EXIT_DONE : EXIT_REFUSED_OR_FAILED;
}

// After a write the plan finds the lines already there; anything else is a problem
async function readBack(plan: ReturnType<typeof planAdd>, settingsPath: string, output: OutputMode): Promise<number> {
  const lines = plan.kind === "already there" ? plan.lines : plan.kind === "add" ? plan.lines : [];
  const problems = plan.kind === "refused" ? [plan.problem] : checkReadBack(await readSettingsText(settingsPath), lines);
  printOutput(describeReadBack(lines, settingsPath, problems), output);
  return problems.length === 0 ? EXIT_DONE : EXIT_PROBLEMS_FOUND;
}

function failed(problem: string): number {
  process.stderr.write(`${problem}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

// Anything unexpected is said in one line and fails: only the error's message, never a stack or a value.
async function runSafely(args: string[]): Promise<number> {
  try {
    return await main(args);
  } catch (error) {
    const message = error instanceof Error ? error.message : "an unknown error";
    return failed(`Failed: ${message}`);
  }
}

process.exitCode = await runSafely(process.argv.slice(2));
