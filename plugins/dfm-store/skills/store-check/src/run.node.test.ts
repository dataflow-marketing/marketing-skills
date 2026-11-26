// store-check's dist/run.js, run with Node alone against the fake Ghost: no real Ghost is ever called.

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { coffeeShopFolder, coffeeShopRestFolder } from "../../../fixtures/coffee-shop.ts";
import { runScript } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));

function storeCheck(folder: string, oldGhost = false) {
  return runScript(SCRIPT, ["--settings", "settings.txt"], { cwd: folder, fakeGhostFolder: folder, oldGhost });
}

describe("store-check", () => {
  it("reads each binding and names the backups folder", async () => {
    const folder = await coffeeShopFolder();
    const ran = await storeCheck(folder);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("ok ledger coffee-shop: ghost coffee-shop member owner@coffee-shop.example field next (2 lines");
    expect(ran.stdout).toContain(`backups: ${join(folder, "backups")}`);
  });

  it("names a member that is not there", async () => {
    const folder = await coffeeShopFolder([]);
    const ran = await storeCheck(folder);
    expect(ran.code).toBe(1);
    expect(ran.stdout).toContain("problem ledger coffee-shop: No member on https://coffee-shop.example has the email owner@coffee-shop.example.");
  });

  it("names a Ghost too old for member fields", async () => {
    const folder = await coffeeShopFolder();
    const ran = await storeCheck(folder, true);
    expect(ran.code).toBe(1);
    expect(ran.stdout).toContain("has no member custom fields");
  });

  it("only reads: Ghost is asked with GET alone", async () => {
    const folder = await coffeeShopFolder();
    await storeCheck(folder);
    const requests = (await readFile(join(folder, "fake-ghost-requests.jsonl"), "utf8")).trim().split("\n").map((line) => JSON.parse(line));
    expect(requests.every((request) => request.method === "GET")).toBe(true);
  });
});

describe("store-check on a rest store", () => {
  it("reads the binding with the store's key", async () => {
    const folder = await coffeeShopRestFolder();
    const ran = await storeCheck(folder);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("ok ledger coffee-shop: rest https://store.coffee-shop.example ledger coffee-shop (2 lines, version v1)");
  });

  it("names a key the store refuses, never the key", async () => {
    const folder = await coffeeShopRestFolder();
    await writeFile(join(folder, ".env"), "COFFEE_SHOP_STORE_KEY=not-the-store-key\n");
    const ran = await storeCheck(folder);
    expect(ran.code).toBe(1);
    expect(ran.stdout).toContain("refused the key (401)");
    expect(ran.stdout).not.toContain("not-the-store-key");
  });
});
