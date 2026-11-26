// What objects-read prints: each object of the kind with where it is and its version; why one cannot be read;
// data for --json. It never prints an object's text.

import type { ScriptResult } from "@dataflow-marketing/core";

export type Listed =
  | { business: string; ok: true; where: string; version: string; lines: number }
  | { business: string; ok: false; problem: string };

export function describeList(kind: string, listed: readonly Listed[]): ScriptResult {
  if (listed.length === 0) {
    const text = `No ${kind} is bound in settings. With no binding a ${kind} is ${kind}.txt in the working folder.`;
    return { text, data: { kind, objects: [] } };
  }
  const lines = [`${kind}: ${listed.length} in settings`];
  for (const each of listed) {
    lines.push("", ...linesFor(kind, each));
  }
  return { text: lines.join("\n"), data: { kind, objects: listed } };
}

function linesFor(kind: string, each: Listed): string[] {
  if (!each.ok) {
    return [`${kind} of ${each.business}: cannot be read`, `  problem: ${each.problem}`];
  }
  const size = each.lines === 0 ? "empty" : `${each.lines} lines`;
  return [`${kind} of ${each.business} (${size})`, `  where: ${each.where}`, `  version: ${each.version}`];
}
