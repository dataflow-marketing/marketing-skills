// The dfm-store rest connector (packages/store) run against this Worker with a local D1 database: the same read
// and write a skill makes, with the Worker in place of a fake.

import { readRest, writeRest } from "@dataflow-marketing/store";
import type { Fetch } from "@dataflow-marketing/store";
import { env, exports } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";
import { COFFEE_SHOP_ID, COFFEE_SHOP_LEDGER, STORE_KEY } from "../fixtures/coffee-shop.ts";

const ADDRESS = "https://store.example";
const LOOKUP = { address: ADDRESS, kind: "ledger", id: COFFEE_SHOP_ID, key: STORE_KEY };

const toWorker: Fetch = (url, init) => exports.default.fetch(new Request(url, init));

beforeEach(async () => {
  await env.DB.exec("DELETE FROM objects");
});

async function readNow() {
  const read = await readRest(LOOKUP, toWorker);
  if (!read.ok) throw new Error(read.problem);
  return read;
}

describe("the rest connector against the starter Worker", () => {
  it("reads a ledger the store does not keep as empty, with the version none and the store's limit", async () => {
    expect(await readRest(LOOKUP, toWorker)).toEqual({ ok: true, text: "", version: "none", limit: Number(env.MAX_BODY_BYTES) });
  });

  it("adds the coffee shop ledger, then changes it at the version read", async () => {
    const added = await writeRest({ ...LOOKUP, readAt: "none", text: COFFEE_SHOP_LEDGER }, toWorker);
    expect(added.ok).toBe(true);
    const first = await readNow();
    expect(first.text).toBe(COFFEE_SHOP_LEDGER);

    const changed = `${COFFEE_SHOP_LEDGER}2026-12-07 open the cafe: done\n`;
    const written = await writeRest({ ...LOOKUP, readAt: first.version, text: changed }, toWorker);
    expect(written).toMatchObject({ ok: true });
    const second = await readNow();
    expect(second.text).toBe(changed);
    expect(second.version).not.toBe(first.version);
  });

  it("says moved when someone changed the ledger since it was read: nothing is written", async () => {
    await writeRest({ ...LOOKUP, readAt: "none", text: COFFEE_SHOP_LEDGER }, toWorker);
    const seen = await readNow();
    await writeRest({ ...LOOKUP, readAt: seen.version, text: "the owner's own edit\n" }, toWorker);

    expect(await writeRest({ ...LOOKUP, readAt: seen.version, text: "a skill's change\n" }, toWorker)).toEqual({ ok: false, moved: true });
    expect((await readNow()).text).toBe("the owner's own edit\n");
  });

  it("names a refused key", async () => {
    const read = await readRest({ ...LOOKUP, key: "not-the-store-key" }, toWorker);
    expect(read).toMatchObject({ ok: false });
    if (!read.ok) {
      expect(read.problem).toContain("refused the key (401)");
    }
  });
});
