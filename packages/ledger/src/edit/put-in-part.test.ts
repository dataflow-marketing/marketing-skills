import { describe, expect, it } from "vitest";
import { putInPart } from "./put-in-part.ts";

describe("putInPart", () => {
  it("replaces an earlier line and adds the new ones at the end of the part, before the next part", () => {
    const ledger = "spec 1\n=== plan ===\nhow new post: Old.\nevery week new post\n\n=== done ===\nstarted 2026-11-16\n";
    const changed = putInPart(ledger, "plan", { remove: ["how new post:"], add: ["how new post: New."] });
    expect(changed).toBe("spec 1\n=== plan ===\nevery week new post\nhow new post: New.\n\n=== done ===\nstarted 2026-11-16\n");
  });

  it("puts a missing part in its place in the order", () => {
    const changed = putInPart("spec 1\n=== graph ===\nfact visits: told\n=== done ===\nstarted 2026-11-16\n", "plan", {
      remove: [],
      add: ["every week new post"],
    });
    expect(changed).toBe("spec 1\n=== graph ===\nfact visits: told\n=== plan ===\nevery week new post\n\n=== done ===\nstarted 2026-11-16\n");
  });
});
