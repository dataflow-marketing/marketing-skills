import { readLedger } from "@dataflow-marketing/ledger/read";
import { describe, expect, it } from "vitest";
import { stepsWithoutLinks } from "./steps-without-links.ts";

describe("stepsWithoutLinks", () => {
  it("names a planned step no link starts from; never one taken off", () => {
    const ledger = readLedger(
      "spec 1\n=== graph ===\nopen the cafe -> visits: ? (unknown)\n=== plan ===\nevery week open the cafe\nevery week market stall\n2026-11-23 - flyer drop\n",
    );
    expect(stepsWithoutLinks(ledger)).toEqual([{ kind: "step with no link", about: "market stall", lines: [6] }]);
  });
});
