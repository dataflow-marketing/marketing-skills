import { readLedger } from "@dataflow-marketing/ledger/read";
import { describe, expect, it } from "vitest";
import { undeclaredFacts } from "./undeclared-facts.ts";

describe("undeclaredFacts", () => {
  it("names a fact counted but not declared, once, on every line it is counted on", () => {
    const ledger = readLedger(
      "spec 1\n=== graph ===\nfact visits: told\n=== done ===\n2026-11-16 fact count emails sent: 3\n2026-11-23 fact count emails sent [Keen]: 2\n",
    );
    expect(undeclaredFacts(ledger)).toEqual([{ kind: "fact not declared", about: "emails sent", lines: [5, 6] }]);
  });

  it("checks nothing for a business with no graph yet", () => {
    expect(undeclaredFacts(readLedger("spec 1\n=== done ===\n2026-11-16 fact count visits: 3\n"))).toEqual([]);
  });
});
