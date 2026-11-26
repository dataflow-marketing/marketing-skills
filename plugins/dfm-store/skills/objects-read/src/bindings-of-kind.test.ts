import type { Settings } from "@dataflow-marketing/core";
import { describe, expect, it } from "vitest";
import { bindingsOfKind } from "./bindings-of-kind.ts";

function settingsWith(bindings: Settings["bindings"]): Settings {
  return { spec: "1", weekStarts: "monday", sites: [], stores: [], bindings, houseRules: [] };
}

const LEDGER_BAKERY = { object: "ledger", business: "bakery", store: "files", place: "bakery.txt" };
const LEDGER_ACME = { object: "ledger", business: "acme", store: "members", place: "owner@acme.example next" };
const PROFILE_ACME = { object: "profile", business: "acme", store: "files", place: "acme-profile.txt" };

describe("bindingsOfKind", () => {
  it("gives back the bindings of the kind only, in business order", () => {
    const settings = settingsWith([LEDGER_BAKERY, PROFILE_ACME, LEDGER_ACME]);
    expect(bindingsOfKind(settings, "ledger")).toEqual({ ok: true, bindings: [LEDGER_ACME, LEDGER_BAKERY] });
  });

  it("gives back none when settings bind no object of the kind", () => {
    expect(bindingsOfKind(settingsWith([PROFILE_ACME]), "ledger")).toEqual({ ok: true, bindings: [] });
  });

  it("refuses a kind that is not a name", () => {
    expect(bindingsOfKind(settingsWith([]), "Ledger.txt").ok).toBe(false);
  });
});
