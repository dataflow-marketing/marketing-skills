// numbers-read: reads a week's numbers from each Ghost site's Admin API (new members; emails sent, opens and clicks)
// for every fact in the ledger's graph whose source is a Ghost measure it knows. Reads only: it writes nothing.
// dfm-ledger:counts-record records the numbers on a yes.
//
// node dist/run.js --ledger <file> --settings <file> [--week <Monday>] [--json]
// Exit code: 0 read, 2 refused or failed.

import { adminToken, EXIT_DONE, EXIT_REFUSED_OR_FAILED, nowIn, outputMode, parseSettings } from "@dataflow-marketing/core";
import type { Settings } from "@dataflow-marketing/core";
import { printOutput, readKey, readText } from "@dataflow-marketing/core/node";
import { mondayOf } from "@dataflow-marketing/ledger/dates";
import { readLedger } from "@dataflow-marketing/ledger/read";
import { weekRange } from "@dataflow-marketing/ledger/week-range";
import type { WeekRange } from "@dataflow-marketing/ledger/week-range";
import { addUp } from "./add-up.ts";
import { askGhost } from "./ask-ghost.ts";
import { describeResult } from "./describe-result.ts";
import type { Counted } from "./describe-result.ts";
import { factsToRead } from "./facts-to-read.ts";
import type { FactToRead } from "./facts-to-read.ts";
import { findSites } from "./find-sites.ts";
import type { GhostSite } from "./find-sites.ts";
import { readArgs } from "./read-args.ts";

type Outcome<T> = ({ ok: true } & T) | { ok: false; problem: string };

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
  const sites = findSites(facts.facts, settings.settings.sites);
  if (sites.problems.length > 0) {
    return failed(sites.problems.join("\n"));
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

  printOutput(describeResult(asked.args.ledger, range.range, timeZone, counted.counted, facts.notRead), outputMode(args));
  return EXIT_DONE;
}

// one reading of Ghost per site, then each fact takes its measure from its site's numbers
async function countEachFact(facts: readonly FactToRead[], sites: readonly GhostSite[], range: WeekRange, settings: Settings): Promise<Outcome<{ counted: Counted[] }>> {
  const counted: Counted[] = [];

  for (const site of sites) {
    const token = await tokenFor(site, settings);
    if (!token.ok) {
      return token;
    }
    const answer = await askGhost({ address: site.address, token: token.token, from: range.from, to: range.to });
    if (!answer.ok) {
      return answer;
    }
    const numbers = addUp(answer.members, answer.emails, range, settings.ownEmails);
    for (const fact of facts.filter((each) => each.site === site.name)) {
      counted.push({ ...fact, n: numbers[fact.measure] });
    }
  }

  return { ok: true, counted };
}

// the key goes from the keys file into the token and nowhere else
async function tokenFor(site: GhostSite, settings: Settings): Promise<Outcome<{ token: string }>> {
  if (!settings.keysFile) {
    return { ok: false, problem: "Name the keys file in settings first: keys file: ~/.config/dfm/.env" };
  }
  try {
    return { ok: true, token: await adminToken(await readKey(settings.keysFile, site.keyName)) };
  } catch (error) {
    return { ok: false, problem: safeMessage(error, site, settings.keysFile) };
  }
}

// core's errors name the variable, never the key; anything else is said in words written here
function safeMessage(error: unknown, site: GhostSite, keysFile: string): string {
  if (error instanceof Error && (error.name === "MissingKeyError" || error.name === "MalformedAdminKeyError")) {
    return error.message;
  }
  return `Cannot read ${site.keyName} from the keys file ${keysFile}.`;
}

function failed(problem: string): number {
  process.stderr.write(`${problem}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

process.exitCode = await main(process.argv.slice(2));
