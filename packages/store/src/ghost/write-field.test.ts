import { describe, expect, it } from "vitest";
import { fakeGhostMembers } from "../../fixtures/fake-ghost-members.ts";
import { writeField } from "./write-field.ts";

const CHANGE = { address: "https://coffee-shop.example", memberId: "m1", field: "next", text: "goal: 120", token: "a.b.c" };

function ghostWithOwner() {
  return fakeGhostMembers({ members: [{ id: "m1", email: "owner@coffee-shop.example", custom: { next: "goal: 100", context: "kept" } }] });
}

describe("writeField", () => {
  it("changes the one field and gives back what Ghost saved", async () => {
    const ghost = ghostWithOwner();
    expect(await writeField(CHANGE, ghost.fetch)).toEqual({ ok: true, saved: "goal: 120" });
    expect(ghost.members[0].custom).toEqual({ next: "goal: 120", context: "kept" });
  });

  it("sends a PUT to the member with only that field", async () => {
    const ghost = ghostWithOwner();
    await writeField(CHANGE, ghost.fetch);
    const sent = ghost.requests[0];
    expect(sent.method).toBe("PUT");
    expect(JSON.parse(sent.body ?? "")).toEqual({ members: [{ metafields: { custom: { next: "goal: 120" } } }] });
  });

  it("names Ghost's answer when the write is refused", async () => {
    const ghost = ghostWithOwner();
    expect(await writeField({ ...CHANGE, memberId: "nobody" }, ghost.fetch)).toEqual({
      ok: false,
      problem: "Ghost answered 404 to the change. Read the field again before trying once more.",
    });
  });
});
