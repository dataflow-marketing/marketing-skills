import { describe, expect, it } from "vitest";
import {
  describeAdded,
  describeAlreadyThere,
  describeDiffers,
  describeNothingToAdd,
  describePreview,
  describeReadBackSame,
  describeTooLarge,
} from "./describe-add.ts";

const SHOWN = { object: "ledger", business: "acme", where: "file ledger.txt" };

describe("describe-add", () => {
  it("previews every line put in and ends with the go flag", () => {
    const text = describePreview(SHOWN, "spec 1\ngoal: 100\n").text;
    expect(text).toContain("version: none (empty)");
    expect(text).toContain("would put in 2 lines:\n\n+ spec 1\n+ goal: 100");
    expect(text).toContain("Nothing is written yet.");
    expect(text.endsWith("--go --version none")).toBe(true);
  });

  it("says the object was added and read back with its version", () => {
    expect(describeAdded(SHOWN, "v1").text).toBe("ledger of acme added and read back.\nwhere: file ledger.txt\nversion: v1");
  });

  it("shows how the object differs from the file on read back", () => {
    expect(describeDiffers(SHOWN, "", "goal: 100\n", "none").text).toContain("is not what the file holds.");
    expect(describeReadBackSame(SHOWN, "v1").text).toContain("is what the file holds.");
  });

  it("refuses an object already there and names object-change", () => {
    const text = describeAlreadyThere(SHOWN, "v1", 3);
    expect(text).toContain("is already there (3 lines, version v1). Nothing was written.");
    expect(text).toContain("dfm-store:object-change");
  });

  it("names an empty file and a size too large", () => {
    expect(describeNothingToAdd(SHOWN, "new.txt")).toBe("new.txt is empty: there is no ledger to add. Nothing was written.");
    expect(describeTooLarge(SHOWN, 70000, 65535)).toBe("The ledger is 70000 bytes; file ledger.txt holds 65535 at most. Nothing was written.");
  });
});
