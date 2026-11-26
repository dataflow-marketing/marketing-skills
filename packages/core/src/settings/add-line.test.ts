import { describe, expect, it } from "vitest";
import { addLine } from "./add-line.ts";
import type { Settings } from "./types.ts";

function emptySettings(): Settings {
  return { spec: "spec 1", weekStarts: "Monday", sites: [], stores: [], bindings: [], houseRules: [], ownEmails: [] };
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

describe("own email lines", () => {
  it("adds each own email, in lower case", () => {
    const settings = emptySettings();
    expect(addLine(settings, "own email: Owner@Coffee-Shop.example")).toBe("own email");
    expect(addLine(settings, "own email: hello@coffee-shop.example")).toBe("own email");
    expect(settings.ownEmails).toEqual(["owner@coffee-shop.example", "hello@coffee-shop.example"]);
  });

  it("refuses an own email line with no address", () => {
    expect(addLine(emptySettings(), "own email: nobody")).toBeUndefined();
  });
});
