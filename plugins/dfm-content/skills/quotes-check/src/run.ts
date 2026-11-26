// quotes-check: proves that every quote, name, number and amount of money in a text
// can be found in its source. Plain code, never a model.
//
// node dist/run.js --text <file> --against <file> [--against <file>] [--json]
// Exit code: 0 passed, 1 problems found, 2 failed.

import { EXIT_DONE, EXIT_PROBLEMS_FOUND, EXIT_REFUSED_OR_FAILED, outputMode } from "@dataflow-marketing/core";
import { printOutput } from "@dataflow-marketing/core/node";
import { checkText } from "./check-text.ts";
import { readTextFiles } from "./node/read-text-files.ts";
import { readArgs } from "./read-args.ts";
import { writeReport } from "./write-report.ts";

async function main(args: string[]): Promise<number> {
  const mode = outputMode(args);

  const asked = readArgs(args);
  if (!asked.ok) {
    return failed(asked.problem);
  }

  const read = await readTextFiles(asked.files);
  if (!read.ok) {
    return failed(read.problem);
  }

  const result = checkText(read.text, read.sources);
  const report = writeReport({ checked: asked.files.text, against: asked.files.against }, result);
  printOutput(report, mode);

  if (result.problems > 0) {
    return EXIT_PROBLEMS_FOUND;
  }
  return EXIT_DONE;
}

function failed(problem: string): number {
  process.stderr.write(`${problem}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

process.exitCode = await main(process.argv.slice(2));
