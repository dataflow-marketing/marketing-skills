import { describe, expect, it } from "vitest";
import { splitParts } from "./split-parts.ts";

describe("splitParts", () => {
  it("reads the spec line and keeps each part's lines with their numbers", () => {
    const split = splitParts("spec 1\n=== graph ===\nfact visits: told\n=== done ===\nstarted 2026-11-16");
    expect(split.spec).toBe(1);
    expect(split.parts.graph).toEqual([{ line: 3, text: "fact visits: told" }]);
    expect(split.parts.done).toEqual([{ line: 5, text: "started 2026-11-16" }]);
    expect(split.outside).toEqual([]);
  });

  it("names a line before the parts and a part written twice", () => {
    const split = splitParts("spec 1\nhello\n=== plan ===\n=== plan ===");
    expect(split.outside).toEqual([
      { part: "before the parts", line: 2, text: "hello" },
      { part: "plan", line: 4, text: "=== plan ===" },
    ]);
  });
});
