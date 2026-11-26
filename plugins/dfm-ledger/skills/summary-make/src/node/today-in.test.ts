import { describe, expect, it } from "vitest";
import { todayIn } from "./today-in.ts";

describe("todayIn", () => {
  it("is the date in the time zone, not the machine's", () => {
    const evening = new Date("2026-12-01T20:00:00Z");
    expect(todayIn("Australia/Melbourne", evening)).toBe("2026-12-02");
    expect(todayIn("Europe/London", evening)).toBe("2026-12-01");
  });
});
