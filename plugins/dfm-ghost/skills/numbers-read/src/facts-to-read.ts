// The facts whose source is a Ghost site, from the ledger's graph:
//   fact new subscribers: ghost coffee-shop new members
//   fact opens: ghost coffee-shop email opens (observed)
// The site is a settings site name. numbers-read reads the measures below; a fact with another Ghost measure is
// named as not read, for the person to tell. Every other fact is left alone.

export const MEASURES = ["new members", "paid plans", "emails", "emails sent", "email opens", "email clicks"] as const;

// the measures that are about the week's emails: each is also counted for every group a post's tag names
export const EMAIL_MEASURES: readonly Measure[] = ["emails", "emails sent", "email opens", "email clicks"];

export type Measure = (typeof MEASURES)[number];

export type FactToRead = { fact: string; site: string; measure: Measure };

export type FactsResult = { facts: FactToRead[]; notRead: string[] };

// "ghost <site> <measure>", the measure being every word up to an optional "(...)" at the end
const GHOST_SOURCE = /^ghost (\S+) ([^(]+?)\s*(\(.*\))?$/;

export function factsToRead(facts: readonly { fact: string; source: string }[]): FactsResult {
  const result: FactsResult = { facts: [], notRead: [] };

  for (const each of facts) {
    const match = GHOST_SOURCE.exec(each.source);
    if (!match) {
      continue;
    }
    const measure = match[2];
    if (!isMeasure(measure)) {
      result.notRead.push(each.fact);
      continue;
    }
    result.facts.push({ fact: each.fact, site: match[1], measure });
  }

  return result;
}

function isMeasure(text: string): text is Measure {
  return (MEASURES as readonly string[]).includes(text);
}
