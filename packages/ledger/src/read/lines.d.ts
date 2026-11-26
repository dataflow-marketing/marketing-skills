// The parser built from grammar/lines.peggy (src/read/lines.js).
// It gives back one line's shape (line-shapes.ts) or throws when the line cannot be read.

export type StartRule = "GraphLine" | "PlanLine";

export function parse(input: string, options?: { startRule?: StartRule }): unknown;
