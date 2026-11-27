// The done lines: what was done each week and the totals people reported (spec/ledger.md, Done).
// One reader and one writer for every place that keeps them, as text: the done part of a ledger. Free of Node: it
// runs in a Worker and in the browser.
//
//   2026-11-16 post on social: done          a thing the plan has that week, done (or "not done")
//     ... done at 2026-11-18T05:12+11:00 Australia/Sydney   and when it was ticked, in the member's own time zone
//   2026-11-23 fact total followers: 312     how many on that day: a total someone reported, read off the platform
//   2026-11-09 fact count group-views: 705   how many in that week (what happened that week, read from a platform)
//   2026-11-16 counted to 2026-11-18          that week's counts are so far, to that day (the week is not over)
//   started 2026-11-23                        the week they started (a starter loop runs from here)
//   2026-11-23 said by email on 2026-11-24: "Iced coffee is back" https://... [Regulars] summary: "..."
//                                             something they sent or published: how, when, its title, link, who it was
//                                             for and a summary in their own words (25 Nov 2026);
//                                             a topic may sit before the summary: [Regulars] topic: summer menu summary: "..."
//
// Each line is keyed by the first day of its week. Any other line is kept exactly as it is and written back
// untouched: a reader that does not know a line never loses it.
//
// The lines are read by the ledger reader (text/done-from-reader.ts); writeDone gives
// back what it read as it was written: a said line's topic, a number written with commas (1,240) and look-alike
// punctuation all stay.
//
// The words are in spec/ledger.md.

import { readDoneLines } from "./done-from-reader.ts";

export type Answer = "done" | "not done";

export type DoneWeek = {
  answers: Record<string, Answer>;
  // when each answer was ticked: "2026-11-18T05:12+11:00 Australia/Sydney"
  when?: Record<string, string>;
  totals: Record<string, number>;
  // counts for that week: "2026-11-09 group-views: 705" (read from a platform, 18 Nov 2026)
  counts?: Record<string, number>;
  // the week's counts are so far, to this day ("2026-11-16 counted to 2026-11-18"); none once the week is whole
  countedTo?: string;
  // what they sent or published that week (25 Nov 2026)
  said?: Said[];
  // a total or count whose number was not written the plain way ("1,240" for 1240), as written: a write then gives it
  // back the same (26 Nov 2026)
  totalsAsWritten?: Record<string, string>;
  countsAsWritten?: Record<string, string>;
};

// one post or email, one way it went out: "by email", "on the website" or "by email and on the website"; the topic
// (what it is about) only when the line has one
export type Said = { how: string; on: string; title: string; url: string; for: string[]; topic?: string; summary: string };

export type Done = {
  started?: string;
  weeks: Record<string, DoneWeek>;
  others: string[];
};

export function readDone(text: string): Done {
  return readDoneLines(text);
}

export function writeDone(done: Done): string {
  const lines: string[] = done.started ? [`started ${done.started}`] : [];
  for (const week of Object.keys(done.weeks).sort()) {
    const { answers, when, totals, counts } = done.weeks[week];
    for (const [what, answer] of Object.entries(answers)) lines.push(`${week} ${what}: ${answer}${when?.[what] ? ` at ${when[what]}` : ""}`);
    const { totalsAsWritten, countsAsWritten } = done.weeks[week];
    for (const [what, n] of Object.entries(totals)) lines.push(`${week} fact total ${what}: ${asWritten(n, totalsAsWritten?.[what])}`);
    for (const [what, n] of Object.entries(counts ?? {})) lines.push(`${week} fact count ${what}: ${asWritten(n, countsAsWritten?.[what])}`);
    if (done.weeks[week].countedTo) lines.push(`${week} counted to ${done.weeks[week].countedTo}`);
    for (const s of done.weeks[week].said ?? []) lines.push(saidLine(week, s));
  }
  return [...lines, ...done.others].join("\n");
}

