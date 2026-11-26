import { describe, expect, it } from "vitest";
import { nowIn } from "./now-in.ts";

describe("nowIn", () => {
  it("gives the day and the time with its offset in the time zone", () => {
    expect(nowIn("Australia/Melbourne", new Date("2026-12-01T23:00:00Z"))).toEqual({
      today: "2026-12-02",
      stamp: "2026-12-02T10:00+11:00",
    });
    expect(nowIn("UTC", new Date("2026-12-01T23:00:00Z"))).toEqual({ today: "2026-12-01", stamp: "2026-12-01T23:00+00:00" });
  });
});
