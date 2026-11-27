// How often a step was done: each period from the step's start to the last read, done when a post for the
// step was published in it. A period that starts inside a closure is left out. The period the last read
// fell in is counted only when it is already done: it is not over yet.

import { periodsFrom, type Period } from "./periods.ts";
import { postIsFor, type Closure, type Step } from "./outside-steps.ts";

export type StepCount = { done: number; of: number; notDone: string[]; closed: string[] };

export function countStep(step: Step, posts: readonly { day: string; title: string }[], closures: readonly Closure[], lastRead: string): StepCount {
  const days = posts.filter((post) => postIsFor(step, post.title)).map((post) => post.day);
  const count: StepCount = { done: 0, of: 0, notDone: [], closed: [] };

  for (const period of periodsFrom(step.every, step.from, lastRead)) {
    const done = days.some((day) => inPeriod(day, period));
    const current = inPeriod(lastRead, period);
    if (insideAClosure(period.start, closures)) {
      count.closed.push(period.start);
    } else if (done) {
      count.done += 1;
      count.of += 1;
    } else if (!current) {
      count.of += 1;
      count.notDone.push(period.start);
    }
  }
  return count;
}

// the ledger's strength words: done 3 times is assumed; in 6 or more periods with none missed, believed
export function strengthOf(count: StepCount): "believed" | "assumed" | "unknown" {
  if (count.of >= 6 && count.done === count.of) {
    return "believed";
  }
  return count.done >= 3 ? "assumed" : "unknown";
}

function inPeriod(day: string, period: Period): boolean {
  return day >= period.start && day < period.end;
}

function insideAClosure(day: string, closures: readonly Closure[]): boolean {
  return closures.some((closure) => day >= closure.from && day <= closure.to);
}