// a number as it was written, while it still says the same number; otherwise the plain way
function asWritten(n: number, written: string | undefined): string {
  if (written !== undefined && Number(written.replace(/,/g, "")) === n) {
    return written;
  }
  return String(n);
}

// Two copies of the same done lines, ours (a page that ticked things) and theirs (what is saved now, which may have a
// total someone else added since ours was read): ours wins for the answers, theirs for the totals and counts; every other
// line from either is kept.
export function mergeDone(ours: Done, theirs: Done): Done {
  const merged: Done = {
    ...startedFrom(theirs, ours),
    weeks: {},
    others: [...theirs.others, ...ours.others.filter((line) => !theirs.others.includes(line))],
  };
  for (const week of new Set([...Object.keys(ours.weeks), ...Object.keys(theirs.weeks)])) {
    merged.weeks[week] = {
      answers: { ...(ours.weeks[week]?.answers ?? {}) },
      ...(ours.weeks[week]?.when ? { when: { ...ours.weeks[week].when } } : {}),
      totals: { ...(ours.weeks[week]?.totals ?? {}), ...(theirs.weeks[week]?.totals ?? {}) },
      ...(ours.weeks[week]?.counts || theirs.weeks[week]?.counts
        ? { counts: { ...(ours.weeks[week]?.counts ?? {}), ...(theirs.weeks[week]?.counts ?? {}) } }
        : {}),
      ...writtenOf("totals", ours.weeks[week], theirs.weeks[week]),
      ...writtenOf("counts", ours.weeks[week], theirs.weeks[week]),
      ...((theirs.weeks[week] ?? ours.weeks[week])?.countedTo ? { countedTo: (theirs.weeks[week] ?? ours.weeks[week])!.countedTo } : {}),
      ...saidOf(ours.weeks[week], theirs.weeks[week]),
    };
  }
  return merged;
}

// how the merged numbers were written: each from the copy its number came from (the second, where it has one)
function writtenOf(kind: "totals" | "counts", first: DoneWeek | undefined, second: DoneWeek | undefined): Partial<DoneWeek> {
  const field = kind === "totals" ? "totalsAsWritten" : "countsAsWritten";
  const written: Record<string, string> = {};
  for (const what of Object.keys({ ...(first?.[kind] ?? {}), ...(second?.[kind] ?? {}) })) {
    const from = second?.[kind]?.[what] !== undefined ? second : first;
    const form = from?.[field]?.[what];
    if (form !== undefined) written[what] = form;
  }
  return isEmpty(written) ? {} : { [field]: written };
}

// A push from a computer that keeps a copy: three copies of the same done lines: in Ghost now, here and here as it was
// pulled. Anything changed here since the pull (added, changed or removed) goes up; anything not changed here keeps
// Ghost's. A member's own tick or untick and a total someone else added since the pull are never undone (25 Nov 2026).
// Answers, totals, counts, said lines and other lines are merged one by one: a line deleted here is deleted in
// Ghost too (26 Nov 2026). Started comes from here, else from Ghost.
export function mergeForPush(inGhost: Done, here: Done, asPulled: Done): Done {
  const merged: Done = {
    ...startedFrom(here, inGhost),
    weeks: {},
    others: othersForPush(inGhost.others, here.others, asPulled.others),
  };
  for (const week of weeksIn(inGhost, here, asPulled)) {
    const pushed = weekForPush(inGhost.weeks[week], here.weeks[week], asPulled.weeks[week]);
    if (pushed) merged.weeks[week] = pushed;
  }
  return merged;
}

