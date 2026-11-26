import { describe, expect, it } from "vitest";
import { FAKE_REST_ADDRESS, FAKE_REST_KEY, fakeRestStore } from "../../fixtures/fake-rest-store.ts";
import { removeRest } from "./remove-rest.ts";

const REMOVAL = { address: FAKE_REST_ADDRESS, kind: "ledger", id: "coffee-shop", key: FAKE_REST_KEY };
const KEPT = [{ kind: "ledger", id: "coffee-shop", body: "goal: 100\n" }];

describe("removeRest", () => {
  it("removes the object with If-Match at the version it was read at", async () => {
    const store = fakeRestStore({ objects: KEPT });
    expect(await removeRest({ ...REMOVAL, readAt: "v1" }, store.fetch)).toEqual({ ok: true });
    expect(store.requests[0]).toMatchObject({ method: "DELETE", headers: { "If-Match": "v1" } });
    expect(store.objects).toEqual([]);
  });

  it("says moved when someone changed it since it was read; nothing is removed", async () => {
    const store = fakeRestStore({ objects: KEPT });
    store.edit("ledger", "coffee-shop", "the owner's own edit\n");
    expect(await removeRest({ ...REMOVAL, readAt: "v1" }, store.fetch)).toEqual({ ok: false, moved: true });
    expect(store.objects[0].body).toBe("the owner's own edit\n");
  });

  it("says moved when it was removed since it was read", async () => {
    const store = fakeRestStore();
    expect(await removeRest({ ...REMOVAL, readAt: "v1" }, store.fetch)).toEqual({ ok: false, moved: true });
  });

  it("names the store's answer when the key is refused", async () => {
    const store = fakeRestStore({ objects: KEPT });
    const removed = await removeRest({ ...REMOVAL, key: "wrong", readAt: "v1" }, store.fetch);
    expect(removed.ok).toBe(false);
    expect(removed.ok === false && !removed.moved && removed.problem).toContain("401");
  });
});
