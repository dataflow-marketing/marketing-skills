// dfm-ledger:weeks-archive's dist/run.js run as Claude runs it.

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { runScript } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));
const LEDGER = ["spec 1", "=== plan ===", "every week new post", "=== done ===", "2026-11-02 new post: done", "2026-11-23 new post: done", "", "=== summary ===", "written", ""].join("\n");
const SMALL = ["--keep", "2", "--limit", "100", "--at", "50", "--today", "2026-11-27"];
const made: string[] = [];
let folder = "";

function run(...more: string[]) {
  return runScript(SCRIPT, ["--ledger", "ledger.txt", "--history", "history.txt", "--settings", "settings.txt", ...more], folder);
}

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-weeks-archive-"));
  made.push(folder);
  await writeFile(join(folder, "ledger.txt"), LEDGER);
  await writeFile(join(folder, "settings.txt"), "spec 1\ntime zone: Australia/Melbourne\n");
});

afterAll(async () => {
  for (const each of made) {
    await rm(each, { recursive: true, force: true });
  }
});

describe("dfm-ledger:weeks-archive dist/run.js", () => {
  it("previews by default and writes nothing", async () => {
    const ran = await run(...SMALL);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("would move 1 done lines from the weeks before 2026-11-16 to history.txt");
    expect(await readFile(join(folder, "ledger.txt"), "utf8")).toBe(LEDGER);
  });

  it("moves the old week into a new history with --go and reads back", async () => {
    const ran = await run(...SMALL, "--go");
    expect(ran.code).toBe(0);
    expect(await readFile(join(folder, "history.txt"), "utf8")).toBe("spec 1\n=== done ===\n2026-11-02 new post: done\n");
    const ledger = await readFile(join(folder, "ledger.txt"), "utf8");
    expect(ledger).not.toContain("2026-11-02");
    expect(ledger).toContain("2026-11-23 new post: done");
    expect((await run("--read-back")).stdout).toContain("history: 1 done lines; in both: 0");
  });

  it("moves nothing under the threshold", async () => {
    const ran = await run("--go");
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("nothing to move: the ledger is under 75% of the limit");
  });
});
