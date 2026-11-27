// Inside and outside (spec/market.md): a business's ledger beside its own market ledger. Lists what one says
// and the other does not, by name, never which is right.

import { splitParts } from "./ledger-parts.ts";
import { namedLines, type Named } from "./graph-lines.ts";
import { listOf } from "./list-of.ts";

export type Gaps = { notOnSite: Named[]; notInLedger: Named[]; planned: string[]; seen: string[] };

const STEP = /^every (week|month|2 weeks|day) (.+?)(?: from \d{4}-\d{2}-\d{2})?(?: \((?:stated|observed|inferred)\))?$/;

export function findGaps(ledgerText: string, marketText: string): Gaps {
  const ledger = splitParts(ledgerText);
  const market = splitParts(marketText);
  const inside = namedLines(ledger.graph);
  const outside = namedLines(market.graph);
  const has = (list: Named[], item: Named) => list.some((each) => each.word === item.word && each.name.toLowerCase() === item.name.toLowerCase());

  return {
    notOnSite: inside.filter((item) => !has(outside, item)),
    notInLedger: outside.filter((item) => item.word === "offer" && !has(inside, item)),
    planned: ledger.plan.filter((line) => STEP.test(line.trim())),
    seen: market.summary.filter((line) => line.startsWith("every ") || line.startsWith("posts: ")),
  };
}

export function gapsText(gaps: Gaps): string {
  const named = (items: Named[]) => (items.length > 0 ? listOf(items.map((item) => `${item.word} ${item.name}`)) : "nothing");
  return [
    `in its ledger, not on its site: ${named(gaps.notOnSite)}`,
    `on its site, not in its ledger: ${named(gaps.notInLedger)}`,
    "its ledger plans:",
    ...(gaps.planned.length > 0 ? gaps.planned.map((line) => `  ${line}`) : ["  nothing repeats"]),
    "its site shows:",
    ...(gaps.seen.length > 0 ? gaps.seen.map((line) => `  ${line}`) : ["  no plan worked out"]),
    "",
  ].join("\n");
}
