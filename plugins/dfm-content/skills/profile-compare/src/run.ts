// profile-compare: what changed in a business's profile between two reads, part by part; or several businesses'
// profiles side by side. Reads only. Claude writes the short summary from what this prints, never from memory.
//
// node dist/run.js --before <profile> --after <profile> [--json]
// node dist/run.js --side-by-side <name>=<profile> <name>=<profile> ... [--json]
// Exit code: 0 compared, 2 refused or failed (a profile that cannot be read).

import { EXIT_DONE, EXIT_REFUSED_OR_FAILED, outputMode } from "@dataflow-marketing/core";
import { printOutput, readText } from "@dataflow-marketing/core/node";
import { overTime, overTimeText, sideBySideText } from "./compare.ts";
import { readArgs } from "./read-args.ts";

async function main(args: string[]): Promise<number> {
  const asked = readArgs(args);
  if (!asked.ok) {
    return failed(asked.problem);
  }

  if (asked.args.mode === "over time") {
    const before = await readText(asked.args.before);
    const after = await readText(asked.args.after);
    if (before === undefined || after === undefined) {
      return failed(`Cannot read ${before === undefined ? asked.args.before : asked.args.after}`);
    }
    const result = overTime(before, after);
    printOutput({ text: overTimeText({ before: asked.args.before, after: asked.args.after }, result), data: result }, outputMode(args));
    return EXIT_DONE;
  }

  const profiles = [];
  for (const each of asked.args.profiles) {
    const text = await readText(each.file);
    if (text === undefined) {
      return failed(`Cannot read ${each.file}`);
    }
    profiles.push({ name: each.name, text });
  }
  printOutput({ text: sideBySideText(profiles), data: { names: profiles.map((each) => each.name) } }, outputMode(args));
  return EXIT_DONE;
}

function failed(problem: string): number {
  process.stderr.write(`${problem}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

process.exitCode = await main(process.argv.slice(2));
