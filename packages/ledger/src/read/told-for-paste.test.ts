import { describe, expect, it } from "vitest";
import { toldForPaste } from "./told-for-paste.ts";

describe("toldForPaste", () => {
  it("reads the earlier word paste as told", () => {
    expect(toldForPaste("paste")).toBe("told");
    expect(toldForPaste("paste (stated)")).toBe("told (stated)");
  });

  it("changes only paste as the whole first word", () => {
    expect(toldForPaste("ghost paste")).toBe("ghost paste");
    expect(toldForPaste("pasted")).toBe("pasted");
  });
});
