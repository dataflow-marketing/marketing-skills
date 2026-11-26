// The store REST contract from spec/store.md, run against the Worker with a local D1 database.
// The coffee shop ledger is the body kept.

import { env } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";
import { COFFEE_SHOP_ID, COFFEE_SHOP_LEDGER } from "../fixtures/coffee-shop.ts";
import { send } from "../fixtures/send.ts";

type Written = { id: string; version: string };
type Read = { id: string; version: string; body: string };
type Summary = { id: string; version: string; updated: string };

async function addLedger(): Promise<Written> {
  const response = await send("/objects/ledger", {
    method: "POST",
    json: { id: COFFEE_SHOP_ID, body: COFFEE_SHOP_LEDGER },
  });
  expect(response.status).toBe(201);
  return response.json<Written>();
}

async function readLedger(): Promise<Read> {
  const response = await send(`/objects/ledger/${COFFEE_SHOP_ID}`);
  expect(response.status).toBe(200);
  return response.json<Read>();
}

beforeEach(async () => {
  await env.DB.exec("DELETE FROM objects");
});

describe("add and read", () => {
  it("adds the coffee shop ledger and reads it back word for word", async () => {
    const added = await addLedger();
    const read = await readLedger();

    expect(read.id).toBe(COFFEE_SHOP_ID);
    expect(read.version).toBe(added.version);
    expect(read.body).toBe(COFFEE_SHOP_LEDGER);
  });

  it("refuses to add an object that is already kept", async () => {
    await addLedger();
    const again = await send("/objects/ledger", {
      method: "POST",
      json: { id: COFFEE_SHOP_ID, body: "spec 1\n" },
    });

    expect(again.status).toBe(409);
    expect((await readLedger()).body).toBe(COFFEE_SHOP_LEDGER);
  });

  it("answers 404 for an object that is not kept", async () => {
    const response = await send("/objects/ledger/tea-shop");
    expect(response.status).toBe(404);
  });

  it("answers 400 for a kind the store does not know", async () => {
    const response = await send("/objects/recipe");
    expect(response.status).toBe(400);
  });

  it("answers 400 for an id that is not a business's name", async () => {
    const response = await send("/objects/ledger", {
      method: "POST",
      json: { id: "Coffee Shop", body: COFFEE_SHOP_LEDGER },
    });
    expect(response.status).toBe(400);
  });

  it("answers 404 for a path outside the contract", async () => {
    const response = await send("/ledgers");
    expect(response.status).toBe(404);
  });

  it("answers 400 for a body that is not JSON", async () => {
    const response = await send("/objects/ledger", {
      method: "POST",
      json: undefined,
    });
    expect(response.status).toBe(400);
  });
});

describe("list", () => {
  it("lists ids and versions of one kind, never bodies", async () => {
    const added = await addLedger();
    await send("/objects/profile", { method: "POST", json: { id: COFFEE_SHOP_ID, body: "a profile" } });

    const response = await send("/objects/ledger");
    const listed = await response.json<Summary[]>();

    expect(response.status).toBe(200);
    expect(listed).toHaveLength(1);
    expect(listed[0]?.id).toBe(COFFEE_SHOP_ID);
    expect(listed[0]?.version).toBe(added.version);
    expect(listed[0]?.updated).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(listed[0]).not.toHaveProperty("body");
  });

  it("lists nothing when nothing of that kind is kept", async () => {
    const response = await send("/objects/forecast");
    expect(await response.json()).toEqual([]);
  });
});

describe("change", () => {
  it("changes the ledger with the version read and gives a new version", async () => {
    const added = await addLedger();
    const changed = `${COFFEE_SHOP_LEDGER}2026-12-07 open the cafe: done\n`;

    const response = await send(`/objects/ledger/${COFFEE_SHOP_ID}`, {
      method: "PUT",
      ifMatch: added.version,
      json: { body: changed },
    });
    const written = await response.json<Written>();
    const read = await readLedger();

    expect(response.status).toBe(200);
    expect(written.version).not.toBe(added.version);
    expect(read.version).toBe(written.version);
    expect(read.body).toBe(changed);
  });

  it("answers 409 on a stale version and writes nothing", async () => {
    const added = await addLedger();
    const first = await send(`/objects/ledger/${COFFEE_SHOP_ID}`, {
      method: "PUT",
      ifMatch: added.version,
      json: { body: "the owner's own edit" },
    });
    expect(first.status).toBe(200);

    const stale = await send(`/objects/ledger/${COFFEE_SHOP_ID}`, {
      method: "PUT",
      ifMatch: added.version,
      json: { body: "a skill's write from the old version" },
    });

    expect(stale.status).toBe(409);
    expect((await readLedger()).body).toBe("the owner's own edit");
  });

  it("answers 428 without If-Match and writes nothing", async () => {
    await addLedger();
    const response = await send(`/objects/ledger/${COFFEE_SHOP_ID}`, {
      method: "PUT",
      json: { body: "no version sent" },
    });

    expect(response.status).toBe(428);
    expect((await readLedger()).body).toBe(COFFEE_SHOP_LEDGER);
  });

  it("answers 404 when changing an object that is not kept", async () => {
    const response = await send("/objects/ledger/tea-shop", {
      method: "PUT",
      ifMatch: "any-version",
      json: { body: "spec 1\n" },
    });
    expect(response.status).toBe(404);
  });
});

