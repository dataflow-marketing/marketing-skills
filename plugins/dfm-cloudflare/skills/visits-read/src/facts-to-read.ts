// The facts whose source is Cloudflare, from the ledger's graph:
//   fact site visits: cloudflare coffee-shop.example visits
//   fact pages viewed: cloudflare coffee-shop.example views (observed)
//   fact found the site: cloudflare coffee-shop.example outside
// A measure is visits, views or outside (page views that came from another site). Every other fact is left for
// the person to tell.

export type Measure = "visits" | "views" | "outside";

export type FactToRead = { fact: string; host: string; measure: Measure };

export type FactsResult = { facts: FactToRead[]; problems: string[] };

const MEASURES: readonly string[] = ["visits", "views", "outside"];

// "cloudflare <host> <measure>", then anything after it, such as "(observed)"
const CLOUDFLARE_SOURCE = /^cloudflare (\S+) (\S+)/;

export function factsToRead(facts: readonly { fact: string; source: string }[]): FactsResult {
  const result: FactsResult = { facts: [], problems: [] };

  for (const each of facts) {
    const match = CLOUDFLARE_SOURCE.exec(each.source);
    if (!match) {
      continue;
    }
    const measure = match[2];
    if (!MEASURES.includes(measure)) {
      result.problems.push(`fact ${each.fact}: Cloudflare counts visits, views or outside, not ${measure}`);
      continue;
    }
    result.facts.push({ fact: each.fact, host: bareHost(match[1]), measure: measure as Measure });
  }

  return result;
}

// a host is counted with and without www
export function bareHost(host: string): string {
  return host.toLowerCase().replace(/^www\./, "");
}
