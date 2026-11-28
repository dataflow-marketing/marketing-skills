// links-check: the links on a site that do not work for a visitor. Reads the home page and the pages its sitemap
// lists (up to 50), then checks every link on them once, one at a time with a pause. Reads only, never writes.
//
// node dist/run.js --address <https://...> [--max-pages <n>] [--json]
// Exit code: 0 every link works, 1 some do not, 2 refused or failed.

import { EXIT_DONE, EXIT_PROBLEMS_FOUND, EXIT_REFUSED_OR_FAILED, outputMode } from "@dataflow-marketing/core";
import { printOutput } from "@dataflow-marketing/core/node";
import { checkSite } from "./check-site.ts";
import { describeCheck } from "./describe.ts";
import { readArgs } from "./read-args.ts";
import { siteAddress } from "./site-address.ts";

const MAX_LINKS = 300;
const PAUSE_MS = 250;

async function main(args: string[]): Promise<number> {
  const asked = readArgs(args);
  if (!asked.ok) {
    return failed(asked.problem);
  }
  const site = siteAddress(asked.args.address);
  if (!site.ok) {
    return failed(site.problem);
  }
  const wait = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));
  const check = await checkSite(site.origin, (url, init) => fetch(url, init), wait, { maxPages: asked.args.maxPages, maxLinks: MAX_LINKS, pauseMs: PAUSE_MS });
  printOutput({ text: describeCheck(check), data: check }, outputMode(args));
  return check.broken.length === 0 ? EXIT_DONE : EXIT_PROBLEMS_FOUND;
}

function failed(problem: string): number {
  process.stderr.write(`${problem}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

process.exitCode = await main(process.argv.slice(2));
