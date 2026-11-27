// Reads the done lines with the ledger reader (read/) and gives back the done lines as text-keeping data. writeDone then gives every line back as it was written: a push or a save changes no
// line it did not mean to change.
//
//   1. trim each line, as both readers do
//   2. set aside look-alike punctuation (curly quotes, odd spaces): the public reader makes it the plain kind; the
//      next write would then change the member's text. Each is swapped for a stand-in character the text does
//      not have
//   3. put the text under `=== done ===` and read it with the public reader
//   4. put the look-alikes back, in every name, title and line read
//   5. leave out the public reader's list of fact lines (the same numbers are kept by week); a number not written
//      the plain way (`1,240`) is kept as written beside it
//
// Free of Node: it runs in a page in the browser and in a Worker too.
import { readLedger, tidyPasted } from "../read/index.ts";
import type { Done as LedgerDone, FactLine } from "../read/index.ts";
import type { Done } from "./done-text.ts";

// the heading put above the text takes one line: a line's number in the ledger is one more than in the text
const HEADING_LINES = 1;

// stand-ins come from the private use characters, which no member writes
const FIRST_STAND_IN = 0xe000;

// the number at the end of a fact line, as written: "2026-11-16 fact count visits: 1,240"
const NUMBER_AT_THE_END = /: (\S+)$/;

export function readDoneLines(text: string): Done {
  const lines = text.split("\n").map((line) => line.trim());
  const standIns = standInsFor(lines.join("\n"));

  const ledger = readLedger(`=== done ===\n${standIns.hide(lines.join("\n"))}`).done;
  if (!ledger) {
    return { weeks: {}, others: [] };
  }

  const done = standIns.putBack(withoutFactLines(ledger));
  keepNumbersAsWritten(done, ledger.facts, lines);
  return done;
}

// ---- look-alike punctuation ----

type StandIns = { hide: (text: string) => string; putBack: (done: Done) => Done };

// a look-alike is any character the public reader would tidy into another
function standInsFor(text: string): StandIns {
  const lookAlikes = [...new Set(text)].filter((c) => tidyPasted(c) !== c);
  const standIns = freeCharacters(text, lookAlikes.length);
  const hidden = new Map(lookAlikes.map((c, i) => [c, standIns[i]]));
  const shown = new Map(lookAlikes.map((c, i) => [standIns[i], c]));
  return {
    hide: (t) => swapCharacters(t, hidden),
    // every string in the reading, names and keys included
    putBack: (done) => JSON.parse(swapCharacters(JSON.stringify(done), shown)),
  };
}

function freeCharacters(text: string, count: number): string[] {
  const used = new Set(text);
  const free: string[] = [];
  for (let code = FIRST_STAND_IN; free.length < count; code += 1) {
    const c = String.fromCharCode(code);
    if (!used.has(c)) {
      free.push(c);
    }
  }
  return free;
}

function swapCharacters(text: string, swaps: Map<string, string>): string {
  if (swaps.size === 0) {
    return text;
  }
  return [...text].map((c) => swaps.get(c) ?? c).join("");
}

// ---- into the shape written back ----

function withoutFactLines(ledger: LedgerDone): Done {
  const { facts: _facts, ...done } = ledger;
  return outsideLinesKept(done);
}

// A read of a site from outside and what it found changed ("2026-12-07 read on 2026-12-09", "2026-12-07 was offer
// ...", spec/ledger.md, Done) are read by the ledger reader since 27 Nov 2026; nothing here does anything with them yet:
// each goes back to the other lines, as written: every write and merge then keeps it exactly.
function outsideLinesKept(done: Omit<LedgerDone, "facts">): Done {
  const kept: string[] = [];
  const weeks: Done["weeks"] = {};
  for (const [week, read] of Object.entries(done.weeks)) {
    const { readOn, changes, ...rest } = read;
    if (readOn) kept.push(`${week} read on ${readOn}`);
    for (const change of changes ?? []) kept.push(`${week} ${change}`);
    weeks[week] = rest;
  }
  return { ...done, weeks, others: [...done.others, ...kept] };
}

// each fact line's number as written, where it is not the plain way of writing that number; a later line for the
// same fact in the same week replaces an earlier one, as its number does
function keepNumbersAsWritten(done: Done, facts: FactLine[], lines: string[]) {
  for (const fact of facts) {
    const written = NUMBER_AT_THE_END.exec(lines[fact.line - HEADING_LINES - 1])?.[1];
    const week = done.weeks[fact.date];
    const kind = fact.kind === "total" ? "totalsAsWritten" : "countsAsWritten";
    const kept = { ...(week[kind] ?? {}) };
    if (written !== undefined && written !== String(fact.n)) {
      kept[fact.fact] = written;
    } else {
      delete kept[fact.fact];
    }
    if (Object.keys(kept).length > 0) {
      week[kind] = kept;
    } else {
      delete week[kind];
    }
  }
}