// one week, three ways: each part merged on its own; a week with nothing left in it goes
function weekForPush(inGhost: DoneWeek | undefined, here: DoneWeek | undefined, asPulled: DoneWeek | undefined): DoneWeek | undefined {
  const { answers, when } = answersForPush(inGhost, here, asPulled);
  const totals = numbersForPush(inGhost?.totals, here?.totals, asPulled?.totals);
  const counts = numbersForPush(inGhost?.counts, here?.counts, asPulled?.counts);
  const totalsAsWritten = writtenForPush(totals, inGhost?.totalsAsWritten, here?.totalsAsWritten, changedHere(here?.totals, asPulled?.totals));
  const countsAsWritten = writtenForPush(counts, inGhost?.countsAsWritten, here?.countsAsWritten, changedHere(here?.counts, asPulled?.counts));
  const countedTo = countedToForPush(inGhost, here, asPulled);
  const said = saidForPush(inGhost, here, asPulled);

  const empty = isEmpty(answers) && isEmpty(totals) && isEmpty(counts) && !said.said;
  if (empty) return undefined;

  return {
    answers,
    totals,
    ...(isEmpty(when) ? {} : { when }),
    ...(isEmpty(counts) ? {} : { counts }),
    ...(isEmpty(totalsAsWritten) ? {} : { totalsAsWritten }),
    ...(isEmpty(countsAsWritten) ? {} : { countsAsWritten }),
    ...(countedTo ? { countedTo } : {}),
    ...said,
  };
}

// one week's answers, three ways, one by one: an answer changed here goes up with when it was ticked, one not changed
// here keeps Ghost's (the member's own tick or untick)
function answersForPush(inGhost: DoneWeek | undefined, here: DoneWeek | undefined, asPulled: DoneWeek | undefined) {
  const answers: Record<string, Answer> = {};
  const when: Record<string, string> = {};
  const things = new Set([...Object.keys(inGhost?.answers ?? {}), ...Object.keys(here?.answers ?? {}), ...Object.keys(asPulled?.answers ?? {})]);
  for (const thing of things) {
    const changedHere = here?.answers[thing] !== asPulled?.answers[thing];
    const from = changedHere ? here : inGhost;
    if (!from?.answers[thing]) continue;
    answers[thing] = from.answers[thing];
    if (from.when?.[thing]) when[thing] = from.when[thing];
  }
  return { answers, when };
}

// started from the first copy that has it
function startedFrom(first: Done, second: Done): { started?: string } {
  const started = first.started ?? second.started;
  return started ? { started } : {};
}

// every week in any of the copies
function weeksIn(...copies: Done[]): Set<string> {
  return new Set(copies.flatMap((done) => Object.keys(done.weeks)));
}

function isEmpty(record: Record<string, unknown>): boolean {
  return Object.keys(record).length === 0;
}

// one week's said lines, three ways, one by one (a said line is known by its link and way): a line changed or added
// here goes up, one deleted here goes and one not changed here keeps Ghost's (26 Nov 2026)
function saidForPush(inGhost: DoneWeek | undefined, here: DoneWeek | undefined, asPulled: DoneWeek | undefined): { said?: Said[] } {
  const keyOf = (s: Said) => `${s.how} ${s.url}`;
  const byKey = (week: DoneWeek | undefined) => new Map((week?.said ?? []).map((s) => [keyOf(s), s]));
  const g = byKey(inGhost), h = byKey(here), b = byKey(asPulled);
  const said: Said[] = [];
  for (const key of new Set([...g.keys(), ...h.keys(), ...b.keys()])) {
    const changedHere = JSON.stringify(h.get(key)) !== JSON.stringify(b.get(key));
    const line = changedHere ? h.get(key) : g.get(key);
    if (line) said.push(line);
  }
  return said.length ? { said } : {};
}

// the lines this reader does not read, three ways: here's lines first, then Ghost's lines not here, less any deleted here
// since the pull (26 Nov 2026)
function othersForPush(inGhost: string[], here: string[], asPulled: string[]): string[] {
  const deletedHere = (line: string) => asPulled.includes(line) && !here.includes(line);
  return [...here, ...inGhost.filter((line) => !here.includes(line) && !deletedHere(line))];
}

type Numbers = Record<string, number> | undefined;

