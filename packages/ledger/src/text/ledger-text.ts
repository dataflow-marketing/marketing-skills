// A ledger as one text in its parts, as a page that shows and saves a member's ledger reads and writes it: one text in
// three parts. A member on the starter loop has only the done part; once personalised, their own graph and plan too.
//
//   === graph ===
//   ...a .graph file...
//   === plan ===
//   ...a .plan file...
//   === done ===
//   ...the done lines (text/done-text.ts)...
//   === summary ===
//   ...written from the lines above, never by hand (summary/write-summary.ts)...
//
// Used by a page that ticks steps and by the tools that change a ledger: both read and write it the same way.
// Free of Node.

export type FieldParts = { graph?: string; plan?: string; done?: string; summary?: string };

export function splitField(text: string): FieldParts {
  const parts: FieldParts = {};
  let current: keyof FieldParts | "" = "";
  for (const line of text.split("\n")) {
    const heading = /^=== (graph|plan|done|summary) ===$/.exec(line.trim());
    if (heading) {
      current = heading[1] as keyof FieldParts;
      parts[current] = "";
    } else if (current) {
      parts[current] += line + "\n";
    }
  }
  return parts;
}

// a starter loop member (no graph or plan of their own) gets only their done part back
// the summary, when there is one, goes last, as it came
export function joinField(parts: FieldParts): string {
  const done = ["=== done ===", (parts.done ?? "").trimEnd()];
  const summary = parts.summary?.trim() ? ["=== summary ===", parts.summary.trimEnd()] : [];
  if (parts.graph === undefined || parts.plan === undefined) return [...done, ...summary].join("\n").trimEnd();
  return ["=== graph ===", parts.graph.trimEnd(), "=== plan ===", parts.plan.trimEnd(), ...done, ...summary].join("\n").trimEnd();
}
