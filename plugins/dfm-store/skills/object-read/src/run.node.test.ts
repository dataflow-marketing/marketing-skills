// object-read's dist/run.js, run with Node alone against the fake Ghost: no real Ghost is ever called.

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LEDGER, coffeeShopFolder, coffeeShopRestFolder } from "../../../fixtures/coffee-shop.ts";
import { runScript } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));

function objectRead(folder: string, ...more: string[]) {
  const args = ["--object", "ledger", "--business", "coffee-shop", "--settings", "settings.txt", ...more];
  return runScript(SCRIPT, args, { cwd: folder, fakeGhostFolder: folder });
}

describe("object-read", () => {
  it("reads the ledger from the member's field with its version", async () => {
    const folder = await coffeeShopFolder();
    const ran = await objectRead(folder);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("where: ghost coffee-shop member owner@coffee-shop.example field next");
    expect(ran.stdout).toMatch(/version: [0-9a-f]{64}/);
    expect(ran.stdout).toContain("goal: 100 regulars");
  });

  it("saves the text to a new file with --out", async () => {
    const folder = await coffeeShopFolder();
    const ran = await objectRead(folder, "--out", "ledger-copy.txt");
    expect(ran.code).toBe(0);
    expect(await readFile(join(folder, "ledger-copy.txt"), "utf8")).toBe(LEDGER);
  });

  it("never replaces a file with --out", async () => {
    const folder = await coffeeShopFolder();
    await writeFile(join(folder, "ledger-copy.txt"), "mine");
    const ran = await objectRead(folder, "--out", "ledger-copy.txt");
    expect(ran.code).toBe(2);
    expect(await readFile(join(folder, "ledger-copy.txt"), "utf8")).toBe("mine");
  });

  it("reads an object with no binding from the working folder", async () => {
    const folder = await coffeeShopFolder();
    await writeFile(join(folder, "profile.txt"), "who: the owner\n");
    const ran = await runScript(SCRIPT, ["--object", "profile", "--business", "coffee-shop", "--settings", "settings.txt"], { cwd: folder });
    expect(ran.stdout).toContain("where: file profile.txt (no binding: the working folder)");
    expect(ran.stdout).toContain("who: the owner");
  });

  it("says when the Ghost has no member fields", async () => {
    const folder = await coffeeShopFolder();
    const args = ["--object", "ledger", "--business", "coffee-shop", "--settings", "settings.txt"];
    const ran = await runScript(SCRIPT, args, { cwd: folder, fakeGhostFolder: folder, oldGhost: true });
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("has no member custom fields");
  });

  it("never prints the key", async () => {
    const folder = await coffeeShopFolder();
    const ran = await objectRead(folder);
    expect(`${ran.stdout}${ran.stderr}`).not.toContain("0123456789abcdef0123456789abcdef");
  });
});

describe("object-read on a rest store", () => {
  it("reads the ledger with the store's own version", async () => {
    const folder = await coffeeShopRestFolder();
    const ran = await objectRead(folder);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("where: rest https://store.coffee-shop.example ledger coffee-shop");
    expect(ran.stdout).toContain("version: v1");
    expect(ran.stdout).toContain("goal: 100 regulars");
  });

  it("reads an object the store does not keep as empty", async () => {
    const folder = await coffeeShopRestFolder(null);
    const ran = await objectRead(folder);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("version: none");
  });
});
