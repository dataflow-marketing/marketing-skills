// market-read: a business's site read from the outside, kept as a market ledger (spec/market.md).
// Code writes what it can: each read, its counts, its posts as said lines, the ticks and the summary.
// The model writes the graph, the plan and what changed; quotes-check proves them.
//
// See read-args.ts for the three jobs. A read is written to a new file, never over one.
// Exit code: 0 done, 2 refused or failed.

import { EXIT_DONE, EXIT_REFUSED_OR_FAILED, outputMode } from "@dataflow-marketing/core";
import { printOutput, readText, writeText } from "@dataflow-marketing/core/node";
import { addRead } from "./add-read.ts";
import { findGaps, gapsText } from "./gaps.ts";
import { newLedger } from "./new-ledger.ts";
import { readArgs, type MarketArgs } from "./read-args.ts";
import { readCounts } from "./read-counts.ts";
import { readPosts } from "./read-posts.ts";
import { refresh } from "./refresh.ts";
import { workedOutDates } from "./worked-out-dates.ts";

async function main(args: string[]): Promise<number> {
  const asked = readArgs(args);
  if (!asked.ok) {
    return failed(asked.problem);
  }
  const job = asked.args;
  if (job.job === "read") {
    return await addAReadJob(job, args);
  }
  if (job.job === "summary") {
    return await summaryJob(job, args);
  }
  return await gapsJob(job, args);
}

async function addAReadJob(job: Extract<MarketArgs, { job: "read" }>, args: string[]): Promise<number> {
  if ((await readText(job.out)) !== undefined) {
    return failed(`${job.out} is already there: name a new file. A read never writes over one.`);
  }
  const ledger = job.ledger ? await readText(job.ledger) : newLedger(job.business ?? "", job.site ?? "", job.own);
  if (ledger === undefined) {
    return failed(`Cannot read ${job.ledger}`);
  }
  const pages = (await readText(`${job.folder}/pages.txt`)) ?? (await readText(`${job.folder}/llms-full.txt`));
  const counted = await readText(`${job.folder}/counted.txt`);
  const counts = counted === undefined ? undefined : readCounts(counted);
  if (pages === undefined || counts === undefined) {
    return failed(`Cannot read the pages and counts in ${job.folder}: run profile-make there first.`);
  }

  const added = addRead(ledger, { day: job.day, counts, posts: readPosts(pages) });
  const written = refresh(added.text);
  await writeText(job.out, written);
  await writeDates(job.dates, written);

  const note = added.undated > 0 ? `, ${added.undated} with no published day (counted, not said)` : "";
  printOutput({ text: `wrote ${job.out}: read on ${job.day}, ${added.newPosts} new posts${note}`, data: { out: job.out, newPosts: added.newPosts, undated: added.undated } }, outputMode(args));
  return EXIT_DONE;
}

async function summaryJob(job: Extract<MarketArgs, { job: "summary" }>, args: string[]): Promise<number> {
  const ledger = await readText(job.ledger);
  if (ledger === undefined) {
    return failed(`Cannot read ${job.ledger}`);
  }
  const written = refresh(ledger);
  await writeText(job.ledger, written);
  await writeDates(job.dates, written);
  printOutput({ text: `wrote the ticks and summary of ${job.ledger}`, data: { ledger: job.ledger } }, outputMode(args));
  return EXIT_DONE;
}

async function gapsJob(job: Extract<MarketArgs, { job: "gaps" }>, args: string[]): Promise<number> {
  const ledger = await readText(job.ledger);
  const market = await readText(job.market);
  if (ledger === undefined || market === undefined) {
    return failed(`Cannot read ${ledger === undefined ? job.ledger : job.market}`);
  }
  const gaps = findGaps(ledger, market);
  printOutput({ text: gapsText(gaps), data: gaps }, outputMode(args));
  return EXIT_DONE;
}

// the dates worked out: the file is code's, except a line the model added for a date from words
async function writeDates(file: string | undefined, ledger: string): Promise<void> {
  if (file) {
    await writeText(file, workedOutDates(ledger, (await readText(file)) ?? ""));
  }
}

function failed(problem: string): number {
  process.stderr.write(`${problem}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

process.exitCode = await main(process.argv.slice(2));
