import { describe, expect, it } from "vitest";
import { GHOST_FIELD_LIMIT, decideWrite, readBackProblems, sameText } from "./decide-write.ts";

const CURRENT = { text: "goal: 100\n", version: "v1" };

describe("decideWrite", () => {
  it("writes when the version is the one seen and the text differs", () => {
    expect(decideWrite({ seenVersion: "v1", current: CURRENT, proposed: "goal: 120\n", connector: "ghost" })).toEqual({ kind: "write" });
  });

  it("stops when the version has moved, showing the object as it is now", () => {
    expect(decideWrite({ seenVersion: "v0", current: CURRENT, proposed: "goal: 120\n", connector: "file" })).toEqual({
      kind: "moved",
      now: "goal: 100\n",
    });
  });

  it("has nothing to change when only trailing white space differs", () => {
    expect(decideWrite({ seenVersion: "v1", current: CURRENT, proposed: "goal: 100", connector: "file" })).toEqual({
      kind: "nothing to change",
    });
  });

  it("refuses more than a Ghost field holds", () => {
    const proposed = "x".repeat(GHOST_FIELD_LIMIT + 1);
    expect(decideWrite({ seenVersion: "v1", current: CURRENT, proposed, connector: "ghost" })).toEqual({
      kind: "too large",
      bytes: GHOST_FIELD_LIMIT + 1,
      limit: GHOST_FIELD_LIMIT,
    });
  });

  it("puts no limit on a file", () => {
    const proposed = "x".repeat(GHOST_FIELD_LIMIT + 1);
    expect(decideWrite({ seenVersion: "v1", current: CURRENT, proposed, connector: "file" }).kind).toBe("write");
  });

  it("counts bytes, not characters", () => {
    const proposed = "\u2192".repeat(22000);
    expect(decideWrite({ seenVersion: "v1", current: CURRENT, proposed, connector: "ghost" }).kind).toBe("too large");
  });
});

describe("readBackProblems", () => {
  it("finds none when the store kept what was sent", () => {
    expect(readBackProblems("goal: 120\n", "goal: 120")).toEqual([]);
  });

  it("names a store that kept something else", () => {
    expect(readBackProblems("goal: 120", "goal: 100")).toEqual(["What the store kept is not what was sent."]);
  });

  it("names an object that is not there", () => {
    expect(readBackProblems("goal: 120", undefined)).toEqual(["The object is not there after the write."]);
  });
});

describe("sameText", () => {
  it("ignores trailing white space only", () => {
    expect(sameText("a\n\n", "a")).toBe(true);
    expect(sameText(" a", "a")).toBe(false);
  });
});
