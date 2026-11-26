// The fact a count or total is of: a count for one group names its group last, `emails sent [Keen]`.

const GROUP_AT_THE_END = /\s*\[.+\]$/;

export function factName(written: string): string {
  return written.replace(GROUP_AT_THE_END, "");
}
