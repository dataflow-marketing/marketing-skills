import { describe, expect, it } from "vitest";
import { describeDiffers, describeMoved, describeNothing, describePreview, describeTooLarge, describeWritten } from "./describe-change.ts";

const SHOWN = { object: "ledger", business: "acme", where: "file ledger.txt" };

describe("describe-change", () => {
  it("previews the lines taken out and put in with the go command's version", () => {
    const text = describePreview(SHOWN, "goal: 100\n", "goal: 120\n", "v1").text;
    expect(text).toContain("would take out 1 lines and put in 1:");
    expect(text).toContain("- goal: 100\n+ goal: 120");
    expect(text).toContain("Nothing is written yet.");
    expect(text.endsWith("--go --version v1")).toBe(true);
  });

  it("says a moved object was not written and shows the change from it as it is now", () => {
    const text = describeMoved(SHOWN, "goal: 110\n", "goal: 120\n", "v2").text;
    expect(text).toContain("changed since it was read. Nothing was written.");
    expect(text).toContain("- goal: 110\n+ goal: 120");
  });

  it("shows how the object differs from the file on read back", () => {
    expect(describeDiffers(SHOWN, "goal: 110\n", "goal: 120\n", "v2").text).toContain("is not what the file holds.");
  });

  it("says when there is nothing to change", () => {
    expect(describeNothing(SHOWN, "v1").text).toContain("nothing to change");
  });

  it("names the size and the limit", () => {
    expect(describeTooLarge(SHOWN, 70000, 65535)).toBe("The ledger is 70000 bytes; file ledger.txt holds 65535 at most. Nothing was written.");
  });

  it("names the backup or says there was nothing to back up", () => {
    expect(describeWritten(SHOWN, "v2", "/b/ledger.txt").text).toContain("backup: /b/ledger.txt");
    expect(describeWritten(SHOWN, "v2", undefined).text).toContain("backup: none (it was empty)");
  });
});
