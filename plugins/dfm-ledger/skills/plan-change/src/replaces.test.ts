import { describe, expect, it } from "vitest";
import { replaces, scriptStep } from "./replaces.ts";

describe("replaces", () => {
  it("names the line a change takes the place of", () => {
    expect(replaces("how new post: New words.")).toEqual(["how new post:"]);
    expect(replaces("want enquiries 5 a week by 2027-02-24")).toEqual(["want "]);
    expect(replaces("fact visits: cloudflare coffee-shop.example visits")).toEqual(["fact visits:"]);
    expect(replaces("new post -> visits: 20 to 40 of 100 views (assumed)")).toEqual(["new post -> visits:", "new post \u2192 visits:"]);
  });

  it("replaces nothing for a line added beside the others", () => {
    expect(replaces("every week new post")).toEqual([]);
    expect(replaces("2026-12-07 + market stall")).toEqual([]);
  });

  it("finds the step a script line belongs to", () => {
    expect(scriptStep("script comeback email: We have missed you.")).toBe("comeback email");
    expect(scriptStep("how new post: x")).toBeUndefined();
  });
});
