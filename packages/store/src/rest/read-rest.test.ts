import { describe, expect, it } from "vitest";
import { FAKE_REST_ADDRESS, FAKE_REST_KEY, fakeRestStore } from "../../fixtures/fake-rest-store.ts";
import { readRest } from "./read-rest.ts";

const LOOKUP = { address: FAKE_REST_ADDRESS, kind: "ledger", id: "coffee-shop", key: FAKE_REST_KEY };

describe("readRest", () => {
  it("reads an object with the store's own version and its limit", async () => {
    const store = fakeRestStore({ limit: 500, objects: [{ kind: "ledger", id: "coffee-shop", body: "goal: 100\n" }] });
    expect(await readRest(LOOKUP, store.fetch)).toEqual({ ok: true, text: "goal: 100\n", version: "v1", limit: 500 });
  });

  it("reads an object the store does not keep as empty, with the version none", async () => {
    const store = fakeRestStore();
    expect(await readRest(LOOKUP, store.fetch)).toEqual({ ok: true, text: "", version: "none", limit: 1000 });
  });

  it("sends the key as a Bearer key", async () => {
    const store = fakeRestStore();
    await readRest(LOOKUP, store.fetch);
    expect(store.requests[0].headers.Authorization).toBe(`Bearer ${FAKE_REST_KEY}`);
  });

  it("says a wrong key was refused, never the key", async () => {
    const store = fakeRestStore();
    const read = await readRest({ ...LOOKUP, key: "not-the-key" }, store.fetch);
    expect(read.ok).toBe(false);
    if (!read.ok) {
      expect(read.problem).toContain("refused the key (401)");
      expect(read.problem).not.toContain("not-the-key");
    }
  });

  it("refuses an answer with no version", async () => {
    const fetch = async () => new Response(JSON.stringify({ id: "coffee-shop", body: "x" }), { status: 200 });
    const read = await readRest(LOOKUP, fetch);
    expect(read).toEqual({
      ok: false,
      problem: `The store at ${FAKE_REST_ADDRESS} answered without a version and a body. It was asked to read the ledger coffee-shop.`,
    });
  });
});
