// store-check: proves each binding in settings can be read: its store is there, its key works, a Ghost member
// is found once and has the field. Writes nothing.
//
// node dist/run.js --settings <file> [--json]
// Exit code: 0 every binding can be read, 1 problems found, 2 refused or failed.

import { EXIT_DONE, EXIT_PROBLEMS_FOUND, EXIT_REFUSED_OR_FAILED, outputMode } from "@dataflow-marketing/core";
import type { Binding, SettingsResult } from "@dataflow-marketing/core";
import { printOutput, readSettings } from "@dataflow-marketing/core/node";
import { findPlace, readFlags } from "@dataflow-marketing/store";
import { backupsFolder, readObject } from "@dataflow-marketing/store/node";
import { describeCheck } from "./describe-check.ts";
import type { BindingChecked } from "./describe-check.ts";

const USAGE = "node dist/run.js --settings <file> [--json]";
const FLAGS = { valueFlags: ["--settings"], required: ["--settings"], usage: USAGE };

async function main(args: string[]): Promise<number> {
  const output = outputMode(args);

  const flags = readFlags(args, FLAGS);
  if (!flags.ok) {
    return failed([flags.problem]);
  }
  const settingsPath = flags.values["--settings"];

  const read = await readSettings(settingsPath);
  if (read.problems.length > 0) {
    return failed(read.problems.map((problem) => `settings ${problem}`));
  }

  const checked: BindingChecked[] = [];
  for (const binding of read.settings.bindings) {
    checked.push(await checkBinding(read, binding));
  }

  printOutput(describeCheck(checked, backupsFolder(settingsPath, read.settings.backups)), output);
  if (checked.some((each) => !each.ok)) {
    return EXIT_PROBLEMS_FOUND;
  }
  return EXIT_DONE;
}

async function checkBinding(read: SettingsResult, binding: Binding): Promise<BindingChecked> {
  const named = { object: binding.object, business: binding.business };
  const place = findPlace(read, binding.object, binding.business);
  if (!place.ok) {
    return { ...named, ok: false, problem: place.problems.join(" ") };
  }
  const object = await readObject(place.place);
  if (!object.ok) {
    return { ...named, ok: false, problem: object.problem };
  }
  const lines = object.text.trimEnd() === "" ? 0 : object.text.trimEnd().split("\n").length;
  return { ...named, ok: true, where: place.place.label, version: object.version, lines };
}

function failed(problems: readonly string[]): number {
  process.stderr.write(`${problems.join("\n")}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

// Anything unexpected is said in one line and fails: only the error's message, never a stack or a value.
async function runSafely(args: string[]): Promise<number> {
  try {
    return await main(args);
  } catch (error) {
    const message = error instanceof Error ? error.message : "an unknown error";
    return failed([`Failed: ${message}`]);
  }
}

process.exitCode = await runSafely(process.argv.slice(2));
