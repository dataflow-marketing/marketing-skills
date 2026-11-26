import { describe, expect, it } from "vitest";
import { FAKE_REST_ADDRESS, FAKE_REST_KEY, fakeRestStore } from "../../fixtures/fake-rest-store.ts";
import { writeRest } from "./write-rest.ts";

const CHANGE = { address: FAKE_REST_ADDRESS, kind: "ledger", id: "coffee-shop", key: FAKE_REST_KEY };
const KEPT = [{ kind: "ledger", id: "coffee-shop", body: "goal: 100\n" }];

describe("writeRest", () => {
  it("changes an object with If-Match at the version it was read at", async () => {
    const store = fakeRestStore({ objects: KEPT });
    expect(await writeRest({ ...CHANGE, readAt: "v1", text: "goal: 120\n" }, store.fetch)).toEqual({ ok: true, version: "v2" });
    expect(store.requests[0]).toMatchObject({ method: "PUT", headers: { "If-Match": "v1" } });
    expect(store.objects[0].body).toBe("goal: 120\n");
  });

  it("adds an object that was read as missing", async () => {
    const store = fakeRestStore();
    expect(await writeRest({ ...CHANGE, readAt: "none", text: "goal: 100\n" }, store.fetch)).toEqual({ ok: true, version: "v1" });
    expect(store.requests[0]).toMatchObject({ method: "POST", url: `${FAKE_REST_ADDRESS}/objects/ledger` });
    expect(JSON.parse(store.requests[0].body ?? "")).toEqual({ id: "coffee-shop", body: "goal: 100\n" });
  });

  it("says moved on a 409, when someone changed it since it was read; nothing is written", async () => {
    const store = fakeRestStore({ objects: KEPT });
    store.edit("ledger", "coffee-shop", "the owner's own edit\n");
    expect(await writeRest({ ...CHANGE, readAt: "v1", text: "goal: 120\n" }, store.fetch)).toEqual({ ok: false, moved: true });
    expect(store.objects[0].body).toBe("the owner's own edit\n");
  });

  it("says moved when an object read as missing was added since", async () => {
    const store = fakeRestStore();
    store.edit("ledger", "coffee-shop", "added by someone else\n");
    expect(await writeRest({ ...CHANGE, readAt: "none", text: "goal: 100\n" }, store.fetch)).toEqual({ ok: false, moved: true });
  });

  it("says moved when the object was removed since it was read", async () => {
    const store = fakeRestStore();
    expect(await writeRest({ ...CHANGE, readAt: "v1", text: "goal: 120\n" }, store.fetch)).toEqual({ ok: false, moved: true });
  });

  it("names any other refusal, never the key", async () => {
    const store = fakeRestStore({ objects: KEPT, limit: 5 });
    const written = await writeRest({ ...CHANGE, readAt: "v1", text: "goal: 120\n" }, store.fetch);
    expect(written).toEqual({
      ok: false,
      moved: false,
      problem: `The store at ${FAKE_REST_ADDRESS} refused the body as larger than it takes (413). It was asked to change the ledger coffee-shop.`,
    });
  });
});
