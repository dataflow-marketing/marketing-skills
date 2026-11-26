import { readLedger } from "@dataflow-marketing/ledger/read";
import { describe, expect, it } from "vitest";
import { unreadableLines } from "./unreadable-lines.ts";

describe("unreadableLines", () => {
  it("names each line the reader could not read, with its line", () => {
    const ledger = readLedger("spec 1\n=== graph ===\nnot a graph line\n");
    expect(unreadableLines(ledger)).toEqual([{ kind: "unreadable line", about: "not a graph line", lines: [3] }]);
  });
});
