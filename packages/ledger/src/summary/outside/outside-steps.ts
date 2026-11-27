// What a ledger read from outside knows, as the summary counts it (spec/market.md, The plan, worked out): the steps
// worked out from what a business published, its closures, its reads, its posts and what each read found changed.

import type { Ledger } from "../../read/index.ts";

export type Every = "week" | "month" | "2 weeks";
export type Step = { name: string; every: Every; from: string };
export type Closure = { from: string; to: string };
export type Read = { monday: string; day: string };
export type Post = { day: string; title: string };
export type Change = { monday: string; text: string };

export type Outside = { steps: Step[]; closures: Closure[]; reads: Read[]; posts: Post[]; changes: Change[]; postsTotal?: number };

export function outsideOf(ledger: Ledger): Outside {
  const plan = ledger.plan;
  const weeks = ledger.done?.weeks ?? {};
  const mondays = Object.keys(weeks).sort();
  const reads = mondays.flatMap((monday) => (weeks[monday].readOn ? [{ monday, day: weeks[monday].readOn as string }] : []));
  const last = reads.at(-1);
  return {
    steps: inferredSteps(ledger),
    closures: (plan?.ons ?? []).map((on) => ({ from: on.from, to: on.to })),
    reads,
    posts: mondays.flatMap((monday) => (weeks[monday].said ?? []).filter((said) => said.how === "on site").map((said) => ({ day: said.on, title: said.title }))),
    changes: mondays.flatMap((monday) => (weeks[monday].changes ?? []).map((text) => ({ monday, text }))),
    postsTotal: last ? weeks[last.monday].totals.posts : undefined,
  };
}

// only a step worked out from what it published is counted by its posts: a step it tells us is ticked by the person
function inferredSteps(ledger: Ledger): Step[] {
  const plan = ledger.plan;
  const steps: Step[] = [];
  for (const repeat of plan?.repeats ?? []) {
    const from = repeat.from ?? plan?.start;
    if (repeat.inferred && from) {
      steps.push({ every: "week", name: repeat.methods.map((method) => method.name).join(", "), from });
    }
  }
  for (const repeat of plan?.otherRepeats ?? []) {
    const from = repeat.from ?? plan?.start;
    if (repeat.inferred && from) {
      steps.push({ every: repeat.every, name: repeat.name, from });
    }
  }
  return steps;
}

// "a post" is any post; any other step is found in the titles of its posts
export function postIsFor(step: Step, title: string): boolean {
  return step.name === "a post" || title.toLowerCase().includes(step.name.toLowerCase());
}
