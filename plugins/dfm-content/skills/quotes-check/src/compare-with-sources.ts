// Looks up every mention in the sources and gives back the lines of the report.
// A mention said more than once is reported once.
// The lines come in the order of the report: quotes, names, numbers (money among them), claims.

import { findInSource } from "./find-in-source.ts";
import type { SourceIndex } from "./index-sources.ts";
import type { CheckLine, Mention, MentionKind } from "./types.ts";

const REPORT_ORDER: Record<MentionKind, number> = {
  quote: 0,
  name: 1,
  number: 2,
  money: 2,
  claim: 3,
};

export function compareWithSources(mentions: readonly Mention[], index: SourceIndex): CheckLine[] {
  const lines: CheckLine[] = [];
  const seen = new Set<string>();

  for (const mention of onePerKey(mentions, seen)) {
    const where = findInSource(mention, index);
    if (where) {
      lines.push({ kind: mention.kind, written: mention.written, found: true, where });
    } else {
      lines.push({ kind: mention.kind, written: mention.written, found: false });
    }
  }

  return lines.sort((first, second) => REPORT_ORDER[first.kind] - REPORT_ORDER[second.kind]);
}

function onePerKey(mentions: readonly Mention[], seen: Set<string>): Mention[] {
  const kept: Mention[] = [];
  for (const mention of mentions) {
    const id = `${mention.kind} ${mention.key}`;
    if (!seen.has(id)) {
      seen.add(id);
      kept.push(mention);
    }
  }
  return kept;
}
