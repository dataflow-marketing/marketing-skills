// plan-check: reads a ledger and names every problem in it. Reads only: it never writes.
//
// node dist/run.js --ledger <file> [--settings <file>] [--json]
// Exit code: 0 no problems, 1 problems found, 2 failed.

import { EXIT_DONE, EXIT_PROBLEMS_FOUND, EXIT_REFUSED_OR_FAILED, outputMode } from "@dataflow-marketing/core";
import { printOutput } from "@dataflow-marketing/core/node";
import { checkPlan } from "./check-plan.ts";
import { readFiles } from "./node/read-files.ts";
import { readArgs } from "./read-args.ts";
import { writeReport } from "./write-report.ts";

async function main(args: string[]): Promise<number> {
  const mode = outputMode(args);

  const asked = readArgs(args);
  if (!asked.ok) {
    return failed(asked.problem);
  }

  const read = await readFiles(asked.files);
  if (!read.ok) {
    return failed(read.problem);
  }

  const result = checkPlan(read.ledger, read.settings);
  printOutput(writeReport(asked.files, result), mode);

  if (result.problems.length > 0) {
    return EXIT_PROBLEMS_FOUND;
  }
  return EXIT_DONE;
}

function failed(problem: string): number {
  process.stderr.write(`${problem}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

process.exitCode = await main(process.argv.slice(2));
