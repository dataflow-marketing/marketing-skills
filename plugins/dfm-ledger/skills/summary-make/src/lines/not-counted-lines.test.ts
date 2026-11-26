import { readLedger } from "@dataflow-marketing/ledger/read";
import { describe, expect, it } from "vitest";
import { notCountedLines } from "./not-counted-lines.ts";

describe("notCountedLines", () => {
  it("names the declared facts never counted", () => {
    const read = readLedger("spec 1\n=== graph ===\nfact visits: told\nfact enquiries: told\n=== done ===\n2026-11-16 fact count visits: 3\n");
    expect(notCountedLines(read.graph, read.done!)).toEqual(["not counted: enquiries (unknown is not zero)"]);
  });
});
