import { describe, expect, it } from "vitest";
import { doneLines, planArchive } from "./plan-archive.ts";

const SMALL = { keepWeeks: 2, limit: 100, atPercent: 50 };

function ledger(done: string[]): string {
  return ["spec 1", "=== plan ===", "every week new post", "=== done ===", ...done, "", "=== summary ===", "written today", ""].join("\n");
}

describe("planArchive", () => {
  it("moves nothing while the ledger is at or under the threshold", () => {
    const plan = planArchive(ledger(["2026-11-23 new post: done"]), "", "2026-11-27", { keepWeeks: 2, limit: 65_535, atPercent: 75 });
    expect(plan.kind).toBe("under the threshold");
  });

  it("moves the done lines of every week before the last ones kept, whole, into the history", () => {
    const done = ["2026-11-09 fact count site visits: 130", "2026-11-09 new post: done", "2026-11-16 fact count site visits: 72", "2026-11-23 fact count site visits: 16"];
    const plan = planArchive(ledger(done), "", "2026-11-27", SMALL);
    expect(plan.kind).toBe("move");
    if (plan.kind !== "move") return;
    expect(plan.keepFrom).toBe("2026-11-16");
    expect(plan.moving).toEqual(["2026-11-09 fact count site visits: 130", "2026-11-09 new post: done"]);
    expect(doneLines(plan.ledger)).toEqual(["2026-11-16 fact count site visits: 72", "2026-11-23 fact count site visits: 16"]);
    expect(plan.ledger).toContain("=== summary ===");
    expect(doneLines(plan.history)).toEqual(["2026-11-09 fact count site visits: 130", "2026-11-09 new post: done"]);
    expect(plan.bytesAfter).toBeLessThan(plan.bytesBefore);
  });

  it("adds to a history that is there and never adds a line twice", () => {
    const history = "spec 1\n=== done ===\n2026-11-02 fact count site visits: 90\n2026-11-09 new post: done\n";
    const plan = planArchive(ledger(["2026-11-09 new post: done", "2026-11-09 fact count site visits: 130", "2026-11-23 fact count site visits: 16"]), history, "2026-11-27", SMALL);
    expect(plan.kind === "move" && doneLines(plan.history)).toEqual(["2026-11-02 fact count site visits: 90", "2026-11-09 new post: done", "2026-11-09 fact count site visits: 130"]);
  });

  it("says when nothing is old enough to move", () => {
    const plan = planArchive(ledger(["2026-11-23 fact count site visits: 16 and a long note to pass the threshold"]), "", "2026-11-27", SMALL);
    expect(plan.kind).toBe("nothing old enough");
  });

  it("keeps lines that are not dated, such as the started line", () => {
    const plan = planArchive(ledger(["started 2026-07-01", "2026-11-02 new post: done", "2026-11-23 new post: done"]), "", "2026-11-27", SMALL);
    expect(plan.kind === "move" && doneLines(plan.ledger)).toEqual(["started 2026-07-01", "2026-11-23 new post: done"]);
  });
});
