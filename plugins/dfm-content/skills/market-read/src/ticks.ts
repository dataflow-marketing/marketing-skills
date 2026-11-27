// The ticks: each said line ticks every plan step it is for, in the week it was published, as a member
// ticks a step: "<Monday> <step>: done" (spec/market.md, Done). Written again by code every time.

import { postIsFor, type Step } from "./plan-steps.ts";
import type { SaidSeen } from "./done-lines.ts";

export function ticksFor(said: SaidSeen, steps: readonly Step[]): string[] {
  return steps.filter((step) => postIsFor(step, said.title)).map((step) => `${said.monday} ${step.name}: done`);
}
