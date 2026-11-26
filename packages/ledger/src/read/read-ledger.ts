// Reads a spec 1 ledger into data (spec/ledger.md).
//
//   0. tidy look-alike punctuation pasted in (curly quotes, odd spaces) into the plain kind
//   1. split it into its parts: graph, plan, done and summary
//   2. read each part line by line
//   3. set aside each line that holds a spec 1 word this reader does not read yet
//   4. give back every other line it could not read, to be named as a problem
//
// It reads the spec 1 words and the words dfm used before them (told and paste, removes and remove:,
// cycle weekly and cycle: weekly, a spec line). Pure: takes text, gives back data. It never throws on a bad line.

import type { Ledger, LineProblem, NumberedLine, PartName } from "./ledger-shape.ts";
import { notReadYetWord } from "./not-read-yet.ts";
import { readDone } from "./read-done.ts";
import { readGraph } from "./read-graph.ts";
import { readPlan } from "./read-plan.ts";
import { splitParts } from "./split-parts.ts";
import { tidyPasted } from "./tidy-pasted.ts";

export function readLedger(text: string): Ledger {
  const split = splitParts(tidyPasted(text));
  const ledger: Ledger = { unreadable: [...split.outside], notReadYet: [] };
  if (split.spec !== undefined) {
    ledger.spec = split.spec;
  }

  const { graph, plan, done, summary } = split.parts;
  if (graph) {
    const reading = readGraph(graph);
    ledger.graph = reading.graph;
    setAside(ledger, "graph", reading.unread);
  }
  if (plan) {
    const reading = readPlan(plan);
    ledger.plan = reading.plan;
    setAside(ledger, "plan", reading.unread);
  }
  if (done) {
    const reading = readDone(done);
    ledger.done = reading.done;
    setAside(ledger, "done", reading.unread);
  }
  if (summary) {
    ledger.summary = summaryLines(summary);
  }

  return ledger;
}

// each line not read is either a spec 1 word not read yet or unreadable
function setAside(ledger: Ledger, part: PartName, unread: NumberedLine[]): void {
  for (const numbered of unread) {
    const problem: LineProblem = { part, line: numbered.line, text: numbered.text.trim() };
    const word = notReadYetWord(part, numbered.text);
    if (word) {
      ledger.notReadYet.push({ ...problem, word });
    } else {
      ledger.unreadable.push(problem);
    }
  }
}

// the summary is written by a skill from the parts above: kept as written, blank lines left out
function summaryLines(lines: NumberedLine[]): string[] {
  const kept: string[] = [];
  for (const numbered of lines) {
    if (numbered.text.trim() !== "") {
      kept.push(numbered.text);
    }
  }
  return kept;
}
