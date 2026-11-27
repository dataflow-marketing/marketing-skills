import { describe, expect, it } from "vitest";
import { countStep, strengthOf } from "./step-count.ts";

const WEEKLY = { every: "week" as const, name: "this week's special", from: "2026-11-02" };
const posts = [
  { day: "2026-11-02", title: "This week's special: pumpkin soup" },
  { day: "2026-11-09", title: "Trivia night is back" },
  { day: "2026-11-16", title: "This week's special: shakshuka" },
  { day: "2027-01-04", title: "This week's special: summer salad" },
];

describe("countStep", () => {
  it("counts the weeks done, names the weeks not done and leaves out a closure", () => {
    const count = countStep(WEEKLY, posts, [{ from: "2026-11-23", to: "2026-12-27" }], "2027-01-05");
    expect(count).toEqual({ done: 3, of: 5, notDone: ["2026-11-09", "2026-12-28"], closed: ["2026-11-23", "2026-11-30", "2026-12-07", "2026-12-14", "2026-12-21"] });
    expect(strengthOf(count)).toBe("assumed");
  });

  it("does not count the week of the last read against a step until it is over", () => {
    const count = countStep(WEEKLY, posts.slice(0, 1), [], "2026-11-04");
    expect(count).toEqual({ done: 1, of: 1, notDone: [], closed: [] });
    expect(strengthOf(count)).toBe("unknown");
  });

  it("counts calendar months for a monthly step", () => {
    const monthly = { every: "month" as const, name: "guest coffee", from: "2026-10-01" };
    const guest = ["2026-10-01", "2026-11-03", "2026-12-01", "2027-01-04"].map((day) => ({ day, title: "A guest coffee" }));
    expect(countStep(monthly, guest, [], "2027-01-05")).toEqual({ done: 4, of: 4, notDone: [], closed: [] });
  });

  it("calls six or more done with none missed believed", () => {
    expect(strengthOf({ done: 6, of: 6, notDone: [], closed: [] })).toBe("believed");
  });

  it("reads a plan line that ends with its source", async () => {
    const { readPlan } = await import("./plan-steps.ts");
    expect(readPlan(["every week a post from 2026-11-02 (inferred)"]).steps).toEqual([{ every: "week", name: "a post", from: "2026-11-02" }]);
  });
});
