import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { COFFEE_SHOP_KEYS } from "../../fixtures/coffee-shop.ts";
import { readKey } from "./read-key.ts";

let folder = "";

beforeAll(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-core-"));
  await writeFile(join(folder, ".env"), COFFEE_SHOP_KEYS);
});

afterAll(async () => {
  await rm(folder, { recursive: true, force: true });
});

describe("readKey", () => {
  it("reads one named key from the keys file", async () => {
    const key = await readKey(join(folder, ".env"), "COFFEE_SHOP_GHOST_ADMIN_KEY");
    expect(key).toBe("example-id:example-secret");
  });
});
