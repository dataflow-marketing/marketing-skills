// The summary's lines for a ledger read from outside (spec/market.md, The summary, from outside), after the lines
// every ledger gets. Only a ledger with a read has them.

import type { Ledger } from "../../read/index.ts";
import { outsideOf, type Outside } from "./outside-steps.ts";
import { countStep, strengthOf } from "./step-count.ts";
import { listOf, PERIOD_WORDS } from "./words.ts";

export function outsideLines(ledger: Ledger): string[] {
  const outside = outsideOf(ledger);
  const first = outside.reads[0];
  const last = outside.reads.at(-1);
  if (!first || !last) {
    return [];
  }
  const lines = [`as at ${last.monday}, read ${outside.reads.length} ${outside.reads.length === 1 ? "time" : "times"} from ${first.monday}`];
  lines.push(postsLine(outside));
  lines.push(...planLines(outside, last.day));
  lines.push(`changed at the last read: ${changesAt(outside, (monday) => monday === last.monday)}`);
  if (outside.reads.length > 2) {
    lines.push(`changed at earlier reads: ${changesAt(outside, (monday) => monday !== first.monday && monday !== last.monday)}`);
  }
  const ended = offersEnded(ledger, last.monday);
  if (ended.length > 0) {
    lines.push(`offers ended: ${listOf(ended)}`);
  }
  const noProof = claimsWithNoProof(ledger);
  lines.push(`claims with no proof: ${noProof.length > 0 ? noProof.join(", ") : "none"}`);
  return lines.map((line) => `${line} (calculated)`);
}

function postsLine(outside: Outside): string {
  const days = outside.posts.map((post) => post.day).sort();
  const total = outside.postsTotal ?? days.length;
  if (total === 0) {
    return "posts: none on the site";
  }
  const range = days.length > 0 ? `, published from ${days[0]} to ${days[days.length - 1]}` : "";
  return `posts: ${total}${range}`;
}

function planLines(outside: Outside, lastReadDay: string): string[] {
  if (outside.steps.length === 0) {
    return [outside.posts.length === 0 ? "plan: none worked out, no posts to work from" : "plan: none worked out"];
  }
  return outside.steps.map((step) => {
    const count = countStep(step, outside.posts, outside.closures, lastReadDay);
    const words = PERIOD_WORDS[step.every];
    const parts = [`every ${step.every} ${step.name}: done ${count.done} of ${count.of} ${words.many}`];
    if (count.notDone.length > 0) {
      parts.push(`not in ${count.notDone.length === 1 ? words.one : words.ones} ${listOf(count.notDone)}`);
    }
    if (count.closed.length > 0) {
      parts.push(`${count.closed.length === 1 ? words.one : words.ones} ${listOf(count.closed)} inside a closure`);
    }
    parts.push(strengthOf(count));
    return parts.join(", ");
  });
}

function changesAt(outside: Outside, at: (monday: string) => boolean): string {
  const changes = outside.changes.filter((change) => at(change.monday)).map((change) => `${change.monday} ${change.text}`);
  return changes.length > 0 ? changes.join("; ") : "nothing";
}

function offersEnded(ledger: Ledger, asAt: string): string[] {
  return (ledger.graph?.things ?? []).filter((thing) => thing.word === "offer" && thing.until && thing.until < asAt).map((thing) => `${thing.name} on ${thing.until}`);
}

function claimsWithNoProof(ledger: Ledger): string[] {
  return (ledger.graph?.things ?? []).filter((thing) => thing.word === "claim" && thing.proved === false).map((thing) => `"${thing.name}"`);
}
