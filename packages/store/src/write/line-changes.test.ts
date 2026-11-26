import { describe, expect, it } from "vitest";
import { lineChanges } from "./line-changes.ts";

describe("lineChanges", () => {
  it("shows a changed line as taken out and put in", () => {
    expect(lineChanges("a\nb\nc\n", "a\nB\nc\n")).toEqual({ lines: ["- b", "+ B"], out: 1, in: 1 });
  });

  it("shows added lines only", () => {
    expect(lineChanges("a\n", "a\nb\nc")).toEqual({ lines: ["+ b", "+ c"], out: 0, in: 2 });
  });

  it("shows everything put in for an empty object", () => {
    expect(lineChanges("", "a\nb")).toEqual({ lines: ["+ a", "+ b"], out: 0, in: 2 });
  });

  it("shows everything taken out when cleared", () => {
    expect(lineChanges("a\nb", "")).toEqual({ lines: ["- a", "- b"], out: 2, in: 0 });
  });

  it("shows nothing when only the last newline differs", () => {
    expect(lineChanges("a\nb\n", "a\nb")).toEqual({ lines: [], out: 0, in: 0 });
  });
});
