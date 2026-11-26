// object-change's dist/run.js, run with Node alone against the fake Ghost: no real Ghost is ever called.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LEDGER, OWNER_EMAIL, coffeeShopFolder, coffeeShopRestFolder } from "../../../fixtures/coffee-shop.ts";
import { runScript } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));
const CHANGED = "spec 1\ngoal: 120 regulars\n";

function objectChange(folder: string, ...more: string[]) {
  const args = ["--object", "ledger", "--business", "coffee-shop", "--settings", "settings.txt", "--from", "new.txt", ...more];
  return runScript(SCRIPT, args, { cwd: folder, fakeGhostFolder: folder });
}

async function fieldInGhost(folder: string): Promise<string | null> {
  const saved = JSON.parse(await readFile(join(folder, "fake-ghost-members.json"), "utf8"));
  return saved.members[0].custom.next;
}

async function editInGhost(folder: string, text: string): Promise<void> {
  const saved = JSON.parse(await readFile(join(folder, "fake-ghost-members.json"), "utf8"));
  saved.members[0].custom.next = text;
  await writeFile(join(folder, "fake-ghost-members.json"), JSON.stringify(saved));
}

function versionIn(stdout: string): string {
  return /--go --version (\S+)/.exec(stdout)?.[1] ?? "";
}

async function folderWithChange(): Promise<string> {
  const folder = await coffeeShopFolder();
  await writeFile(join(folder, "new.txt"), CHANGED);
  return folder;
}

describe("object-change", () => {
  it("previews the change and its version and writes nothing", async () => {
    const folder = await folderWithChange();
    const ran = await objectChange(folder);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("- goal: 100 regulars\n+ goal: 120 regulars");
    expect(versionIn(ran.stdout)).toMatch(/^[0-9a-f]{64}$/);
    expect(await fieldInGhost(folder)).toBe(LEDGER);
  });

  it("with the preview's version, backs up, writes, logs and reads back", async () => {
    const folder = await folderWithChange();
    const version = versionIn((await objectChange(folder)).stdout);
    const ran = await objectChange(folder, "--go", "--version", version);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("changed and read back");
    expect(await fieldInGhost(folder)).toBe(CHANGED);

    const backups = await readdir(join(folder, "backups"));
    expect(backups).toHaveLength(1);
    expect(backups[0]).toMatch(/^ledger-coffee-shop-\d{4}-\d{2}-\d{2}-\d{6}\.txt$/);
    expect(await readFile(join(folder, "backups", backups[0]), "utf8")).toBe(LEDGER);

    const log = await readFile(join(folder, "run-log.txt"), "utf8");
    expect(log).toContain(`dfm-store:object-change | ledger coffee-shop changed | ghost coffee-shop member ${OWNER_EMAIL} field next`);
    expect(log).not.toContain("goal:");
  });

  it("stops when someone changed the field after the preview: nothing is written", async () => {
    const folder = await folderWithChange();
    const version = versionIn((await objectChange(folder)).stdout);
    await editInGhost(folder, "spec 1\ngoal: 110 regulars\n");
    const ran = await objectChange(folder, "--go", "--version", version);
    expect(ran.code).toBe(2);
    expect(ran.stdout).toContain("changed since it was read. Nothing was written.");
    expect(ran.stdout).toContain("- goal: 110 regulars\n+ goal: 120 regulars");
    expect(await fieldInGhost(folder)).toBe("spec 1\ngoal: 110 regulars\n");
  });

  it("refuses --go with no version", async () => {
    const folder = await folderWithChange();
    const ran = await objectChange(folder, "--go");
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("--go needs the version the preview showed");
    expect(await fieldInGhost(folder)).toBe(LEDGER);
  });

  it("has nothing to change when the file holds what is there", async () => {
    const folder = await coffeeShopFolder();
    await writeFile(join(folder, "new.txt"), LEDGER);
    const ran = await objectChange(folder);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("nothing to change");
  });

  it("refuses more than a Ghost field holds", async () => {
    const folder = await coffeeShopFolder();
    await writeFile(join(folder, "new.txt"), "x".repeat(65536));
    const ran = await objectChange(folder);
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("holds 65535 at most");
  });

  it("reads back: 0 when the object is what the file holds, 1 when not", async () => {
    const folder = await folderWithChange();
    expect((await objectChange(folder, "--read-back")).code).toBe(1);
    const version = versionIn((await objectChange(folder)).stdout);
    await objectChange(folder, "--go", "--version", version);
    expect((await objectChange(folder, "--read-back")).code).toBe(0);
  });

  it("writes a file in the working folder with no backup when it was empty", async () => {
    const folder = await coffeeShopFolder();
    await writeFile(join(folder, "new.txt"), "who: the owner\n");
    const args = ["--object", "profile", "--business", "coffee-shop", "--settings", "settings.txt", "--from", "new.txt"];
    const version = versionIn((await runScript(SCRIPT, args, { cwd: folder })).stdout);
    expect(version).toBe("none");
    const ran = await runScript(SCRIPT, [...args, "--go", "--version", version], { cwd: folder });
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("backup: none (it was empty)");
    expect(await readFile(join(folder, "profile.txt"), "utf8")).toBe("who: the owner\n");
  });

  it("never prints the key", async () => {
    const folder = await folderWithChange();
    const version = versionIn((await objectChange(folder)).stdout);
    const ran = await objectChange(folder, "--go", "--version", version);
    expect(`${ran.stdout}${ran.stderr}`).not.toContain("0123456789abcdef0123456789abcdef");
  });
});

