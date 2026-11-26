// object-read: reads one object wherever settings keep it, with its version. Writes nothing to the store.
//
// node dist/run.js --object <kind> --business <name> --settings <file> [--out <file>] [--json]
// --out saves the text to a new file to edit; it never replaces a file that is there.
// Exit code: 0 done, 2 refused or failed.

import { EXIT_DONE, EXIT_REFUSED_OR_FAILED, outputMode } from "@dataflow-marketing/core";
import { printOutput, readSettings, readText, writeText } from "@dataflow-marketing/core/node";
import { findPlace, readFlags } from "@dataflow-marketing/store";
import { readObject } from "@dataflow-marketing/store/node";
import { describeRead } from "./describe-read.ts";

const USAGE = "node dist/run.js --object <kind> --business <name> --settings <file> [--out <file>] [--json]";
const FLAGS = { valueFlags: ["--object", "--business", "--settings", "--out"], required: ["--object", "--business", "--settings"], usage: USAGE };

async function main(args: string[]): Promise<number> {
  const output = outputMode(args);

  const flags = readFlags(args, FLAGS);
  if (!flags.ok) {
    return failed([flags.problem]);
  }
  const { "--object": object, "--business": business, "--settings": settings, "--out": out } = flags.values;

  const place = findPlace(await readSettings(settings), object, business);
  if (!place.ok) {
    return failed(place.problems);
  }

  const read = await readObject(place.place);
  if (!read.ok) {
    return failed([read.problem]);
  }

  if (out !== undefined) {
    if ((await readText(out)) !== undefined) {
      return failed([`${out} is already there. Name a new file with --out.`]);
    }
    await writeText(out, read.text);
  }

  printOutput(describeRead({ object, business, where: place.place.label, version: read.version, text: read.text, savedTo: out }), output);
  return EXIT_DONE;
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
