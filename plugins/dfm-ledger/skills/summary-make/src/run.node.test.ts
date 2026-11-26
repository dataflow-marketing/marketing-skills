// summary-make's dist/run.js run as Claude runs it, on a copy of the coffee shop example.

import { copyFile, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { runScript } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));
const EXAMPLE = fileURLToPath(new URL("../../../../../examples/coffee-shop/ledger.txt", import.meta.url));
const ARGS = ["--ledger", "ledger.txt", "--settings", "settings.txt", "--today", "2026-12-02"];
const made: string[] = [];
let folder = "";

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-summary-run-"));
  made.push(folder);
  await copyFile(EXAMPLE, join(folder, "ledger.txt"));
  await writeFile(join(folder, "settings.txt"), "spec 1\ntime zone: Australia/Melbourne\n");
});

afterAll(async () => {
  for (const each of made) {
    await rm(each, { recursive: true, force: true });
  }
});

describe("summary-make dist/run.js", () => {
  it("previews by default and writes nothing", async () => {
    const before = await readFile(join(folder, "ledger.txt"), "utf8");
    const ran = await runScript(SCRIPT, ARGS, folder);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("preview: nothing written");
    expect(await readFile(join(folder, "ledger.txt"), "utf8")).toBe(before);
  });

  it("finds the example's summary current on --read-back", async () => {
    const ran = await runScript(SCRIPT, [...ARGS, "--read-back"], folder);
    expect(ran.code).toBe(0);
  });

  it("writes a new summary on --go after a count changes, then reads it back", async () => {
    const text = await readFile(join(folder, "ledger.txt"), "utf8");
    await writeFile(join(folder, "ledger.txt"), text.replace("fact count visits: 560", "fact count visits: 600"));
    expect((await runScript(SCRIPT, [...ARGS, "--read-back"], folder)).code).toBe(1);
    const ran = await runScript(SCRIPT, [...ARGS, "--go"], folder);
    expect(ran.code).toBe(0);
    expect(await readFile(join(folder, "ledger.txt"), "utf8")).toContain("this week so far, to 2026-12-02: visits 600");
  });

  it("refuses settings with no time zone", async () => {
    await writeFile(join(folder, "settings.txt"), "spec 1\n");
    expect((await runScript(SCRIPT, ARGS, folder)).code).toBe(2);
  });
});
