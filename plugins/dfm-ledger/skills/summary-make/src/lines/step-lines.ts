// This week's steps, ticked and not yet, with any carried from an earlier week: an AI reading the ledger then never
// offers help with a step already done.

import { addDays, mondayOf } from "@dataflow-marketing/ledger/dates";
import type { Done, Plan } from "@dataflow-marketing/ledger/read";
import { weekSteps } from "@dataflow-marketing/ledger/week-steps";

export function stepLines(plan: Plan | undefined, done: Done, today: string): string[] {
  if (!plan) {
    return [];
  }
  const week = mondayOf(today);
  const { steps, carried } = weekSteps(plan, done, week);
  if (steps.length === 0) {
    return [];
  }
  const answers = done.weeks[week]?.answers ?? {};
  const named = (step: string) => (carried[step] ? `${step} (carried from the week of ${carried[step]})` : step);
  const ticked = steps.filter((step) => answers[step] === "done").map(named);
  const open = steps.filter((step) => answers[step] !== "done").map(named);
  return [
    `this week's steps, ${week} to ${addDays(week, 6)}: done: ${ticked.join(", ") || "none yet"}; not done yet: ${open.join(", ") || "none"} (calculated, happened)`,
  ];
}
