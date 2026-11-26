import { describe, expect, it } from "vitest";
import { decideRemove } from "./decide-remove.ts";

const CURRENT = { text: "goal: 100\n", version: "v1" };

describe("decideRemove", () => {
  it("removes when the version is the one seen", () => {
    expect(decideRemove({ seenVersion: "v1", current: CURRENT })).toEqual({ kind: "remove" });
  });

  it("stops when the version has moved, showing the object as it is now", () => {
    expect(decideRemove({ seenVersion: "v0", current: CURRENT })).toEqual({ kind: "moved", now: "goal: 100\n" });
  });

  it("has nothing to remove from an empty place, whatever version was seen", () => {
    expect(decideRemove({ seenVersion: "v1", current: { text: "", version: "none" } })).toEqual({ kind: "nothing to remove" });
  });
});
