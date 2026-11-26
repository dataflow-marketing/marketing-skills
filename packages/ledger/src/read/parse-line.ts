// Reads one graph or plan line with the parser built from the grammar.
// Gives back the line's shape (undefined when the line cannot be read).

import { parse } from "./lines.js";
import type { GraphLineShape, PlanLineShape } from "./line-shapes.ts";

export function parseGraphLine(text: string): GraphLineShape | undefined {
  try {
    return parse(text, { startRule: "GraphLine" }) as GraphLineShape;
  } catch {
    return undefined;
  }
}

export function parsePlanLine(text: string): PlanLineShape | undefined {
  try {
    return parse(text, { startRule: "PlanLine" }) as PlanLineShape;
  } catch {
    return undefined;
  }
}