// one week's totals or counts, three ways, one by one: a number changed here goes up, one deleted here goes and one
// not changed here keeps Ghost's (which may be newer or gone)
function numbersForPush(inGhost: Numbers, here: Numbers, asPulled: Numbers): Record<string, number> {
  const merged: Record<string, number> = {};
  const changed = changedHere(here, asPulled);
  for (const what of new Set([...Object.keys(inGhost ?? {}), ...Object.keys(here ?? {}), ...Object.keys(asPulled ?? {})])) {
    const n = changed(what) ? here?.[what] : inGhost?.[what];
    if (n !== undefined) merged[what] = n;
  }
  return merged;
}

// whether a total or count changed here since the pull (its number, not how it was written)
function changedHere(here: Numbers, asPulled: Numbers): (what: string) => boolean {
  return (what) => here?.[what] !== asPulled?.[what];
}

// how each merged number was written: from here when its number came from here, otherwise from Ghost
function writtenForPush(
  merged: Record<string, number>,
  inGhost: Record<string, string> | undefined,
  here: Record<string, string> | undefined,
  changed: (what: string) => boolean,
): Record<string, string> {
  const written: Record<string, string> = {};
  for (const what of Object.keys(merged)) {
    const form = changed(what) ? here?.[what] : inGhost?.[what];
    if (form !== undefined) written[what] = form;
  }
  return written;
}

// a week's counted to travels with its counts: from here when here changed that week's counts or counted to since the
// pull (a whole week here then loses it). Otherwise Ghost's: counts Ghost kept never read as a whole week
function countedToForPush(inGhost: DoneWeek | undefined, here: DoneWeek | undefined, asPulled: DoneWeek | undefined): string | undefined {
  const countsChangedHere = !sameNumbers(here?.counts, asPulled?.counts) || here?.countedTo !== asPulled?.countedTo;
  return countsChangedHere ? here?.countedTo : inGhost?.countedTo;
}

function sameNumbers(a: Numbers, b: Numbers): boolean {
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
  return [...keys].every((k) => a?.[k] === b?.[k]);
}

// the totals of one thing, oldest week first: [["2026-11-16", 300], ["2026-11-23", 312]]
export function totalsOf(done: Done, what: string): [string, number][] {
  return Object.keys(done.weeks)
    .sort()
    .filter((week) => done.weeks[week].totals[what] !== undefined)
    .map((week) => [week, done.weeks[week].totals[what]]);
}

// what each fact stood at last: its latest total, with the week it was given in. Where a business starts from
export function latestTotals(done: Done): { fact: string; n: number; on: string }[] {
  const latest = new Map<string, { fact: string; n: number; on: string }>();
  for (const week of Object.keys(done.weeks).sort()) {
    for (const [fact, n] of Object.entries(done.weeks[week].totals)) latest.set(fact, { fact, n, on: week });
  }
  return [...latest.values()];
}

// ---- said lines ----

// one per link and way it went out: a later line for the same replaces the earlier (a summary changed)
export function addSaid(week: DoneWeek, said: Said) {
  week.said = [...(week.said ?? []).filter((s) => !(s.url === said.url && s.how === said.how)), said];
}

function saidLine(week: string, s: Said): string {
  const clean = (t: string) => t.replace(/"/g, "'").replace(/\s+/g, " ").trim();
  const topic = s.topic === undefined ? "" : ` topic: ${s.topic}`;
  return `${week} said ${s.how} on ${s.on}: "${clean(s.title)}" ${s.url} [${s.for.join(", ")}]${topic} summary: "${clean(s.summary)}"`;
}

// two copies of a week's said lines: the second wins for the same link and way, every other line from either is kept
function saidOf(first: DoneWeek | undefined, second: DoneWeek | undefined): { said?: Said[] } {
  const week: DoneWeek = { answers: {}, totals: {} };
  for (const s of [...(first?.said ?? []), ...(second?.said ?? [])]) addSaid(week, s);
  return week.said?.length ? { said: week.said } : {};
}
export { readDoneLines } from "./done-from-reader.ts";
