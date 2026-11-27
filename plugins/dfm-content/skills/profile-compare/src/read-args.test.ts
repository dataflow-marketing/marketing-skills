import { describe, expect, it } from "vitest";
import { readArgs } from "./read-args.ts";

describe("readArgs", () => {
  it("reads two profiles over time", () => {
    expect(readArgs(["--before", "m1/profile.txt", "--after", "m2/profile.txt"])).toEqual({ ok: true, args: { mode: "over time", before: "m1/profile.txt", after: "m2/profile.txt" } });
  });

  it("reads several named profiles side by side", () => {
    expect(readArgs(["--side-by-side", "one=a.txt", "two=b.txt", "--json"])).toEqual({
      ok: true,
      args: { mode: "side by side", profiles: [{ name: "one", file: "a.txt" }, { name: "two", file: "b.txt" }] },
    });
  });

  it("refuses one profile side by side or a missing after", () => {
    expect(readArgs(["--side-by-side", "one=a.txt"]).ok).toBe(false);
    expect(readArgs(["--before", "a.txt"]).ok).toBe(false);
  });
});
