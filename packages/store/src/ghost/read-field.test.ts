import { describe, expect, it } from "vitest";
import { fakeGhostMembers } from "../../fixtures/fake-ghost-members.ts";
import { readField } from "./read-field.ts";

const TOKEN = "a.b.c";
const LOOKUP = { address: "https://coffee-shop.example", email: "owner@coffee-shop.example", field: "next", token: TOKEN };
const OWNER = { id: "m1", email: "owner@coffee-shop.example", custom: { next: "goal: 100" } };

describe("readField", () => {
  it("reads the field of the one member with the email", async () => {
    const ghost = fakeGhostMembers({ members: [OWNER] });
    expect(await readField(LOOKUP, ghost.fetch)).toEqual({ ok: true, memberId: "m1", text: "goal: 100" });
  });

  it("matches the email whatever its case", async () => {
    const ghost = fakeGhostMembers({ members: [OWNER] });
    expect((await readField({ ...LOOKUP, email: "Owner@Coffee-Shop.example" }, ghost.fetch)).ok).toBe(true);
  });

  it("reads an empty field as empty", async () => {
    const ghost = fakeGhostMembers({ members: [{ ...OWNER, custom: {} }] });
    expect(await readField(LOOKUP, ghost.fetch)).toEqual({ ok: true, memberId: "m1", text: "" });
  });

  it("names a field the site does not have", async () => {
    const ghost = fakeGhostMembers({ members: [OWNER], fields: ["context"] });
    expect(await readField(LOOKUP, ghost.fetch)).toEqual({
      ok: false,
      problem: "The site has no member field called next. Its fields: context.",
    });
  });

  it("says when the Ghost is too old for member fields", async () => {
    const ghost = fakeGhostMembers({ members: [OWNER], oldGhost: true });
    expect(await readField(LOOKUP, ghost.fetch)).toEqual({
      ok: false,
      problem: "https://coffee-shop.example has no member custom fields: they need a newer Ghost than this site runs.",
    });
  });

  it("refuses an email with no member", async () => {
    const ghost = fakeGhostMembers({ members: [] });
    expect(await readField(LOOKUP, ghost.fetch)).toEqual({
      ok: false,
      problem: "No member on https://coffee-shop.example has the email owner@coffee-shop.example.",
    });
  });

  it("refuses an email with more than one member", async () => {
    const ghost = fakeGhostMembers({ members: [OWNER, { ...OWNER, id: "m2" }] });
    expect((await readField(LOOKUP, ghost.fetch)).ok).toBe(false);
  });

  it("names Ghost's answer when the key is refused: nothing more", async () => {
    const ghost = fakeGhostMembers({ members: [OWNER] });
    expect(await readField({ ...LOOKUP, token: "not-a-token" }, ghost.fetch)).toEqual({
      ok: false,
      problem: "Ghost answered 401 when asked for its member fields.",
    });
  });
});
