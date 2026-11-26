// Reads the done part: what happened (spec/ledger.md, Done).
//
//   started 2026-11-16                                    the week they began
//   2026-11-16 open the cafe: done at <time> <zone>       a step ticked (or "not done") and when
//   2026-11-16 fact count visits: 1,240                   how many in that week
//   2026-11-23 fact total loyalty list: 312               how many on that day
//   2026-11-16 counted to 2026-11-18                      the week's counts are so far, to that day
//   2026-11-30 said on Instagram on 2026-12-01: "..." <link> [<who>] summary: "..."
//
// A count for one group is read as a count whose name ends with the group: `emails sent [Keen]`.
// Any other line is kept exactly as written in others and given back as unread: it is never lost.

import type { Answer, Done, DoneWeek, NumberedLine } from "./ledger-shape.ts";

export type DoneReading = { done: Done; unread: NumberedLine[] };

const DATE = "(\\d{4}-\\d{2}-\\d{2})";
const NUMBER = "(\\d+(?:,\\d{3})*(?:\\.\\d+)?)";

const STARTED = new RegExp(`^started ${DATE}$`);
const SAID = new RegExp(`^${DATE} said (.+?) on ${DATE}: "(.*)" (\\S+) \\[(.*)\\] summary: "(.*)"$`);
const COUNTED_TO = new RegExp(`^${DATE} counted to ${DATE}$`);
const ANSWER = new RegExp(`^${DATE} (.+): (done|not done)(?: at (\\S+ \\S+))?$`);
const FACT_TOTAL = new RegExp(`^${DATE} fact total (.+): ${NUMBER}$`);
const FACT_COUNT = new RegExp(`^${DATE} fact count (.+): ${NUMBER}$`);

export function readDone(lines: NumberedLine[]): DoneReading {
  const done: Done = { weeks: {}, facts: [], others: [] };
  const unread: NumberedLine[] = [];

  for (const numbered of lines) {
    const text = numbered.text.trim();
    if (text === "") {
      continue;
    }
    const understood = addToDone(done, text, numbered.line);
    if (!understood) {
      done.others.push(text);
      unread.push(numbered);
    }
  }

  return { done, unread };
}

// adds one line to the done part; false when the line is not one this reader reads
function addToDone(done: Done, text: string, line: number): boolean {
  const started = STARTED.exec(text);
  if (started) {
    done.started = started[1];
    return true;
  }

  const said = SAID.exec(text);
  if (said) {
    addSaid(weekIn(done, said[1]), said);
    return true;
  }

  const countedTo = COUNTED_TO.exec(text);
  if (countedTo) {
    weekIn(done, countedTo[1]).countedTo = countedTo[2];
    return true;
  }

  const answer = ANSWER.exec(text);
  if (answer) {
    addAnswer(weekIn(done, answer[1]), answer);
    return true;
  }

  const total = FACT_TOTAL.exec(text);
  if (total) {
    addFact(done, "total", total, line);
    return true;
  }

  const count = FACT_COUNT.exec(text);
  if (count) {
    addFact(done, "count", count, line);
    return true;
  }

  return false;
}

function addAnswer(week: DoneWeek, match: RegExpExecArray): void {
  const step = match[2];
  week.answers[step] = match[3] as Answer;
  if (match[4]) {
    week.when = { ...(week.when ?? {}), [step]: match[4] };
  }
}

function addFact(done: Done, kind: "count" | "total", match: RegExpExecArray, line: number): void {
  const date = match[1];
  const fact = match[2];
  const n = Number(match[3].replace(/,/g, ""));
  const week = weekIn(done, date);

  if (kind === "total") {
    week.totals[fact] = n;
  } else {
    week.counts = { ...(week.counts ?? {}), [fact]: n };
  }
  done.facts.push({ kind, date, fact, n, line });
}

// one said line per link and way it went out: a later line for the same replaces the earlier
function addSaid(week: DoneWeek, match: RegExpExecArray): void {
  const said = {
    how: match[2],
    on: match[3],
    title: match[4],
    url: match[5],
    for: match[6].split(", ").filter(Boolean),
    summary: match[7],
  };
  const others = (week.said ?? []).filter((earlier) => !(earlier.url === said.url && earlier.how === said.how));
  week.said = [...others, said];
}

function weekIn(done: Done, date: string): DoneWeek {
  if (!done.weeks[date]) {
    done.weeks[date] = { answers: {}, totals: {} };
  }
  return done.weeks[date];
}
