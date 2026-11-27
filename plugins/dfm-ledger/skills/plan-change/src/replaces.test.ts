import { describe, expect, it } from "vitest";
import { repeatStep, replaces, scriptStep } from "./replaces.ts";

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

  it("finds the step a repeat line is for", () => {
    expect(repeatStep("every week new post from 2026-11-23")).toBe("new post");
    expect(repeatStep("every month newsletter by Sam")).toBe("newsletter");
    expect(repeatStep("every week reply to comments")).toBe("reply to comments");
    expect(repeatStep("how new post: x")).toBeUndefined();
  });

  it("finds the step a script line belongs to", () => {
    expect(scriptStep("script comeback email: We have missed you.")).toBe("comeback email");
    expect(scriptStep("how new post: x")).toBeUndefined();
  });
});
