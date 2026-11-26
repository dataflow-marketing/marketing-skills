import { describe, expect, it } from "vitest";
import { readTold } from "./told.ts";

describe("readTold", () => {
  it("reads a name and a whole number, with or without thousands", () => {
    expect(readTold("visits=560")).toEqual({ ok: true, told: { name: "visits", n: 560 } });
    expect(readTold("cups served = 1,494")).toEqual({ ok: true, told: { name: "cups served", n: 1494 } });
  });

  it("refuses what is not a whole number", () => {
    expect(readTold("visits=lots").ok).toBe(false);
    expect(readTold("visits=5.5").ok).toBe(false);
  });
});
