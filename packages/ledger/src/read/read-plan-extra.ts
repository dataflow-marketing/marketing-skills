// Plan lines the grammar does not read (spec/ledger.md, Timing): a repeat every month or every 2 weeks; an
// on line. They are kept apart from the weekly repeats: nothing that carries a week forward plays them yet.
//   every month guest coffee from 2026-10-01
//   on 2026-12-24 to 2027-01-01: "<their words>" [<page>]

export type OtherRepeat = { every: "month" | "2 weeks"; name: string; from?: string; line: number };
export type On = { from: string; to: string; words: string; line: number };

const EVERY = /^every (month|2 weeks) (.+?)(?: from (\d{4}-\d{2}-\d{2}))?$/;
const ON = /^on (\d{4}-\d{2}-\d{2})(?: to (\d{4}-\d{2}-\d{2}))?:\s*(.+)$/;

export function readOtherRepeat(text: string, line: number): OtherRepeat | undefined {
  const found = EVERY.exec(text.trim());
  if (!found) {
    return undefined;
  }
  const repeat: OtherRepeat = { every: found[1] as OtherRepeat["every"], name: found[2].trim(), line };
  if (found[3]) {
    repeat.from = found[3];
  }
  return repeat;
}

export function readOn(text: string, line: number): On | undefined {
  const found = ON.exec(text.trim());
  return found ? { from: found[1], to: found[2] ?? found[1], words: found[3].trim(), line } : undefined;
}
