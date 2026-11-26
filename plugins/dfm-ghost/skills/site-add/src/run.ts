// site-add: names a Ghost site in settings: its name, its address and the
// variable that holds its key. It never sees, asks for or writes a key.
//
// node dist/run.js --name <name> --address <https://...> --key-name <NAME> --settings <file>
//   [--time-zone <zone>] [--keys-file <file>] [--preview | --go | --read-back] [--run-log <file>] [--json]
// --time-zone is needed only to start a new settings file; --keys-file only when settings name no keys file yet.
// --preview (the default) shows the line and writes nothing; --go appends it; --read-back checks it.
// Exit code: 0 done, 1 problems found, 2 refused or failed.

import {
  EXIT_DONE,
  EXIT_PROBLEMS_FOUND,
  EXIT_REFUSED_OR_FAILED,
  outputMode,
  writeMode,
} from "@dataflow-marketing/core";
import type { OutputMode, Site } from "@dataflow-marketing/core";
import { appendRunLine, printOutput, runLogPath } from "@dataflow-marketing/core/node";
import { checkReadBack } from "./check-read-back.ts";
import { checkSite } from "./check-site.ts";
import { describeAdded, describePlan, describeReadBack, describeReplaced } from "./describe-result.ts";
import { appendSettingsText, readSettingsText, writeSettingsText } from "./node/settings-file.ts";
import { planAdd } from "./plan-add.ts";
import type { AddPlan } from "./plan-add.ts";
import { readArgs } from "./read-args.ts";
import type { SiteAddArgs } from "./read-args.ts";
import { siteLine } from "./site-line.ts";

const SKILL = "dfm-ghost:site-add";

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

  const checked = checkSite(asked.args.name, asked.args.address, asked.args.keyName);
  if (!checked.ok) {
    return failed(checked.problems.join("\n"));
  }

  if (mode.mode === "read-back") {
    return readBack(asked.args, checked.site, output);
  }
  return addSite(asked.args, checked.site, output, mode.mode === "go");
}

async function addSite(asked: SiteAddArgs, site: Site, output: OutputMode, go: boolean): Promise<number> {
  const before = await readSettingsText(asked.settings);
  const plan = planAdd(before, site, { timeZone: asked.timeZone, keysFile: asked.keysFile });
  printOutputIfNotWriting(plan, asked, output, go);

  if (plan.kind === "refused") {
    return EXIT_REFUSED_OR_FAILED;
  }
  if (plan.kind === "already there" || !go) {
    return EXIT_DONE;
  }

  await writeTheChange(asked.settings, plan);
  await appendRunLine(runLogPath(asked.settings, asked.runLog), {
    when: new Date(),
    skill: SKILL,
    what: plan.kind === "replace" ? "public site made a Ghost site" : "site added",
    where: `settings ${asked.settings}`,
    before: plan.kind === "replace" ? plan.replaces : "",
    after: plan.lines.join(" | "),
  });

  const problems = checkReadBack(await readSettingsText(asked.settings), site);
  printOutput(describeWritten(plan, asked.settings, problems), output);
  if (problems.length > 0) {
    return EXIT_REFUSED_OR_FAILED;
  }
  return EXIT_DONE;
}

// An added line is appended; a replaced line rewrites the file with that one line swapped
async function writeTheChange(settingsPath: string, plan: Extract<AddPlan, { kind: "add" | "replace" }>): Promise<void> {
  if (plan.kind === "replace") {
    await writeSettingsText(settingsPath, plan.text);
    return;
  }
  await appendSettingsText(settingsPath, plan.append);
}

function describeWritten(plan: Extract<AddPlan, { kind: "add" | "replace" }>, settingsPath: string, problems: string[]) {
  if (plan.kind === "replace") {
    return describeReplaced(plan, settingsPath, problems);
  }
  return describeAdded(plan.lines, settingsPath, problems);
}

// A preview, a refusal or a site already there is said now; a write is said after its read back.
function printOutputIfNotWriting(plan: AddPlan, asked: SiteAddArgs, output: OutputMode, go: boolean): void {
  const writing = go && (plan.kind === "add" || plan.kind === "replace");
  if (!writing) {
    printOutput(describePlan(plan, asked.settings), output);
  }
}

async function readBack(asked: SiteAddArgs, site: Site, output: OutputMode): Promise<number> {
  const problems = checkReadBack(await readSettingsText(asked.settings), site);
  printOutput(describeReadBack(siteLine(site), asked.settings, problems), output);

  if (problems.length > 0) {
    return EXIT_PROBLEMS_FOUND;
  }
  return EXIT_DONE;
}

function failed(problem: string): number {
  process.stderr.write(`${problem}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

// Anything unexpected, such as a settings file that is not there, is said in one line
// and fails: only the error's message is printed, never a stack or a value.
async function runSafely(args: string[]): Promise<number> {
  try {
    return await main(args);
  } catch (error) {
    const message = error instanceof Error ? error.message : "an unknown error";
    return failed(`Failed: ${message}`);
  }
}

process.exitCode = await runSafely(process.argv.slice(2));
