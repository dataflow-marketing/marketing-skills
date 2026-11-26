// More clicks than opens in a week: a mail server's link scanner followed the links before a person saw the email.
// Those clicks are likely not people (inferred).

import type { Done } from "@dataflow-marketing/ledger/read";

export function scannerLines(done: Done): string[] {
  const lines: string[] = [];
  for (const week of Object.keys(done.weeks).sort()) {
    const counts = done.weeks[week].counts ?? {};
    for (const clicks of Object.keys(counts).filter((fact) => fact.includes("clicks"))) {
      const opens = clicks.replace("clicks", "opens");
      if (counts[opens] !== undefined && counts[clicks] > counts[opens]) {
        lines.push(`${clicks} ${counts[clicks]} is more than ${opens} ${counts[opens]} in the week of ${week}: likely link scanners, not people (inferred, happened)`);
      }
    }
  }
  return lines;
}
