// llms-check: is a site's /llms.txt on and what it holds; is there an /llms-full.txt. Reads only, never writes.
//
// node dist/run.js --address <https://...> [--json]
// Exit code: 0 both are on, 1 one or both are not on, 2 refused or failed.

import { EXIT_DONE, EXIT_PROBLEMS_FOUND, EXIT_REFUSED_OR_FAILED, outputMode } from "@dataflow-marketing/core";
import { printOutput } from "@dataflow-marketing/core/node";
import { checkLlms } from "./check-llms.ts";
import { describeCheck } from "./describe.ts";
import { readArgs } from "./read-args.ts";
import { siteAddress } from "./site-address.ts";

async function main(args: string[]): Promise<number> {
  const asked = readArgs(args);
  if (!asked.ok) {
    return failed(asked.problem);
  }
  const site = siteAddress(asked.address);
  if (!site.ok) {
    return failed(site.problem);
  }
  const check = await checkLlms(site.origin, (url, init) => fetch(url, init));
  printOutput({ text: describeCheck(check), data: check }, outputMode(args));
  return check.llmsTxt.on && check.llmsFull.on ? EXIT_DONE : EXIT_PROBLEMS_FOUND;
}

function failed(problem: string): number {
  process.stderr.write(`${problem}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

process.exitCode = await main(process.argv.slice(2));