async function objectInRest(folder: string): Promise<{ version: string; body: string } | undefined> {
  const saved = JSON.parse(await readFile(join(folder, "fake-rest-objects.json"), "utf8"));
  return saved.objects[0];
}

async function restFolderWithChange(ledger: string | null = LEDGER, limit = 1000): Promise<string> {
  const folder = await coffeeShopRestFolder(ledger, limit);
  await writeFile(join(folder, "new.txt"), CHANGED);
  return folder;
}

describe("object-change on a rest store", () => {
  it("previews with the store's own version and writes nothing", async () => {
    const folder = await restFolderWithChange();
    const ran = await objectChange(folder);
    expect(ran.code).toBe(0);
    expect(versionIn(ran.stdout)).toBe("v1");
    expect(ran.stdout).toContain("where: rest https://store.coffee-shop.example ledger coffee-shop");
    expect(await objectInRest(folder)).toMatchObject({ version: "v1", body: LEDGER });
  });

  it("with the preview's version, backs up, changes it with If-Match and reads back the new version", async () => {
    const folder = await restFolderWithChange();
    const ran = await objectChange(folder, "--go", "--version", "v1");
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("changed and read back");
    expect(ran.stdout).toContain("version: v2");
    expect(await objectInRest(folder)).toMatchObject({ version: "v2", body: CHANGED });
    expect(await readdir(join(folder, "backups"))).toHaveLength(1);

    const requests = (await readFile(join(folder, "fake-ghost-requests.jsonl"), "utf8")).trim().split("\n").map((line) => JSON.parse(line));
    const put = requests.find((each) => each.method === "PUT");
    expect(put.headers["If-Match"]).toBe("v1");
  });

  it("adds an object the store does not keep yet", async () => {
    const folder = await restFolderWithChange(null);
    const version = versionIn((await objectChange(folder)).stdout);
    expect(version).toBe("none");
    const ran = await objectChange(folder, "--go", "--version", version);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("backup: none (it was empty)");
    expect(await objectInRest(folder)).toMatchObject({ version: "v1", body: CHANGED });
  });

  it("stops on a 409 when someone changed it between the read and the write: nothing is written", async () => {
    const folder = await restFolderWithChange();
    const ran = await runScript(
      SCRIPT,
      ["--object", "ledger", "--business", "coffee-shop", "--settings", "settings.txt", "--from", "new.txt", "--go", "--version", "v1"],
      { cwd: folder, fakeGhostFolder: folder, restEditOnWrite: "spec 1\ngoal: 110 regulars\n" },
    );
    expect(ran.code).toBe(2);
    expect(ran.stdout).toContain("changed since it was read. Nothing was written.");
    expect(ran.stdout).toContain("- goal: 110 regulars\n+ goal: 120 regulars");
    expect(await objectInRest(folder)).toMatchObject({ version: "v2", body: "spec 1\ngoal: 110 regulars\n" });
  });

  it("refuses more than the store declares it takes", async () => {
    const folder = await restFolderWithChange(LEDGER, 10);
    const ran = await objectChange(folder);
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("holds 10 at most");
  });

  it("never prints the key", async () => {
    const folder = await restFolderWithChange();
    const ran = await objectChange(folder, "--go", "--version", "v1");
    expect(`${ran.stdout}${ran.stderr}`).not.toContain("made-up-store-key");
  });
});
