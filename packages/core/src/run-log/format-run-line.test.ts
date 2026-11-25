import { describe, expect, it } from "vitest";
import { formatRunLine } from "./format-run-line.ts";

describe("formatRunLine", () => {
  const when = new Date("2026-11-24T22:30:00Z");

  it("makes one line with every part", () => {
    const line = formatRunLine({
      when,
      skill: "dfm-ghost:post-draft",
      what: "post draft",
      where: "ghost coffee-shop",
      before: "",
      after: 'draft "Our new oat flat white"',
    });
    expect(line).toBe(
      '2026-11-24T22:30:00.000Z | dfm-ghost:post-draft | post draft | ghost coffee-shop | before: (none) | after: draft "Our new oat flat white"',
    );
  });

  it("keeps a value with new lines on one line", () => {
    const line = formatRunLine({
      when,
      skill: "dfm-ledger:plan-change",
      what: "ledger",
      where: "members coffee-shop field next",
      before: "step 1: check your profiles\nstep 2: a new post",
      after: "step 1: check your profiles",
    });
    expect(line).not.toContain("\n");
    expect(line).toContain("before: step 1: check your profiles step 2: a new post");
  });
});
