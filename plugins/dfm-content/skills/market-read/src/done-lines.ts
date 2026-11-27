// Reads what a market ledger's done part already holds: its reads, its said lines and the changes a model wrote.
// Ticks are not read here: code writes them again from the plan and the said lines every time.

export type Read = { monday: string; day: string };
export type SaidSeen = { monday: string; day: string; title: string; url: string };
export type Change = { monday: string; text: string };

export type DoneSeen = {
  reads: Read[];
  said: SaidSeen[];
  changes: Change[];
  totals: { monday: string; fact: string; n: number }[];
};

const READ = /^(\d{4}-\d{2}-\d{2}) read on (\d{4}-\d{2}-\d{2})$/;
const SAID = /^(\d{4}-\d{2}-\d{2}) said on site on (\d{4}-\d{2}-\d{2}): "(.*)" (\S+) \[/;
const CHANGE = /^(\d{4}-\d{2}-\d{2}) ((?:new|was|gone) .+)$/;
const TOTAL = /^(\d{4}-\d{2}-\d{2}) fact total (.+): (\d+)$/;

export function readDone(lines: readonly string[]): DoneSeen {
  const seen: DoneSeen = { reads: [], said: [], changes: [], totals: [] };
  for (const line of lines) {
    const read = READ.exec(line);
    const said = SAID.exec(line);
    const change = CHANGE.exec(line);
    const total = TOTAL.exec(line);
    if (read) {
      seen.reads.push({ monday: read[1], day: read[2] });
    } else if (said) {
      seen.said.push({ monday: said[1], day: said[2], title: said[3], url: said[4] });
    } else if (change) {
      seen.changes.push({ monday: change[1], text: change[2] });
    } else if (total) {
      seen.totals.push({ monday: total[1], fact: total[2], n: Number(total[3]) });
    }
  }
  return seen;
}

// a tick is written by code: "<Monday> <step>: done"
export function isTick(line: string): boolean {
  return /^\d{4}-\d{2}-\d{2} .+: done$/.test(line);
}
