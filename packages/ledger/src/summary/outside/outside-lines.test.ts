import { describe, expect, it } from "vitest";
import { readLedger } from "../../read/index.ts";
import { outsideLines } from "./outside-lines.ts";

const LEDGER = [
  "spec 1",
  "=== graph ===",
  "business wattle-street-espresso: a takeaway window",
  'claim "Voted the best coffee on Wattle Street": no proof on the site [/] (inferred)',
  'claim "Award-winning": proof on the site [/about/] (inferred)',
  'offer Christmas cakes: "Orders close on 15 December" [/news/] until 2026-12-15 (inferred)',
  "=== plan ===",
  "every month guest coffee from 2026-10-01 (inferred)",
  "every week new post",
  "=== done ===",
  "2026-11-23 read on 2026-11-27",
  "2026-11-23 fact total posts: 2",
  '2026-09-28 said on site on 2026-10-01: "October\'s guest coffee" http://localhost:4104/a/ [everyone] summary: "A Brazil."',
  '2026-11-02 said on site on 2026-11-03: "November\'s guest coffee" http://localhost:4104/b/ [everyone] summary: "A Kenya."',
  "2027-01-04 read on 2027-01-05",
  "2027-01-04 fact total posts: 3",
  '2026-11-30 said on site on 2026-12-01: "December\'s guest coffee" http://localhost:4104/c/ [everyone] summary: "An Ethiopia."',
  '2027-01-04 new claim "Voted the best coffee on Wattle Street"',
].join("\n");

describe("outsideLines", () => {
  it("sums up a site read from outside, counting only the steps worked out from its posts", () => {
    expect(outsideLines(readLedger(LEDGER))).toEqual([
      "as at 2027-01-04, read 2 times from 2026-11-23 (calculated)",
      "posts: 3, published from 2026-10-01 to 2026-12-01 (calculated)",
      "every month guest coffee: done 3 of 3 months, assumed (calculated)",
      'changed at the last read: 2027-01-04 new claim "Voted the best coffee on Wattle Street" (calculated)',
      "offers ended: Christmas cakes on 2026-12-15 (calculated)",
      'claims with no proof: "Voted the best coffee on Wattle Street" (calculated)',
    ]);
  });

  it("gives nothing for a ledger that was never read from outside", () => {
    expect(outsideLines(readLedger("spec 1\n=== plan ===\nevery week new post\n"))).toEqual([]);
  });
});
