import { describe, expect, it } from "vitest";
import { placeLine } from "./place-line.ts";

describe("placeLine", () => {
  it("places each kind of change line in its part", () => {
    expect(placeLine("every week stamp card reminder on Instagram from 2026-12-07")).toMatchObject({ ok: true, part: "plan" });
    expect(placeLine("2026-12-07 + market stall")).toMatchObject({ ok: true, part: "plan" });
    expect(placeLine("how new post: Photograph the special.")).toMatchObject({ ok: true, part: "plan" });
    expect(placeLine("fact reminders seen: told")).toMatchObject({ ok: true, part: "graph" });
    expect(placeLine("stamp card reminder on Instagram -> stamp cards started: ? (unknown)")).toMatchObject({ ok: true, part: "graph" });
    expect(
      placeLine('2026-11-30 said on Instagram on 2026-12-01: "Iced coffee is back" https://coffee-shop.example/a/ [everyone] summary: "Back."'),
    ).toMatchObject({ ok: true, part: "done" });
  });

  it("names a line no part reads", () => {
    expect(placeLine("make the posts better")).toEqual({ ok: false, problem: "Not a ledger line: make the posts better" });
  });
});
