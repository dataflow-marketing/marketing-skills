// The links whose rate is known (proven or believed): an AI works out a what if only where a rate is known.

import type { Graph, Link, Result } from "@dataflow-marketing/ledger/read";
import { written } from "../numbers.ts";

export function rateLines(graph: Graph | undefined): string[] {
  const known = (graph?.links ?? []).filter((link) => link.result.kind !== "unknown" && (link.label === "proven" || link.label === "believed"));
  return known.map((link) => `links with a known rate: ${fromText(link)} -> ${link.to}: ${resultText(link.result)} (calculated, ${link.label})`);
}

function fromText(link: Link): string {
  return link.from.map((part) => (part.group ? `${part.name} [${part.group}]` : part.name)).join(" + ");
}

// a rate as the ledger writes it: `15 of 2,550 visits`, `1 to 3 of 10 visits`, `11 from 2 posts`
export function resultText(result: Result): string {
  if (result.kind === "people") {
    return "from people";
  }
  if (result.kind === "like") {
    return `like ${result.name}`;
  }
  if (result.kind === "unknown") {
    return "?";
  }
  const amount = result.low === result.high ? written(result.low) : `${written(result.low)} to ${written(result.high)}`;
  return `${amount} ${result.kind} ${written(result.out)} ${result.unit}`.trim();
}
