// The test for write-summary.ts on the coffee shop example: the summary it writes is the example's own, line for line.
// A .node.test.ts: it reads the example from the repo.

import { readFile } from "node:fs/promises";
import { readLedger } from "../read/index.ts";
import { describe, expect, it } from "vitest";
import { writeSummary } from "./write-summary.ts";

const EXAMPLE = new URL("../../../../examples/coffee-shop/ledger.txt", import.meta.url);

describe("writeSummary on the coffee shop example", () => {
  it("writes the example's summary, line for line", async () => {
    const text = await readFile(EXAMPLE, "utf8");
    const lines = text.replace(/\s+$/, "").split("\n");
    const summary = lines.slice(lines.indexOf("=== summary ===") + 1);
    expect(writeSummary(readLedger(text), "2026-12-02")).toEqual(summary);
  });
});
