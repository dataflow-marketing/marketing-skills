import { describe, expect, it } from "vitest";
import { describeCheck } from "./describe-check.ts";

describe("describeCheck", () => {
  it("names each binding that can be read, with its size and the start of its version", () => {
    const text = describeCheck(
      [{ object: "ledger", business: "acme", ok: true, where: "file l.txt", version: "0123456789abcdef", lines: 3 }],
      "/b",
    ).text;
    expect(text).toBe("ok ledger acme: file l.txt (3 lines, version 0123456789ab)\nbackups: /b\nEvery binding can be read.");
  });

  it("says an empty object is empty", () => {
    const text = describeCheck([{ object: "ledger", business: "acme", ok: true, where: "f", version: "none", lines: 0 }], "/b").text;
    expect(text).toContain("(empty)");
  });

  it("names each problem and counts them", () => {
    const text = describeCheck([{ object: "ledger", business: "acme", ok: false, problem: "No member." }], "/b").text;
    expect(text).toContain("problem ledger acme: No member.");
    expect(text).toContain("1 of 1 bindings cannot be read.");
  });

  it("says when there are no bindings", () => {
    expect(describeCheck([], "/b").text).toContain("No bindings");
  });
});
