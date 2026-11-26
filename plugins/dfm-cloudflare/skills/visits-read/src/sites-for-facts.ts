// The settings line for each host the facts name:
//   site coffee-shop: cloudflare coffee-shop.example account <id> key in CLOUDFLARE_API_TOKEN
// A host with no line is a problem that says the line to add. So is a line with no account or no key.

import type { Site } from "@dataflow-marketing/core";
import { bareHost } from "./facts-to-read.ts";
import type { FactToRead } from "./facts-to-read.ts";

export type CloudflareSite = { host: string; account: string; keyName: string };

export type SitesResult = { sites: CloudflareSite[]; problems: string[] };

export function sitesForFacts(facts: readonly FactToRead[], sites: readonly Site[]): SitesResult {
  const result: SitesResult = { sites: [], problems: [] };
  const hosts = [...new Set(facts.map((each) => each.host))];

  for (const host of hosts) {
    const site = sites.find((each) => each.platform === "cloudflare" && bareHost(each.address) === host);
    if (!site || !site.account || !site.keyName) {
      result.problems.push(`No Cloudflare line for ${host} in settings: add "site <name>: cloudflare ${host} account <account id> key in <NAME>"`);
      continue;
    }
    result.sites.push({ host, account: site.account, keyName: site.keyName });
  }

  return result;
}
