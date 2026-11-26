import { describe, expect, it } from "vitest";
import { describeRead } from "./describe-read.ts";

const READ = { object: "ledger", business: "acme", where: "file ledger.txt", version: "abc", text: "goal: 100\n" };

describe("describeRead", () => {
  it("names the object, where it is and its version, then its text", () => {
    expect(describeRead(READ).text).toBe("ledger of acme\nwhere: file ledger.txt\nversion: abc\n\ngoal: 100");
  });

  it("says an empty object is empty", () => {
    expect(describeRead({ ...READ, text: "", version: "none" }).text).toContain("(empty)");
  });

  it("says where the text was saved instead of printing it", () => {
    expect(describeRead({ ...READ, savedTo: "copy.txt" }).text).toBe(
      "ledger of acme\nwhere: file ledger.txt\nversion: abc\nsaved to: copy.txt",
    );
  });
});
