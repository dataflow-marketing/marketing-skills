import { describe, expect, it } from "vitest";
import { settingsProblems } from "./settings-problems.ts";

describe("settingsProblems", () => {
  it("names what core's settings reader finds, once each", () => {
    expect(settingsProblems("spec 1\n").map((problem) => problem.about)).toEqual(["time zone: missing (it is required)"]);
    expect(settingsProblems("spec 1\ntime zone: Australia/Melbourne\n")).toEqual([]);
  });
});
