import { describe, expect, it } from "vitest";
import { changePlan } from "./change-plan.ts";

const LEDGER = [
  "spec 1",
  "=== graph ===",
  "fact stamp cards started: told",
  "=== plan ===",
  "every week stamp card at the counter",
  "how stamp card at the counter: Offer a stamp card.",
  "script comeback email: Old words.",
].join("\n");

describe("changePlan", () => {
  it("adds new lines, replaces the lines they take the place of and leaves what is there", () => {
    const plan = changePlan(LEDGER, [
      "every week stamp card reminder on Instagram from 2026-12-07",
      "how stamp card at the counter: Offer a stamp card and say the tenth is free.",
      "fact stamp cards started: told",
      "stamp card reminder on Instagram -> stamp cards started: ? (unknown)",
    ]);
    expect(plan.ok && plan.items.map((item) => [item.kind, item.part])).toEqual([
      ["add", "plan"],
      ["replace", "plan"],
      ["already there", "graph"],
      ["add", "graph"],
    ]);
  });

  it("replaces a step's script lines as a set", () => {
    const plan = changePlan(LEDGER, ["script comeback email: We have missed you.", "script comeback email: Come in this week."]);
    expect(plan.ok && plan.parts.plan).toEqual({
      remove: ["script comeback email:"],
      add: ["script comeback email: We have missed you.", "script comeback email: Come in this week."],
    });
  });

  it("stops on a line that is not a ledger line; also on no change lines at all", () => {
    expect(changePlan(LEDGER, ["make the posts better"])).toEqual({ ok: false, problems: ["Not a ledger line: make the posts better"] });
    expect(changePlan(LEDGER, []).ok).toBe(false);
  });
});
