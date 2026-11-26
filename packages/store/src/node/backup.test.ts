import { mkdtemp, readFile, stat } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { backupsFolder, writeBackup } from "./backup.ts";

describe("backupsFolder", () => {
  it("is backups/ beside the settings file by default", () => {
    expect(backupsFolder("/home/x/dfm/settings.txt", undefined)).toBe("/home/x/dfm/backups");
  });

  it("reads a relative backups line from the settings file's folder and ~ from home", () => {
    expect(backupsFolder("/home/x/dfm/settings.txt", "old")).toBe("/home/x/dfm/old");
    expect(backupsFolder("/home/x/dfm/settings.txt", "~/b")).toBe(join(homedir(), "b"));
  });
});

describe("writeBackup", () => {
  it("writes the copy for the owner only", async () => {
    const folder = join(await mkdtemp(join(tmpdir(), "dfm-backup-")), "backups");
    const path = await writeBackup(folder, "ledger-acme-2026-11-26-210509.txt", "goal: 100\n");
    expect(await readFile(path, "utf8")).toBe("goal: 100\n");
    expect((await stat(path)).mode & 0o777).toBe(0o600);
    expect((await stat(folder)).mode & 0o777).toBe(0o700);
  });

  it("never overwrites a backup of the same name", async () => {
    const folder = await mkdtemp(join(tmpdir(), "dfm-backup-"));
    const first = await writeBackup(folder, "ledger-acme-1.txt", "one");
    const second = await writeBackup(folder, "ledger-acme-1.txt", "two");
    expect(second).toBe(join(folder, "ledger-acme-1-2.txt"));
    expect(await readFile(first, "utf8")).toBe("one");
  });
});