describe("remove", () => {
  it("removes the ledger with the version read", async () => {
    const added = await addLedger();
    const response = await send(`/objects/ledger/${COFFEE_SHOP_ID}`, {
      method: "DELETE",
      ifMatch: added.version,
    });
    const after = await send(`/objects/ledger/${COFFEE_SHOP_ID}`);

    expect(response.status).toBe(204);
    expect(after.status).toBe(404);
  });

  it("answers 409 on a stale version and keeps the object", async () => {
    await addLedger();
    const response = await send(`/objects/ledger/${COFFEE_SHOP_ID}`, {
      method: "DELETE",
      ifMatch: "an-old-version",
    });

    expect(response.status).toBe(409);
    expect((await readLedger()).body).toBe(COFFEE_SHOP_LEDGER);
  });

  it("answers 428 without If-Match and keeps the object", async () => {
    await addLedger();
    const response = await send(`/objects/ledger/${COFFEE_SHOP_ID}`, { method: "DELETE" });

    expect(response.status).toBe(428);
    expect((await readLedger()).body).toBe(COFFEE_SHOP_LEDGER);
  });
});

describe("the key", () => {
  it("answers 401 without the key", async () => {
    const response = await send(`/objects/ledger`, { key: null });
    expect(response.status).toBe(401);
  });

  it("answers 401 with the wrong key and writes nothing", async () => {
    const response = await send("/objects/ledger", {
      method: "POST",
      key: "not-the-store-key",
      json: { id: COFFEE_SHOP_ID, body: COFFEE_SHOP_LEDGER },
    });
    const listed = await send("/objects/ledger");

    expect(response.status).toBe(401);
    expect(await listed.json()).toEqual([]);
  });

  it("answers 401 on /limits without the key", async () => {
    const response = await send("/limits", { key: null });
    expect(response.status).toBe(401);
  });
});

describe("the size limit", () => {
  async function limit(): Promise<number> {
    const response = await send("/limits");
    const limits = await response.json<{ bytes: number }>();
    return limits.bytes;
  }

  it("declares its limit from MAX_BODY_BYTES", async () => {
    expect(await limit()).toBe(Number(env.MAX_BODY_BYTES));
  });

  it("answers 413 when adding a body over the limit and writes nothing", async () => {
    const tooLarge = COFFEE_SHOP_LEDGER.repeat(Math.ceil((await limit()) / COFFEE_SHOP_LEDGER.length) + 1);
    const response = await send("/objects/ledger", {
      method: "POST",
      json: { id: COFFEE_SHOP_ID, body: tooLarge },
    });
    const listed = await send("/objects/ledger");

    expect(response.status).toBe(413);
    expect(await listed.json()).toEqual([]);
  });

  it("answers 413 when changing to a body over the limit and keeps the ledger", async () => {
    const added = await addLedger();
    const tooLarge = "x".repeat((await limit()) + 1);
    const response = await send(`/objects/ledger/${COFFEE_SHOP_ID}`, {
      method: "PUT",
      ifMatch: added.version,
      json: { body: tooLarge },
    });

    expect(response.status).toBe(413);
    expect((await readLedger()).body).toBe(COFFEE_SHOP_LEDGER);
  });

  it("takes a body exactly at the limit", async () => {
    const atLimit = "x".repeat(await limit());
    const response = await send("/objects/ledger", {
      method: "POST",
      json: { id: COFFEE_SHOP_ID, body: atLimit },
    });
    expect(response.status).toBe(201);
  });
});
