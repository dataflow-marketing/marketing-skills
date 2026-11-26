// The settings line for each Ghost site the facts name:
//   site coffee-shop: ghost https://coffee-shop.example key in COFFEE_SHOP_GHOST_ADMIN_KEY
// A site with no Ghost line is a problem that says the line to add (dfm-ghost:site-add adds it).

import type { Site } from "@dataflow-marketing/core";
import type { FactToRead } from "./facts-to-read.ts";

export type GhostSite = { name: string; address: string; keyName: string };

export type SitesResult = { sites: GhostSite[]; problems: string[] };

export function findSites(facts: readonly FactToRead[], sites: readonly Site[]): SitesResult {
  const result: SitesResult = { sites: [], problems: [] };
  const names = [...new Set(facts.map((each) => each.site))];

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
