import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { fakeGhostMembers } from "../../fixtures/fake-ghost-members.ts";
import { FAKE_REST_ADDRESS, FAKE_REST_KEY, fakeRestStore } from "../../fixtures/fake-rest-store.ts";
import type { GhostPlace, RestPlace } from "../find-place.ts";
import { versionOf } from "../version.ts";
import { readObject, removeObject, writeObject } from "./store-object.ts";

// Made up: a Ghost Admin key in Ghost's form, for a site that does not exist
const KEY = "c0ffeec0ffeec0ffeec0ffee:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

async function ghostPlace(): Promise<GhostPlace> {
  const folder = await mkdtemp(join(tmpdir(), "dfm-store-"));
  await writeFile(join(folder, ".env"), `COFFEE_SHOP_GHOST_ADMIN_KEY=${KEY}\n`);
  return {
    connector: "ghost",
    site: { business: "coffee-shop", platform: "ghost", address: "https://coffee-shop.example", keyName: "COFFEE_SHOP_GHOST_ADMIN_KEY" },
    keysFile: join(folder, ".env"),
    email: "owner@coffee-shop.example",
    field: "next",
    label: "ghost coffee-shop member owner@coffee-shop.example field next",
  };
}

async function restPlace(): Promise<RestPlace> {
  const folder = await mkdtemp(join(tmpdir(), "dfm-store-"));
  await writeFile(join(folder, ".env"), `COFFEE_SHOP_STORE_KEY=${FAKE_REST_KEY}\n`);
  return {
    connector: "rest",
    address: FAKE_REST_ADDRESS,
    keyName: "COFFEE_SHOP_STORE_KEY",
    keysFile: join(folder, ".env"),
    kind: "ledger",
    id: "coffee-shop",
    label: `rest ${FAKE_REST_ADDRESS} ledger coffee-shop`,
  };
}

describe("readObject and writeObject", () => {
  it("read a file that is not there as empty, with the version none", async () => {
    const folder = await mkdtemp(join(tmpdir(), "dfm-store-"));
    const read = await readObject({ connector: "file", path: join(folder, "ledger.txt"), label: "file" });
    expect(read).toMatchObject({ ok: true, text: "", version: "none" });
  });

  it("write a file and read it back with its version", async () => {
    const folder = await mkdtemp(join(tmpdir(), "dfm-store-"));
    const place = { connector: "file" as const, path: join(folder, "ledger.txt"), label: "file" };
    const before = await readObject(place);
    if (!before.ok) throw new Error(before.problem);
    await writeObject(place, before.found, "goal: 100\n");
    expect(await readObject(place)).toMatchObject({ ok: true, text: "goal: 100\n", version: await versionOf("goal: 100\n") });
  });

  it("read and write a member's field through Ghost", async () => {
    const ghost = fakeGhostMembers({ members: [{ id: "m1", email: "owner@coffee-shop.example", custom: { next: "goal: 100" } }] });
    const place = await ghostPlace();
    const before = await readObject(place, ghost.fetch);
    expect(before).toMatchObject({ ok: true, text: "goal: 100", found: { connector: "ghost", memberId: "m1" } });
    if (!before.ok) throw new Error(before.problem);
    expect(await writeObject(place, before.found, "goal: 120", ghost.fetch)).toEqual({ ok: true });
    expect(ghost.members[0].custom.next).toBe("goal: 120");
  });

  it("remove a file: it is gone and reads as none", async () => {
    const folder = await mkdtemp(join(tmpdir(), "dfm-store-"));
    const place = { connector: "file" as const, path: join(folder, "ledger.txt"), label: "file" };
    await writeFile(join(folder, "ledger.txt"), "goal: 100\n");
    const before = await readObject(place);
    if (!before.ok) throw new Error(before.problem);
    expect(await removeObject(place, before.found)).toEqual({ ok: true });
    expect(await readObject(place)).toMatchObject({ ok: true, text: "", version: "none" });
  });

  it("remove a member's field: it is set to null and every other field is kept", async () => {
    const ghost = fakeGhostMembers({ members: [{ id: "m1", email: "owner@coffee-shop.example", custom: { next: "goal: 100", context: "kept" } }] });
    const place = await ghostPlace();
    const before = await readObject(place, ghost.fetch);
    if (!before.ok) throw new Error(before.problem);
    expect(await removeObject(place, before.found, ghost.fetch)).toEqual({ ok: true });
    expect(ghost.members[0].custom).toEqual({ next: null, context: "kept" });
  });

  it("names a missing key by its variable, never a value", async () => {
    const ghost = fakeGhostMembers();
    const place = { ...(await ghostPlace()), site: { ...(await ghostPlace()).site, keyName: "NOT_THERE" } };
    const read = await readObject(place, ghost.fetch);
    expect(read.ok).toBe(false);
    if (!read.ok) {
      expect(read.problem).toContain("NOT_THERE");
      expect(read.problem).not.toContain("0123456789abcdef");
    }
  });

  it("read and write an object in a rest store at the store's own version", async () => {
    const store = fakeRestStore({ limit: 800, objects: [{ kind: "ledger", id: "coffee-shop", body: "goal: 100\n" }] });
    const place = await restPlace();
    const before = await readObject(place, store.fetch);
    expect(before).toMatchObject({ ok: true, text: "goal: 100\n", version: "v1", limit: 800 });
    if (!before.ok) throw new Error(before.problem);
    expect(await writeObject(place, before.found, "goal: 120\n", store.fetch)).toEqual({ ok: true });
    expect(await readObject(place, store.fetch)).toMatchObject({ ok: true, text: "goal: 120\n", version: "v2" });
  });

  it("says moved when a rest object changed between the read and the write", async () => {
    const store = fakeRestStore({ objects: [{ kind: "ledger", id: "coffee-shop", body: "goal: 100\n" }] });
    const place = await restPlace();
    const before = await readObject(place, store.fetch);
    if (!before.ok) throw new Error(before.problem);
    store.edit("ledger", "coffee-shop", "the owner's own edit\n");
    expect(await writeObject(place, before.found, "goal: 120\n", store.fetch)).toEqual({
      ok: false,
      moved: true,
      problem: "The ledger coffee-shop changed in the store since it was read. Nothing was written.",
    });
    expect(store.objects[0].body).toBe("the owner's own edit\n");
  });

  it("names a missing rest key by its variable", async () => {
    const store = fakeRestStore();
    const place = { ...(await restPlace()), keyName: "NOT_THERE" };
    const read = await readObject(place, store.fetch);
    expect(read).toEqual({ ok: false, problem: "No key named NOT_THERE. Add it to the keys file named in settings." });
    expect(store.requests).toEqual([]);
  });
});
