import { describe, expect, it } from "vitest";
import { describeResult } from "./describe-result.ts";

const RANGE = { week: "2026-11-23", from: "2026-11-22T13:00:00.000Z", to: "2026-11-26T22:15:00.000Z", soFar: true };
const LINE = '2026-11-23 said by email on 2026-11-24: "Hi" https://coffee-shop.example/hi/ [everyone] summary: "Hello."';

describe("describeResult", () => {
  it("shows each said line as a Change line and how to add them", () => {
    const result = describeResult("ledger.txt", RANGE, "Australia/Melbourne", [LINE], 1);
    expect(result.text).toContain(`Change: ${LINE}`);
    expect(result.text).toContain("run dfm-ledger:plan-change with it");
    expect(result.data).toMatchObject({ changeLines: [`Change: ${LINE}`] });
  });

  it("says when nothing went out; also when no site is named", () => {
    expect(describeResult("ledger.txt", RANGE, "UTC", [], 1).text).toContain("nothing was sent or published this week");
    expect(describeResult("ledger.txt", RANGE, "UTC", [], 0).text).toContain("no fact in the graph comes from Ghost");
  });
});
