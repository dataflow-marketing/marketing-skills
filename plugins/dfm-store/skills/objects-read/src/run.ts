// objects-read: lists every object of one kind (every ledger, every profile) bound in settings, with where each is
// and its version. Reads each one; writes nothing and prints no object's text.
//
// node dist/run.js --object <kind> --settings <file> [--json]
// Exit code: 0 each one read, 1 one or more cannot be read, 2 refused or failed.

import { EXIT_DONE, EXIT_PROBLEMS_FOUND, EXIT_REFUSED_OR_FAILED, outputMode } from "@dataflow-marketing/core";
import type { Binding, SettingsResult } from "@dataflow-marketing/core";
import { printOutput, readSettings } from "@dataflow-marketing/core/node";
import { findPlace, readFlags } from "@dataflow-marketing/store";
import { readObject } from "@dataflow-marketing/store/node";
import { bindingsOfKind } from "./bindings-of-kind.ts";
import { describeList } from "./describe-list.ts";
import type { Listed } from "./describe-list.ts";

const USAGE = "node dist/run.js --object <kind> --settings <file> [--json]";
const FLAGS = { valueFlags: ["--object", "--settings"], required: ["--object", "--settings"], usage: USAGE };

async function main(args: string[]): Promise<number> {
  const output = outputMode(args);

  const flags = readFlags(args, FLAGS);
  if (!flags.ok) {
    return failed([flags.problem]);
  }
  const { "--object": kind, "--settings": settingsPath } = flags.values;

  const read = await readSettings(settingsPath);
  if (read.problems.length > 0) {
    return failed(read.problems.map((problem) => `settings ${problem}`));
  }
  const ofKind = bindingsOfKind(read.settings, kind);
  if (!ofKind.ok) {
    return failed([ofKind.problem]);
  }

  const listed: Listed[] = [];
  for (const binding of ofKind.bindings) {
    listed.push(await readOne(read, binding));
  }

  printOutput(describeList(kind, listed), output);
  if (listed.some((each) => !each.ok)) {
    return EXIT_PROBLEMS_FOUND;
  }
  return EXIT_DONE;
}

// One object: where its binding says it is, its version and how many lines it has
async function readOne(read: SettingsResult, binding: Binding): Promise<Listed> {
  const place = findPlace(read, binding.object, binding.business);
  if (!place.ok) {
    return { business: binding.business, ok: false, problem: place.problems.join(" ") };
  }
  const object = await readObject(place.place);
  if (!object.ok) {
    return { business: binding.business, ok: false, problem: object.problem };
  }
  const text = object.text.trimEnd();
  const lines = text === "" ? 0 : text.split("\n").length;
  return { business: binding.business, ok: true, where: place.place.label, version: object.version, lines };
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
