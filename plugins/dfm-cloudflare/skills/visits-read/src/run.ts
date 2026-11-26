// visits-read: reads a week's numbers from Cloudflare Web Analytics for every fact in the ledger's graph whose
// source is cloudflare. Reads only: it writes nothing. dfm-ledger:counts-record records the numbers on a yes.
//
// node dist/run.js --ledger <file> --settings <file> [--week <Monday>] [--json]
// Exit code: 0 read, 2 refused or failed.

import { EXIT_DONE, EXIT_REFUSED_OR_FAILED, nowIn, outputMode, parseSettings } from "@dataflow-marketing/core";
import type { Settings } from "@dataflow-marketing/core";
import { printOutput, readKey, readText } from "@dataflow-marketing/core/node";
import { mondayOf } from "@dataflow-marketing/ledger/dates";
import { readLedger } from "@dataflow-marketing/ledger/read";
import { addUp } from "./add-up.ts";
import { askCloudflare } from "./ask-cloudflare.ts";
import { describeResult } from "./describe-result.ts";
import type { Counted } from "./describe-result.ts";
import { factsToRead } from "./facts-to-read.ts";
import type { FactToRead } from "./facts-to-read.ts";
import { readArgs } from "./read-args.ts";
import { sitesForFacts } from "./sites-for-facts.ts";
import type { CloudflareSite } from "./sites-for-facts.ts";
import { weekRange } from "@dataflow-marketing/ledger/week-range";
import type { WeekRange } from "@dataflow-marketing/ledger/week-range";

async function main(args: string[]): Promise<number> {
  const asked = readArgs(args);
  if (!asked.ok) {
    return failed(asked.problem);
  }

  const settings = parseSettings((await readText(asked.args.settings)) ?? "");
  const timeZone = settings.settings.timeZone;
  if (settings.problems.length > 0 || !timeZone) {
    return failed(`Fix the settings first: ${settings.problems.join("; ") || "they cannot be read"}`);
  }
  const ledgerText = await readText(asked.args.ledger);
  if (ledgerText === undefined) {
    return failed(`Cannot read the ledger: ${asked.args.ledger}`);
  }

  const facts = factsToRead(readLedger(ledgerText).graph?.facts ?? []);
  const sites = sitesForFacts(facts.facts, settings.settings.sites);
  const problems = [...facts.problems, ...sites.problems];
  if (problems.length > 0) {
    return failed(problems.join("\n"));
  }

  const now = new Date();
  const range = weekRange(asked.args.week ?? mondayOf(nowIn(timeZone, now).today), timeZone, now);
  if (!range.ok) {
    return failed(range.problem);
  }

  const counted = await countEachFact(facts.facts, sites.sites, range.range, settings.settings);
  if (!counted.ok) {
    return failed(counted.problem);
  }

  printOutput(describeResult(asked.args.ledger, range.range, timeZone, counted.counted), outputMode(args));
  return EXIT_DONE;
}

// one question to Cloudflare per site, then each fact takes its measure from its site's numbers
async function countEachFact(
  facts: readonly FactToRead[],
  sites: readonly CloudflareSite[],
  range: WeekRange,
  settings: Settings,
): Promise<{ ok: true; counted: Counted[] } | { ok: false; problem: string }> {
  const counted: Counted[] = [];

  for (const site of sites) {
    const token = await tokenFor(site, settings);
    if (!token.ok) {
      return token;
    }
    const answer = await askCloudflare({ account: site.account, token: token.token, host: site.host, from: range.from, to: range.to });
    if (!answer.ok) {
      return answer;
    }
    const numbers = addUp(site.host, answer.rows);
    for (const fact of facts.filter((each) => each.host === site.host)) {
      counted.push({ ...fact, n: numbers[fact.measure], estimated: numbers.estimated });
    }
  }

  return { ok: true, counted };
}

async function tokenFor(site: CloudflareSite, settings: Settings): Promise<{ ok: true; token: string } | { ok: false; problem: string }> {
  if (!settings.keysFile) {
    return { ok: false, problem: "Name the keys file in settings first: keys file: ~/.config/dfm/.env" };
  }
  try {
    return { ok: true, token: await readKey(settings.keysFile, site.keyName) };
  } catch (error) {
    return { ok: false, problem: (error as Error).message };
  }
}

function failed(problem: string): number {
  process.stderr.write(`${problem}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

process.exitCode = await main(process.argv.slice(2));
