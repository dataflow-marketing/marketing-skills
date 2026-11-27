// said-read: what a business sent or published in a week, from each Ghost site its ledger's facts name, as said lines
// in the business's own words. Reads only: it writes nothing. dfm-ledger:plan-change adds the lines on a yes.
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
import { askPosts } from "./ask-posts.ts";
import { describeResult } from "./describe-result.ts";
import { findSites } from "./find-sites.ts";
import type { GhostSite } from "./find-sites.ts";
import { readArgs } from "./read-args.ts";
import { saidLines } from "./said-lines.ts";
import type { TagGroup } from "./said-lines.ts";

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

  const graph = readLedger(ledgerText).graph;
  const sites = findSites(graph?.facts ?? [], settings.settings.sites);
  if (sites.problems.length > 0) {
    return failed(sites.problems.join("\n"));
  }

  const now = new Date();
  const range = weekRange(asked.args.week ?? mondayOf(nowIn(timeZone, now).today), timeZone, now);
  if (!range.ok) {
    return failed(range.problem);
  }

  const groups = tagGroups(graph?.groups ?? []);
  const said = await sayEachSite(sites.sites, groups, range.range, settings.settings, timeZone);
  if (!said.ok) {
    return failed(said.problem);
  }

  printOutput(describeResult(asked.args.ledger, range.range, timeZone, said.lines, sites.sites.length), outputMode(args));
  return EXIT_DONE;
}

// the groups that name who a post is for: those whose rule is a tag
function tagGroups(groups: readonly { name: string; rule: { kind: string; tag?: string } }[]): TagGroup[] {
  return groups.flatMap((group) => (group.rule.kind === "tag" && group.rule.tag ? [{ name: group.name, tag: group.rule.tag }] : []));
}

async function sayEachSite(sites: readonly GhostSite[], groups: readonly TagGroup[], range: WeekRange, settings: Settings, timeZone: string): Promise<Outcome<{ lines: string[] }>> {
  const lines: string[] = [];
  for (const site of sites) {
    const token = await tokenFor(site, settings);
    if (!token.ok) {
      return token;
    }
    const answer = await askPosts({ address: site.address, token: token.token, from: range.from, to: range.to });
    if (!answer.ok) {
      return answer;
    }
    lines.push(...saidLines(answer.posts, groups, range, timeZone));
  }
  return { ok: true, lines };
}

// the key goes from the keys file into the token and nowhere else
async function tokenFor(site: GhostSite, settings: Settings): Promise<Outcome<{ token: string }>> {
  if (!settings.keysFile) {
    return { ok: false, problem: "Name the keys file in settings first: keys file: ~/.config/dfm/.env" };
  }
  try {
    return { ok: true, token: await adminToken(await readKey(settings.keysFile, site.keyName)) };
  } catch (error) {
    const named = error instanceof Error && (error.name === "MissingKeyError" || error.name === "MalformedAdminKeyError");
    return { ok: false, problem: named ? (error as Error).message : `Cannot read ${site.keyName} from the keys file ${settings.keysFile}.` };
  }
}

function failed(problem: string): number {
  process.stderr.write(`${problem}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

process.exitCode = await main(process.argv.slice(2));
