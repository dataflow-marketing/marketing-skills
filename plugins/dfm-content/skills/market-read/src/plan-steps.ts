// The plan's steps and closures (spec/market.md, Plan):
//   every week this week's special from 2026-11-02 (inferred)   a step it repeats: week, month or 2 weeks
//   on 2026-12-24 to 2027-01-01: "<their words>" [<page>] a closure; its periods are left out of a count

export type Every = "week" | "month" | "2 weeks";
export type Step = { name: string; every: Every; from: string };
export type Closure = { from: string; to: string };

// a line may end with its source word: "(inferred)" on a plan worked out from a site
const STEP = /^every (week|month|2 weeks) (.+) from (\d{4}-\d{2}-\d{2})(?: \((?:stated|observed|inferred)\))?$/;
const CLOSURE = /^on (\d{4}-\d{2}-\d{2})(?: to (\d{4}-\d{2}-\d{2}))?:/;

export function readPlan(lines: readonly string[]): { steps: Step[]; closures: Closure[] } {
  const steps: Step[] = [];
  const closures: Closure[] = [];
  for (const line of lines) {
    const step = STEP.exec(line.trim());
    const closure = CLOSURE.exec(line.trim());
    if (step) {
      steps.push({ every: step[1] as Every, name: step[2], from: step[3] });
    } else if (closure) {
      closures.push({ from: closure[1], to: closure[2] ?? closure[1] });
    }
  }
  return { steps, closures };
}

// "a post" is any post; any other step is found in the titles of its posts
export function postIsFor(step: Step, title: string): boolean {
  return step.name === "a post" || title.toLowerCase().includes(step.name.toLowerCase());
}
