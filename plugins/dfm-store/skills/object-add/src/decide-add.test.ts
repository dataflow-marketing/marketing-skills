import { GHOST_FIELD_LIMIT } from "@dataflow-marketing/store";
import { describe, expect, it } from "vitest";
import { decideAdd } from "./decide-add.ts";

const EMPTY = { text: "", version: "none" };

describe("decideAdd", () => {
  it("adds where the place is empty", () => {
    expect(decideAdd({ current: EMPTY, proposed: "goal: 100\n", limit: 65535 })).toEqual({ kind: "add" });
  });

  it("refuses when something is there, naming its version and lines", () => {
    const current = { text: "spec 1\ngoal: 100\n", version: "v1" };
    expect(decideAdd({ current, proposed: "goal: 120\n", limit: undefined })).toEqual({ kind: "already there", version: "v1", lines: 2 });
  });

  it("refuses even when what is there is the same text", () => {
    const current = { text: "goal: 100\n", version: "v1" };
    expect(decideAdd({ current, proposed: "goal: 100\n", limit: undefined }).kind).toBe("already there");
  });

  it("has nothing to add from an empty file", () => {
    expect(decideAdd({ current: EMPTY, proposed: "\n", limit: undefined })).toEqual({ kind: "nothing to add" });
  });

  it("refuses more than a Ghost field holds", () => {
    const proposed = "x".repeat(GHOST_FIELD_LIMIT + 1);
    expect(decideAdd({ current: EMPTY, proposed, limit: 65535 })).toEqual({
      kind: "too large",
      bytes: GHOST_FIELD_LIMIT + 1,
      limit: GHOST_FIELD_LIMIT,
    });
  });
});
