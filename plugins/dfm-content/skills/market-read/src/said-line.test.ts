import { describe, expect, it } from "vitest";
import { saidFor } from "./said-line.ts";

describe("saidFor", () => {
  it("writes the ledger's said line, keyed by the Monday of the post's week", () => {
    const said = saidFor({
      day: "2026-12-01",
      title: "December's guest coffee | Wattle Street Espresso",
      url: "http://localhost:4104/news/decembers-guest-coffee/",
      text: "Wattle Street Espresso\nDecember's guest coffee\n2026-12-01\nThis month's guest is a natural Ethiopia: blueberry and honey.\nPlant milks are now free.\n",
    });
    expect(said.line).toBe(
      '2026-11-30 said on site on 2026-12-01: "December\'s guest coffee" http://localhost:4104/news/decembers-guest-coffee/ [everyone] summary: "This month\'s guest is a natural Ethiopia: blueberry and honey."',
    );
  });

  it("keeps a tab title whole when the page does not show the part before the bar", () => {
    const said = saidFor({ day: "2026-12-01", title: "News | Notes", url: "http://x/", text: "Something else. More." });
    expect(said.title).toBe("News | Notes");
  });
});
