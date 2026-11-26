import { describe, expect, it } from "vitest";
import { carriedInto } from "./carried-into.ts";
import type { Done, Entry } from "./ledger-types.ts";

const FLYERS: Entry = { date: "2026-11-17", op: "+", methods: [{ name: "flyer drop" }] };
const NO_DONE: Done = { weeks: {} };

describe("carriedInto", () => {
  it("carries a + step not ticked into later weeks, kept with its own week's Monday", () => {
    expect(carriedInto([FLYERS], NO_DONE, "2026-11-30", "2026-12-06")).toEqual({ "flyer drop": "2026-11-16" });
  });

  it("stops carrying once it is ticked", () => {
    const done: Done = { weeks: { "2026-11-23": { answers: { "flyer drop": "done" } } } };
    expect(carriedInto([FLYERS], done, "2026-11-30", "2026-12-06")).toEqual({});
  });

  it("stops carrying once a - line takes it off", () => {
    const off: Entry = { date: "2026-11-25", op: "-", methods: [{ name: "flyer drop" }] };
    expect(carriedInto([FLYERS, off], NO_DONE, "2026-11-30", "2026-12-06")).toEqual({});
  });

  it("never carries a step into its own week", () => {
    expect(carriedInto([FLYERS], NO_DONE, "2026-11-16", "2026-11-22")).toEqual({});
  });
});
