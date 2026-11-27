// The summary: written by code from the graph, plan and done parts, never by hand (spec/market.md, Summary).
// Every line ends "(calculated)".

import type { DoneSeen } from "./done-lines.ts";
import { claimsWithNoProof, offersEnded } from "./graph-lines.ts";
import { countStep, strengthOf } from "./step-count.ts";
import type { Closure, Step } from "./plan-steps.ts";
import { listOf, PERIOD_WORDS } from "./words.ts";

export function summaryLines(graph: readonly string[], plan: { steps: Step[]; closures: Closure[] }, done: DoneSeen): string[] {
  const reads = done.reads;
  if (reads.length === 0) {
    return ["not read yet (calculated)"];
  }
  const first = reads[0];
  const last = reads[reads.length - 1];
  const lines = [`as at ${last.monday}, read ${reads.length} ${reads.length === 1 ? "time" : "times"} from ${first.monday}`];

  lines.push(postsLine(done, last.monday));
  lines.push(...planLines(plan, done, last.day));
  lines.push(`changed at the last read: ${changesAt(done, (monday) => monday === last.monday)}`);
  if (reads.length > 2) {
    lines.push(`changed at earlier reads: ${changesAt(done, (monday) => monday !== first.monday && monday !== last.monday)}`);
  }
  const ended = offersEnded(graph, last.monday);
  if (ended.length > 0) {
    lines.push(`offers ended: ${listOf(ended)}`);
  }
  const noProof = claimsWithNoProof(graph);
  lines.push(`claims with no proof: ${noProof.length > 0 ? noProof.join(", ") : "none"}`);

  return lines.map((line) => `${line} (calculated)`);
}

function postsLine(done: DoneSeen, lastMonday: string): string {
  const total = done.totals.filter((each) => each.fact === "posts" && each.monday === lastMonday).at(-1)?.n;
  const days = done.said.map((said) => said.day).sort();
  if ((total ?? days.length) === 0) {
    return "posts: none on the site";
  }
  const range = days.length > 0 ? `, published from ${days[0]} to ${days[days.length - 1]}` : "";
  return `posts: ${total ?? days.length}${range}`;
}

function planLines(plan: { steps: Step[]; closures: Closure[] }, done: DoneSeen, lastReadDay: string): string[] {
  if (plan.steps.length === 0) {
    return [done.said.length === 0 ? "plan: none worked out, no posts to work from" : "plan: none worked out"];
  }
  return plan.steps.map((step) => {
    const count = countStep(step, done.said, plan.closures, lastReadDay);
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

function changesAt(done: DoneSeen, at: (monday: string) => boolean): string {
  const changes = done.changes.filter((change) => at(change.monday)).map((change) => `${change.monday} ${change.text}`);
  return changes.length > 0 ? changes.join("; ") : "nothing";
}
