// Makes one run log line: every write appends one.
// The line says when, which skill, what was written, where it was written, before and after.
// Pure: takes the values, gives back the line. Appending it is the edge's job.
//
// Example:
// 2026-11-25T09:30:00.000Z | dfm-ghost:post-draft | post draft | ghost coffee-shop | before: (none) | after: draft "Our new oat flat white"

export type RunLogEntry = {
  when: Date;
  skill: string;
  what: string;
  where: string;
  before: string;
  after: string;
};

const SEPARATOR = " | ";
const NOTHING = "(none)";

export function formatRunLine(entry: RunLogEntry): string {
  const parts = [
    entry.when.toISOString(),
    oneLine(entry.skill),
    oneLine(entry.what),
    oneLine(entry.where),
    `before: ${oneLine(entry.before)}`,
    `after: ${oneLine(entry.after)}`,
  ];
  return parts.join(SEPARATOR);
}

// A run log line must stay one line: new lines become spaces.
function oneLine(value: string): string {
  const flat = value.replace(/\s+/g, " ").trim();
  if (flat === "") {
    return NOTHING;
  }
  return flat;
}
