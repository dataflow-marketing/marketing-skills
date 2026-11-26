// counts-record's dist/run.js run as Claude runs it, on a small ledger. The week named is one gone by: the test
// does not depend on today.

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { COFFEE_SHOP_LEDGER } from "../../../fixtures/coffee-shop.ts";
import { runScript } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));
const ARGS = ["--ledger", "ledger.txt", "--settings", "settings.txt", "--week", "2026-11-23"];
const made: string[] = [];
let folder = "";

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-counts-run-"));
  made.push(folder);
  await writeFile(join(folder, "ledger.txt"), COFFEE_SHOP_LEDGER);
  await writeFile(join(folder, "settings.txt"), "spec 1\ntime zone: Australia/Melbourne\n");
});

afterAll(async () => {
  for (const each of made) {
    await rm(each, { recursive: true, force: true });
  }
});

describe("counts-record dist/run.js", () => {
  it("previews by default and writes nothing", async () => {
    const ran = await runScript(SCRIPT, [...ARGS, "--count", "visits=1,310"], folder);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("2026-11-23 fact count visits: 1,310");
    expect(await readFile(join(folder, "ledger.txt"), "utf8")).toBe(COFFEE_SHOP_LEDGER);
  });

  it("writes on --go, reads it back and says the summary is out of date", async () => {
    const ran = await runScript(SCRIPT, [...ARGS, "--count", "visits=1,310", "--done", "open the cafe", "--go"], folder);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("summary-make next");
    const ledger = await readFile(join(folder, "ledger.txt"), "utf8");
    expect(ledger).toContain("2026-11-23 fact count visits: 1,310");
    expect(ledger).toContain("2026-11-23 open the cafe: done at ");
  });

  it("refuses a fact the graph does not declare and writes nothing", async () => {
    const ran = await runScript(SCRIPT, [...ARGS, "--count", "enquiries=3", "--go"], folder);
    expect(ran.code).toBe(2);
    expect(await readFile(join(folder, "ledger.txt"), "utf8")).toBe(COFFEE_SHOP_LEDGER);
  });

  it("refuses when nothing was told", async () => {
    expect((await runScript(SCRIPT, ARGS, folder)).code).toBe(2);
  });
});
