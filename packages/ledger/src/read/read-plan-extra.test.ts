import { describe, expect, it } from "vitest";
import { readOn, readOtherRepeat } from "./read-plan-extra.ts";

describe("readOtherRepeat", () => {
  it("reads a repeat every month or every 2 weeks", () => {
    expect(readOtherRepeat("every month guest coffee from 2026-10-01", 4)).toEqual({ every: "month", name: "guest coffee", from: "2026-10-01", line: 4 });
    expect(readOtherRepeat("every 2 weeks a post", 5)).toEqual({ every: "2 weeks", name: "a post", line: 5 });
    expect(readOtherRepeat("every week new post", 6)).toBeUndefined();
  });
});

describe("readOn", () => {
  it("reads a dated happening, one day or a range", () => {
    expect(readOn('on 2026-12-24 to 2027-01-01: "We are closed" [/news/closed-for-christmas/]', 7)).toEqual({ from: "2026-12-24", to: "2027-01-01", words: '"We are closed" [/news/closed-for-christmas/]', line: 7 });
    expect(readOn("on 2026-12-24: Christmas Eve, closed at noon", 8)?.to).toBe("2026-12-24");
  });
});
