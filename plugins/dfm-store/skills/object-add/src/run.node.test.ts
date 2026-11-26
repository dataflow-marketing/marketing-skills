// object-add's dist/run.js, run with Node alone against the fake Ghost: no real Ghost is ever called.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LEDGER, OWNER_EMAIL, coffeeShopFolder } from "../../../fixtures/coffee-shop.ts";
import { runScript } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));
const NEW_LEDGER = "spec 1\ngoal: 50 regulars\n";

function objectAdd(folder: string, ...more: string[]) {
  const args = ["--object", "ledger", "--business", "coffee-shop", "--settings", "settings.txt", "--from", "new.txt", ...more];
  return runScript(SCRIPT, args, { cwd: folder, fakeGhostFolder: folder });
}

async function fieldInGhost(folder: string): Promise<string | null> {
  const saved = JSON.parse(await readFile(join(folder, "fake-ghost-members.json"), "utf8"));
  return saved.members[0].custom.next;
}

async function setFieldInGhost(folder: string, text: string | null): Promise<void> {
  const saved = JSON.parse(await readFile(join(folder, "fake-ghost-members.json"), "utf8"));
  saved.members[0].custom.next = text;
  await writeFile(join(folder, "fake-ghost-members.json"), JSON.stringify(saved));
}

// The coffee shop's owner with an empty next field; a new ledger to add
async function folderWithEmptyField(): Promise<string> {
  const folder = await coffeeShopFolder([{ id: "m1", email: OWNER_EMAIL, custom: { next: null } }]);
  await writeFile(join(folder, "new.txt"), NEW_LEDGER);
  return folder;
}

describe("object-add", () => {
  it("refuses --go with no version", async () => {
    const folder = await folderWithEmptyField();
    const ran = await objectAdd(folder, "--go");
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("--go needs the version the preview showed: --go --version none.");
  });

  it("previews every line it would put in and writes nothing", async () => {
    const folder = await folderWithEmptyField();
    const ran = await objectAdd(folder);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("version: none (empty)");
    expect(ran.stdout).toContain("+ spec 1\n+ goal: 50 regulars");
    expect(ran.stdout.trimEnd().endsWith("--go --version none")).toBe(true);
    expect(await fieldInGhost(folder)).toBeNull();
  });

  it("with --go adds to the empty field, logs and reads back", async () => {
    const folder = await folderWithEmptyField();
    const ran = await objectAdd(folder, "--go", "--version", "none");
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("added and read back");
    expect(ran.stdout).toMatch(/version: [0-9a-f]{64}/);
    expect(await fieldInGhost(folder)).toBe(NEW_LEDGER);

    const log = await readFile(join(folder, "run-log.txt"), "utf8");
    expect(log).toContain(`dfm-store:object-add | ledger coffee-shop added | ghost coffee-shop member ${OWNER_EMAIL} field next`);
    expect(log).toContain("version none");
    expect(log).not.toContain("goal:");
    expect((await readdir(folder)).includes("backups")).toBe(false);
  });

  it("refuses when something is there: that is object-change's job", async () => {
    const folder = await coffeeShopFolder();
    await writeFile(join(folder, "new.txt"), NEW_LEDGER);
    const ran = await objectAdd(folder);
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("is already there (2 lines, version ");
    expect(ran.stderr).toContain("dfm-store:object-change");
    expect((await objectAdd(folder, "--go", "--version", "none")).code).toBe(2);
    expect(await fieldInGhost(folder)).toBe(LEDGER);
  });

  it("stops when something was put there after the preview: nothing is written", async () => {
    const folder = await folderWithEmptyField();
    expect((await objectAdd(folder)).code).toBe(0);
    await setFieldInGhost(folder, "spec 1\ngoal: 70 regulars\n");
    const ran = await objectAdd(folder, "--go", "--version", "none");
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("already there");
    expect(await fieldInGhost(folder)).toBe("spec 1\ngoal: 70 regulars\n");
  });

  it("refuses an empty file and more than a Ghost field holds", async () => {
    const folder = await folderWithEmptyField();
    await writeFile(join(folder, "new.txt"), "\n");
    expect((await objectAdd(folder, "--go", "--version", "none")).stderr).toContain("new.txt is empty");
    await writeFile(join(folder, "new.txt"), "x".repeat(65536));
    const ran = await objectAdd(folder, "--go", "--version", "none");
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("holds 65535 at most");
    expect(await fieldInGhost(folder)).toBeNull();
  });

  it("reads back: 1 before the add, 0 after", async () => {
    const folder = await folderWithEmptyField();
    expect((await objectAdd(folder, "--read-back")).code).toBe(1);
    await objectAdd(folder, "--go", "--version", "none");
    const ran = await objectAdd(folder, "--read-back");
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("is what the file holds");
  });

  it("adds a file in a file store, making its folder", async () => {
    const folder = await coffeeShopFolder(undefined, "store files: file stores/ledgers\nbinding ledger bakery: files bakery.txt\n");
    await writeFile(join(folder, "new.txt"), NEW_LEDGER);
    const args = ["--object", "ledger", "--business", "bakery", "--settings", "settings.txt", "--from", "new.txt", "--go", "--version", "none"];
    const ran = await runScript(SCRIPT, args, { cwd: folder });
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("where: file stores/ledgers/bakery.txt");
    expect(await readFile(join(folder, "stores", "ledgers", "bakery.txt"), "utf8")).toBe(NEW_LEDGER);
  });

  it("never prints the key", async () => {
    const folder = await folderWithEmptyField();
    const ran = await objectAdd(folder, "--go", "--version", "none");
    expect(`${ran.stdout}${ran.stderr}`).not.toContain("0123456789abcdef0123456789abcdef");
  });
});
