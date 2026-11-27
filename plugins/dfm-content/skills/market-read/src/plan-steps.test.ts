import { describe, expect, it } from "vitest";
import { readPlan } from "./plan-steps.ts";

describe("readPlan", () => {
  it("reads a plan line that ends with its source", () => {
    expect(readPlan(["every week a post from 2026-11-02 (inferred)"]).steps).toEqual([{ every: "week", name: "a post", from: "2026-11-02" }]);
  });
});
