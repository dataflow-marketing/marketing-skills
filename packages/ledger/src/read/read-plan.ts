// Reads the plan part: what will be done (spec/ledger.md, Plan).
// Each line is read on its own with the grammar. A line it cannot read is given back as unread.

import { mondayOf } from "../dates.ts";
import type { NumberedLine, Plan, Want } from "./ledger-shape.ts";
import type { PlanLineShape } from "./line-shapes.ts";
import { parsePlanLine } from "./parse-line.ts";
import { readOn, readOtherRepeat } from "./read-plan-extra.ts";
import { splitSource } from "./source-word.ts";

export type PlanReading = { plan: Plan; unread: NumberedLine[] };

type WantShape = Extract<PlanLineShape, { kind: "want" }>;
type WordsShape = Extract<PlanLineShape, { kind: "how" | "script" }>;

export function readPlan(lines: NumberedLine[]): PlanReading {
  const plan = emptyPlan();
  const unread: NumberedLine[] = [];

  for (const numbered of lines) {
    if (!readOneLine(plan, numbered)) {
      unread.push(numbered);
    }
  }

  return { plan, unread };
}

// a plan line may end with its source word ("(inferred)" on a plan worked out from a site): taken off first
function readOneLine(plan: Plan, numbered: NumberedLine): boolean {
  const { text } = splitSource(numbered.text);
  const shape = parsePlanLine(text);
  if (shape !== undefined) {
    addToPlan(plan, shape, numbered.line);
    return true;
  }
  const repeat = readOtherRepeat(text, numbered.line);
  if (repeat !== undefined) {
    plan.otherRepeats = [...(plan.otherRepeats ?? []), repeat];
    return true;
  }
  const on = readOn(text, numbered.line);
  if (on !== undefined) {
    plan.ons = [...(plan.ons ?? []), on];
    return true;
  }
  return false;
}

function emptyPlan(): Plan {
  return { repeats: [], hows: {}, scripts: {}, weekHows: {}, weekScripts: {}, entries: [] };
}

function addToPlan(plan: Plan, shape: PlanLineShape, line: number): void {
  switch (shape.kind) {
    case "extends":
      plan.extends = shape.file;
      return;
    case "start":
      plan.start = shape.date;
      return;
    case "want":
      plan.want = wantOf(shape);
      return;
    case "every":
      plan.repeats.push(repeatOf(shape, line));
      return;
    case "how":
    case "script":
      addWords(plan, shape);
      return;
    case "entry":
      plan.entries.push({ date: shape.date, op: shape.op, methods: shape.methods, line });
      return;
    default:
      // a spec line or a blank line: nothing to keep
      return;
  }
}

// a rate keeps its date only when there is one; a total keeps both, set or not
function wantOf(shape: WantShape): Want {
  if (shape.per) {
    const want: Want = { fact: shape.fact, per: shape.per };
    if (shape.by) {
      want.by = shape.by;
    }
    if (shape.grows) {
      want.grows = true;
    }
    return want;
  }
  return { fact: shape.fact, n: shape.n, by: shape.by };
}

function repeatOf(shape: Extract<PlanLineShape, { kind: "every" }>, line: number): Plan["repeats"][number] {
  const repeat: Plan["repeats"][number] = { every: shape.every, methods: shape.methods, line };
  if (shape.from) {
    repeat.from = shape.from;
  }
  return repeat;
}

// a how replaces an earlier one for the same step; a script adds a paragraph.
// A dated one belongs to that week only, keyed by its Monday.
function addWords(plan: Plan, shape: WordsShape): void {
  if (shape.week) {
    addWeekWords(plan, shape, mondayOf(shape.week));
    return;
  }
  if (shape.kind === "how") {
    plan.hows[shape.thing] = shape.words;
    return;
  }
  plan.scripts[shape.thing] = [...(plan.scripts[shape.thing] ?? []), shape.words];
}

function addWeekWords(plan: Plan, shape: WordsShape, week: string): void {
  if (shape.kind === "how") {
    plan.weekHows[week] = { ...(plan.weekHows[week] ?? {}), [shape.thing]: shape.words };
    return;
  }
  const thatWeek = plan.weekScripts[week] ?? {};
  thatWeek[shape.thing] = [...(thatWeek[shape.thing] ?? []), shape.words];
  plan.weekScripts[week] = thatWeek;
}
