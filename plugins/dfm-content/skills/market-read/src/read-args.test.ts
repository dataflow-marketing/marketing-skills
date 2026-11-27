import { describe, expect, it } from "vitest";
import { readArgs } from "./read-args.ts";

describe("readArgs", () => {
  it("reads a first read", () => {
    const asked = readArgs(["--read", "reads/x", "--day", "2026-11-27", "--business", "x", "--site", "http://localhost:4101", "--own", "--out", "x.txt"]);
    expect(asked).toEqual({ ok: true, args: { job: "read", folder: "reads/x", day: "2026-11-27", out: "x.txt", ledger: undefined, business: "x", site: "http://localhost:4101", own: true, dates: undefined } });
  });

  it("refuses a read with no ledger and no business", () => {
    expect(readArgs(["--read", "reads/x", "--day", "2026-11-27", "--out", "x.txt"]).ok).toBe(false);
  });

  it("refuses a day that is not a date", () => {
    expect(readArgs(["--read", "reads/x", "--day", "Friday", "--out", "x.txt", "--ledger", "l.txt"]).ok).toBe(false);
  });

  it("reads the summary and gaps jobs", () => {
    expect(readArgs(["--summary", "l.txt"])).toEqual({ ok: true, args: { job: "summary", ledger: "l.txt", dates: undefined } });
    expect(readArgs(["--gaps", "--ledger", "a.txt", "--market", "b.txt"])).toEqual({ ok: true, args: { job: "gaps", ledger: "a.txt", market: "b.txt" } });
  });
});
