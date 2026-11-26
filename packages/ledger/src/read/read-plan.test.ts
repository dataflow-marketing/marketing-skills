import { describe, expect, it } from "vitest";
import { readPlan } from "./read-plan.ts";

function numbered(text: string) {
  return text.split("\n").map((line, index) => ({ line: index + 1, text: line }));
}

describe("readPlan", () => {
  const { plan, unread } = readPlan(
    numbered(
      [
        "start 2026-11-16",
        "want new subscribers 1 a week by 2027-02-24",
        "every week check your profiles from 2026-11-16",
        "how check your profiles: Check your profiles are up to date.",
        "2026-11-23 + flyer drop",
        "not a plan line",
      ].join("\n"),
    ),
  );

  it("reads the start and the goal", () => {
    expect(plan.start).toBe("2026-11-16");
    expect(plan.want).toEqual({ fact: "new subscribers", per: { n: 1, every: "week" }, by: "2027-02-24" });
  });

  it("reads a repeated step with its how", () => {
    expect(plan.repeats[0].methods).toEqual([{ name: "check your profiles" }]);
    expect(plan.repeats[0].from).toBe("2026-11-16");
    expect(plan.hows["check your profiles"]).toBe("Check your profiles are up to date.");
  });

  it("reads a dated step added that week", () => {
    expect(plan.entries[0]).toEqual({ date: "2026-11-23", op: "+", methods: [{ name: "flyer drop" }], line: 5 });
  });

  it("gives back a line it cannot read", () => {
    expect(unread).toEqual([{ line: 6, text: "not a plan line" }]);
  });

  it("keeps a plus on a goal, which reads the same as without", () => {
    const { plan: grows } = readPlan(numbered("want followers +1 a week"));
    expect(grows.want).toEqual({ fact: "followers", per: { n: 1, every: "week" }, grows: true });
  });
});
