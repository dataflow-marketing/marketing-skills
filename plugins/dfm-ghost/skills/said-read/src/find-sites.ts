// The Ghost sites a ledger's graph names in its facts' sources (`fact new subscribers: ghost coffee-shop new
// members`), each with its settings line. A site with no Ghost line is a problem that says how to add it.

import type { Site } from "@dataflow-marketing/core";

export type GhostSite = { name: string; address: string; keyName: string };

export type SitesResult = { sites: GhostSite[]; problems: string[] };

export function findSites(facts: readonly { source: string }[], sites: readonly Site[]): SitesResult {
  const result: SitesResult = { sites: [], problems: [] };
  const names = [...new Set(facts.flatMap((fact) => /^ghost (\S+)/.exec(fact.source)?.[1] ?? []))];

  for (const name of names) {
    const site = sites.find((each) => each.platform === "ghost" && each.business === name);
    if (!site || !site.keyName) {
      result.problems.push(`No Ghost line for ${name} in settings: run dfm-ghost:site-add for it`);
      continue;
    }
    result.sites.push({ name, address: site.address.replace(/\/+$/, ""), keyName: site.keyName });
  }

  return result;
}
