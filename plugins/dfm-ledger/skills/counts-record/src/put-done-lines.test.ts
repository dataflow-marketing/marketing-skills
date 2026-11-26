import { describe, expect, it } from "vitest";
import { putDoneLines } from "./put-done-lines.ts";

describe("putDoneLines", () => {
  it("replaces an earlier line and adds the new ones at the end of the done part, before the summary", () => {
    const ledger = "spec 1\n=== done ===\n2026-11-30 fact count visits: 500\nstarted 2026-11-16\n\n=== summary ===\nold\n";
    const changed = putDoneLines(ledger, { remove: ["2026-11-30 fact count visits:"], add: ["2026-11-30 fact count visits: 560"] });
    expect(changed).toBe("spec 1\n=== done ===\nstarted 2026-11-16\n2026-11-30 fact count visits: 560\n\n=== summary ===\nold\n");
  });

  it("starts a done part when there is none", () => {
    expect(putDoneLines("spec 1\n=== graph ===\nfact visits: told\n", { remove: [], add: ["started 2026-11-16"] })).toBe(
      "spec 1\n=== graph ===\nfact visits: told\n=== done ===\nstarted 2026-11-16\n",
    );
  });
});
