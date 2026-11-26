import { describe, expect, it } from "vitest";
import { findChanges } from "./find-changes.ts";

describe("findChanges", () => {
  it("finds every Change: line (in a list or in backticks) and leaves the rest", () => {
    const response = [
      "Here is your response.",
      "Change: every week stamp card reminder on Instagram from 2026-12-07",
      "- `Change: fact reminders seen: told`",
      "Why: the regulars forget the card.",
    ].join("\n");
    expect(findChanges(response)).toEqual(["every week stamp card reminder on Instagram from 2026-12-07", "fact reminders seen: told"]);
  });

  it("reads curly quotes in a pasted said line as straight ones", () => {
    const pasted = 'Change: 2026-11-30 said on Instagram on 2026-12-01: \u201CIced coffee\u201D https://coffee-shop.example/a/ [everyone] summary: \u201CBack.\u201D';
    expect(findChanges(pasted)[0]).toContain('"Iced coffee"');
  });
});
