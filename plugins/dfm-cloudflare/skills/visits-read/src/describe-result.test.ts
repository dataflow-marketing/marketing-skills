import { describe, expect, it } from "vitest";
import { describeResult } from "./describe-result.ts";

const RANGE = { week: "2026-11-23", from: "2026-11-22T13:00:00.000Z", to: "2026-11-26T22:15:00.000Z", soFar: true };
const VISITS = { fact: "site visits", host: "coffee-shop.example", measure: "visits" as const, n: 16, estimated: false };

describe("describeResult", () => {
  it("shows each number with its source and the counts-record line to record them", () => {
    const result = describeResult("ledger.txt", RANGE, "Australia/Melbourne", [VISITS]);
    expect(result.text).toBe(
      [
        "spec 1",
        "read: ledger.txt",
        "week of 2026-11-23: so far (to now in Australia/Melbourne)",
        "",
        "site visits=16 (cloudflare coffee-shop.example visits)",
        "",
        'nothing written: to record them, dfm-ledger:counts-record --count "site visits=16"',
      ].join("\n"),
    );
    expect(result.data).toMatchObject({ week: "2026-11-23", soFar: true, countArgs: ["site visits=16"] });
  });

  it("marks an estimate", () => {
    const result = describeResult("ledger.txt", RANGE, "UTC", [{ ...VISITS, estimated: true }]);
    expect(result.text).toContain("site visits=16 (cloudflare coffee-shop.example visits) estimated: Cloudflare sampled it");
  });

  it("says a whole week gone by", () => {
    const result = describeResult("ledger.txt", { ...RANGE, soFar: false }, "UTC", [VISITS]);
    expect(result.text).toContain("week of 2026-11-23: the whole week (UTC)");
  });

  it("says when no fact comes from Cloudflare", () => {
    const result = describeResult("ledger.txt", RANGE, "UTC", []);
    expect(result.text).toContain("no fact in the graph comes from Cloudflare: nothing to read");
    expect(result.data).toMatchObject({ countArgs: [] });
  });
});
