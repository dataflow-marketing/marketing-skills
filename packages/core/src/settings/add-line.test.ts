import { describe, expect, it } from "vitest";
import { addLine } from "./add-line.ts";
import type { Settings } from "./types.ts";

function emptySettings(): Settings {
  return { spec: "spec 1", weekStarts: "Monday", sites: [], stores: [], bindings: [], houseRules: [] };
}

describe("addLine", () => {
  it("adds a line by its kind and names the kind", () => {
    const settings = emptySettings();
    expect(addLine(settings, "time zone: Australia/Melbourne")).toBe("time zone");
    expect(settings.timeZone).toBe("Australia/Melbourne");
  });

  it("adds a store line to the stores", () => {
    const settings = emptySettings();
    expect(addLine(settings, "store notes: file ~/dfm/ledgers")).toBe("store");
    expect(settings.stores).toEqual([{ name: "notes", connector: "file", where: "~/dfm/ledgers" }]);
  });

  it("adds nothing and names no kind for a line no kind fits", () => {
    const settings = emptySettings();
    expect(addLine(settings, "site coffee-shop: ghost")).toBeUndefined();
    expect(settings).toEqual(emptySettings());
  });
});
