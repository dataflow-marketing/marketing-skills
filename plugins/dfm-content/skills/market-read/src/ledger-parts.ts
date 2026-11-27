// Splits a market ledger into its four parts and joins it back (spec/market.md, The shape).
// Each part is its lines, blank lines kept: what a person wrote is written back as it was.

export type LedgerParts = {
  graph: string[];
  plan: string[];
  done: string[];
  summary: string[];
};

const PART = /^=== (graph|plan|done|summary) ===$/;

export function splitParts(text: string): LedgerParts {
  const parts: LedgerParts = { graph: [], plan: [], done: [], summary: [] };
  let current: keyof LedgerParts | undefined;

  for (const line of text.split(/\r?\n/)) {
    const heading = PART.exec(line.trim());
    if (heading) {
      current = heading[1] as keyof LedgerParts;
      continue;
    }
    if (current) {
      parts[current].push(line);
    }
  }

  return { graph: trimmed(parts.graph), plan: trimmed(parts.plan), done: trimmed(parts.done), summary: trimmed(parts.summary) };
}

export function joinParts(parts: LedgerParts): string {
  const sections = ["spec 1"];
  for (const name of ["graph", "plan", "done", "summary"] as const) {
    sections.push(`=== ${name} ===`, ...parts[name], "");
  }
  return `${sections.join("\n").trimEnd()}\n`;
}

// blank lines at the start and end of a part are not the person's: they only separate the parts
function trimmed(lines: string[]): string[] {
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start].trim() === "") {
    start += 1;
  }
  while (end > start && lines[end - 1].trim() === "") {
    end -= 1;
  }
  return lines.slice(start, end);
}
