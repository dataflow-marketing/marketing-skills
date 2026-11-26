// object-remove's dist/run.js, run with Node alone against the fake Ghost: no real Ghost is ever called.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LEDGER, OWNER_EMAIL, coffeeShopFolder } from "../../../fixtures/coffee-shop.ts";
import { runScript } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));

function objectRemove(folder: string, ...more: string[]) {
  const args = ["--object", "ledger", "--business", "coffee-shop", "--settings", "settings.txt", ...more];
  return runScript(SCRIPT, args, { cwd: folder, fakeGhostFolder: folder });
}

async function savedOwner(folder: string): Promise<{ custom: Record<string, string | null> }> {
  const saved = JSON.parse(await readFile(join(folder, "fake-ghost-members.json"), "utf8"));
  return saved.members[0];
}

async function editInGhost(folder: string, text: string): Promise<void> {
  const saved = JSON.parse(await readFile(join(folder, "fake-ghost-members.json"), "utf8"));
  saved.members[0].custom.next = text;
  await writeFile(join(folder, "fake-ghost-members.json"), JSON.stringify(saved));
}

function versionIn(stdout: string): string {
  return /--go --version (\S+)/.exec(stdout)?.[1] ?? "";
}

describe("object-remove", () => {
  it("previews every line it would take out and removes nothing", async () => {
    const folder = await coffeeShopFolder();
    const ran = await objectRemove(folder);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("would take out all 2 lines, leaving it empty:\n\n- spec 1\n- goal: 100 regulars");
    expect(versionIn(ran.stdout)).toMatch(/^[0-9a-f]{64}$/);
    expect((await savedOwner(folder)).custom.next).toBe(LEDGER);
    expect((await readdir(folder)).includes("backups")).toBe(false);
  });

  it("with the preview's version, backs up, sets the field to null, logs and reads back", async () => {
    const folder = await coffeeShopFolder([{ id: "m1", email: OWNER_EMAIL, custom: { next: LEDGER, context: "kept" } }]);
    const version = versionIn((await objectRemove(folder)).stdout);
    const ran = await objectRemove(folder, "--go", "--version", version);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("removed and read back: it is empty.");
    expect((await savedOwner(folder)).custom).toEqual({ next: null, context: "kept" });

    const backups = await readdir(join(folder, "backups"));
    expect(backups).toHaveLength(1);
    expect(backups[0]).toMatch(/^ledger-coffee-shop-\d{4}-\d{2}-\d{2}-\d{6}\.txt$/);
    expect(await readFile(join(folder, "backups", backups[0]), "utf8")).toBe(LEDGER);
    expect(ran.stdout).toContain(`backup: ${join(folder, "backups", backups[0])}`);

    const log = await readFile(join(folder, "run-log.txt"), "utf8");
    expect(log).toContain(`dfm-store:object-remove | ledger coffee-shop removed | ghost coffee-shop member ${OWNER_EMAIL} field next`);
    expect(log).toContain(`version ${version} backup `);
    expect(log).toContain("version none");
    expect(log).not.toContain("goal:");
  });

  it("stops when someone changed the field after the preview: nothing is removed", async () => {
    const folder = await coffeeShopFolder();
    const version = versionIn((await objectRemove(folder)).stdout);
    await editInGhost(folder, "spec 1\ngoal: 110 regulars\n");
    const ran = await objectRemove(folder, "--go", "--version", version);
    expect(ran.code).toBe(2);
    expect(ran.stdout).toContain("changed since it was read. Nothing was removed.");
    expect(ran.stdout).toContain("goal: 110 regulars");
    expect((await savedOwner(folder)).custom.next).toBe("spec 1\ngoal: 110 regulars\n");
    expect((await readdir(folder)).includes("backups")).toBe(false);
  });

  it("refuses --go with no version", async () => {
    const folder = await coffeeShopFolder();
    const ran = await objectRemove(folder, "--go");
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("--go needs the version the preview showed");
    expect((await savedOwner(folder)).custom.next).toBe(LEDGER);
  });

  it("has nothing to remove from an empty field", async () => {
    const folder = await coffeeShopFolder([{ id: "m1", email: OWNER_EMAIL, custom: { next: null } }]);
    const ran = await objectRemove(folder, "--go", "--version", "none");
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("nothing to remove, it is empty.");
  });

  it("reads back: 1 while it is there, 0 once it is empty", async () => {
    const folder = await coffeeShopFolder();
    expect((await objectRemove(folder, "--read-back")).code).toBe(1);
    const version = versionIn((await objectRemove(folder)).stdout);
    await objectRemove(folder, "--go", "--version", version);
    expect((await objectRemove(folder, "--read-back")).code).toBe(0);
  });

  it("removes a file in the working folder after backing it up", async () => {
    const folder = await coffeeShopFolder();
    await writeFile(join(folder, "profile.txt"), "who: the owner\n");
    const args = ["--object", "profile", "--business", "coffee-shop", "--settings", "settings.txt"];
    const version = versionIn((await runScript(SCRIPT, args, { cwd: folder })).stdout);
    const ran = await runScript(SCRIPT, [...args, "--go", "--version", version], { cwd: folder });
    expect(ran.code).toBe(0);
    expect((await readdir(folder)).includes("profile.txt")).toBe(false);
    const backups = await readdir(join(folder, "backups"));
    expect(await readFile(join(folder, "backups", backups[0]), "utf8")).toBe("who: the owner\n");
  });

  it("never prints the key", async () => {
    const folder = await coffeeShopFolder();
    const version = versionIn((await objectRemove(folder)).stdout);
    const ran = await objectRemove(folder, "--go", "--version", version);
    expect(`${ran.stdout}${ran.stderr}`).not.toContain("0123456789abcdef0123456789abcdef");
  });
});
