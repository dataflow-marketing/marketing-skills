import { describe, expect, it } from "vitest";
import { describeMoved, describeNothing, describePreview, describeRemoved, describeStillThere } from "./describe-remove.ts";

const SHOWN = { object: "ledger", business: "acme", where: "file ledger.txt" };

describe("describe-remove", () => {
  it("previews every line taken out, the backup and the go command's version", () => {
    const text = describePreview(SHOWN, "spec 1\ngoal: 100\n", "v1").text;
    expect(text).toContain("would take out all 2 lines, leaving it empty:\n\n- spec 1\n- goal: 100");
    expect(text).toContain("A copy goes into the backups folder first.");
    expect(text).toContain("Nothing is removed yet.");
    expect(text.endsWith("--go --version v1")).toBe(true);
  });

  it("says a moved object was not removed and shows it as it is now", () => {
    const text = describeMoved(SHOWN, "goal: 110\n", "v2").text;
    expect(text).toContain("changed since it was read. Nothing was removed.");
    expect(text).toContain("As it is now:\n\ngoal: 110");
  });

  it("says when there is nothing to remove", () => {
    expect(describeNothing(SHOWN).text).toContain("nothing to remove, it is empty.");
  });

  it("names the backup after a remove", () => {
    expect(describeRemoved(SHOWN, "/b/ledger.txt").text).toContain("removed and read back: it is empty.\nwhere: file ledger.txt\nversion: none\nbackup: /b/ledger.txt");
  });

  it("says what is still there on read back", () => {
    expect(describeStillThere(SHOWN, "v1", 2).text).toContain("is still there (2 lines).");
  });
});
