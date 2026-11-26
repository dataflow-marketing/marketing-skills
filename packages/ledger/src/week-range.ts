// The week to ask a platform about, as two moments in UTC: from the week's Monday at 00:00 in the business's time
// zone, to the next Monday at 00:00 or to now, whichever comes first. A platform keeps its times in UTC; the
// ledger's weeks are in the business's time zone (DECISIONS.md, 27 Nov 2026).

import { addDays, mondayOf } from "./dates.ts";

export type WeekRange = { week: string; from: string; to: string; soFar: boolean };

export type RangeResult = { ok: true; range: WeekRange } | { ok: false; problem: string };

export function weekRange(week: string, timeZone: string, now: Date): RangeResult {
  if (mondayOf(week) !== week) {
    return { ok: false, problem: `A week is named by its Monday: ${week} is not one` };
  }

  const from = midnightIn(week, timeZone);
  const nextMonday = midnightIn(addDays(week, 7), timeZone);
  if (from.getTime() > now.getTime()) {
    return { ok: false, problem: `The week of ${week} has not begun` };
  }

  const soFar = now.getTime() < nextMonday.getTime();
  const to = soFar ? now : nextMonday;
  return { ok: true, range: { week, from: from.toISOString(), to: to.toISOString(), soFar } };
}

// 00:00 on a date in a time zone, as a moment; asked twice so a change of clocks on that day is caught
export function midnightIn(date: string, timeZone: string): Date {
  const asIfUtc = Date.parse(`${date}T00:00:00Z`);
  let moment = asIfUtc;
  for (let round = 0; round < 2; round += 1) {
    moment = asIfUtc - offsetMinutes(new Date(moment), timeZone) * 60_000;
  }
  return new Date(moment);
}

// how far ahead of UTC the time zone is at a moment, in minutes: Melbourne in summer gives 660
function offsetMinutes(moment: Date, timeZone: string): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
    .formatToParts(moment)
    .find((part) => part.type === "timeZoneName")?.value;
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name ?? "");
  if (!match) {
    return 0;
  }
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === "-" ? -minutes : minutes;
}
