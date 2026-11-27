import { describe, expect, it } from "vitest";
import { findGaps, gapsText } from "./gaps.ts";

const LEDGER = "spec 1\n=== graph ===\nchannel Instagram: the cafe's own account\noffer stamp card: the tenth coffee free (plan)\n=== plan ===\nevery week new post\n=== done ===\n=== summary ===\n";
const MARKET = 'spec 1\n=== graph ===\noffer Stamp card: "the tenth coffee is on us" [/] (observed)\noffer iced coffee: "Iced coffee is back" [/] (observed)\n=== plan ===\n=== done ===\n=== summary ===\nposts: 2, published from 2026-11-10 to 2026-11-24 (calculated)\n';

describe("findGaps", () => {
  it("lists by name what the ledger says and the site does not, then the other way round", () => {
    const gaps = findGaps(LEDGER, MARKET);
    expect(gapsText(gaps)).toBe(
      [
        "in its ledger, not on its site: channel Instagram",
        "on its site, not in its ledger: offer iced coffee",
        "its ledger plans:",
        "  every week new post",
        "its site shows:",
        "  posts: 2, published from 2026-11-10 to 2026-11-24 (calculated)",
        "",
      ].join("\n"),
    );
  });
});
