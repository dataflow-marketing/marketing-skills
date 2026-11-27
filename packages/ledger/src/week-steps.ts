// The steps of one week from a plan: its every week steps (from the plan's start or their own date) and its dated
// steps, with carry forward (carry.ts). Used by the summary and by counting a week.

import { stepsInWeek } from "./carry.ts";
import type { WeekSteps } from "./carry.ts";
import { addDays } from "./dates.ts";
import type { Done } from "./ledger-types.ts";
import type { Entry, Plan } from "./read/ledger-shape.ts";

// week is a Monday; the week runs to its Sunday
export function weekSteps(plan: Plan, done: Done, week: string): WeekSteps {
  const end = addDays(week, 6);
  return stepsInWeek([...plan.entries, ...repeatsIn(plan, week)], done, week, end);
}

// each every week step that has begun by this week, as a step planned for its Monday
function repeatsIn(plan: Plan, week: string): Entry[] {
  const entries: Entry[] = [];
  // a step worked out from what a business published is not one of its own steps
  for (const repeat of plan.repeats.filter((each) => !each.inferred)) {
    const from = repeat.from ?? plan.start;
    if (from === undefined || from <= addDays(week, 6)) {
      entries.push({ date: week, op: "=", methods: repeat.methods, line: repeat.line });
    }
  }
  return entries;
}
