// What recording the told numbers and ticks would change in the done part, worked out before anything is written.
//
//   a count     `<week> fact count <fact>: <n>`, replacing that week's earlier count of the fact
//   a total     `<today> fact total <fact>: <n>`, on the day it was told
//   a tick      `<week> <step>: done at <time> <time zone>` (or `not done`), replacing that week's earlier answer
//   so far      this week's counts are so far: `<week> counted to <today>`; a week gone by is whole and loses it
//
// Refused: a count or total of a fact the graph does not declare; a tick for a step not in that week.
// Pure: takes the ledger as read and what was told, gives back the lines to write or every problem.

import { addDays, mondayOf } from "@dataflow-marketing/ledger/dates";
import type { Ledger } from "@dataflow-marketing/ledger/read";
import { weekSteps } from "@dataflow-marketing/ledger/week-steps";
import { written } from "@dataflow-marketing/ledger/numbers";
import type { Told } from "./told.ts";

export type WhatWasTold = { counts: Told[]; totals: Told[]; done: string[]; notDone: string[] };

export type When = { week: string; today: string; stamp: string; timeZone: string };

// lines to take out (each line that starts with one of these) and lines to add, in the done part
export type DoneChange = { remove: string[]; add: string[] };

export type RecordPlan = { ok: true; change: DoneChange } | { ok: false; problems: string[] };

export function recordPlan(ledger: Ledger, told: WhatWasTold, when: When): RecordPlan {
  const problems = [...checkWeek(when), ...checkFacts(ledger, told), ...checkSteps(ledger, told, when.week)];
  if (problems.length > 0) {
    return { ok: false, problems };
  }
  const change: DoneChange = { remove: [], add: [] };
  addCounts(change, told.counts, when.week);
  addTotals(change, told.totals, when.today);
  addAnswers(change, told, when);
  addSoFar(change, told, when);
  return { ok: true, change };
}

function checkWeek(when: When): string[] {
  if (mondayOf(when.week) !== when.week) {
    return [`The week is named by its Monday: ${when.week} is not a Monday.`];
  }
  if (when.week > mondayOf(when.today)) {
    return [`The week of ${when.week} has not begun.`];
  }
  return [];
}

function checkFacts(ledger: Ledger, told: WhatWasTold): string[] {
  const declared = new Set((ledger.graph?.facts ?? []).map((fact) => fact.fact));
  return [...told.counts, ...told.totals]
    .map((each) => each.name.replace(/\s*\[.+\]$/, ""))
    .filter((fact) => !declared.has(fact))
    .map((fact) => `The graph does not declare the fact ${fact}: add a line such as "fact ${fact}: told" first.`);
}

function checkSteps(ledger: Ledger, told: WhatWasTold, week: string): string[] {
  if (told.done.length + told.notDone.length === 0) {
    return [];
  }
  const steps = ledger.plan ? weekSteps(ledger.plan, ledger.done ?? { weeks: {} }, week).steps : [];
  return [...told.done, ...told.notDone]
    .filter((step) => !steps.includes(step))
    .map((step) => `${step} is not a step in the week of ${week}.`);
}

function addCounts(change: DoneChange, counts: Told[], week: string): void {
  for (const count of counts) {
    change.remove.push(`${week} fact count ${count.name}:`);
    change.add.push(`${week} fact count ${count.name}: ${written(count.n)}`);
  }
}

function addTotals(change: DoneChange, totals: Told[], today: string): void {
  for (const total of totals) {
    change.remove.push(`${today} fact total ${total.name}:`);
    change.add.push(`${today} fact total ${total.name}: ${written(total.n)}`);
  }
}

function addAnswers(change: DoneChange, told: WhatWasTold, when: When): void {
  for (const step of told.done) {
    change.remove.push(`${when.week} ${step}:`);
    change.add.push(`${when.week} ${step}: done at ${when.stamp} ${when.timeZone}`);
  }
  for (const step of told.notDone) {
    change.remove.push(`${when.week} ${step}:`);
    change.add.push(`${when.week} ${step}: not done`);
  }
}

// counts for this week are so far, to today; counts for a week gone by make it whole
function addSoFar(change: DoneChange, told: WhatWasTold, when: When): void {
  if (told.counts.length === 0) {
    return;
  }
  change.remove.push(`${when.week} counted to `);
  const weekEnds = addDays(when.week, 6);
  if (when.today < weekEnds) {
    change.add.push(`${when.week} counted to ${when.today}`);
  }
}
