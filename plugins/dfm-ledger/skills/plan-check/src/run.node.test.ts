// plan-check's dist/run.js run as Claude runs it.

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { COFFEE_SHOP_LEDGER, COFFEE_SHOP_SETTINGS } from "../../../fixtures/coffee-shop.ts";
import { runScript } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));
let folder = "";

beforeAll(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-plan-check-run-"));
  await writeFile(join(folder, "ledger.txt"), COFFEE_SHOP_LEDGER);
  await writeFile(join(folder, "broken.txt"), `${COFFEE_SHOP_LEDGER}not a line\n`);
  await writeFile(join(folder, "settings.txt"), COFFEE_SHOP_SETTINGS);
});

afterAll(async () => {
  await rm(folder, { recursive: true, force: true });
});

describe("plan-check dist/run.js", () => {
  it("exits 0 for a ledger with no problems", async () => {
    const ran = await runScript(SCRIPT, ["--ledger", "ledger.txt", "--settings", "settings.txt"], folder);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("result: passed");
  });

  it("exits 1 and names the problems, as data with --json", async () => {
    const ran = await runScript(SCRIPT, ["--ledger", "broken.txt", "--json"], folder);
    expect(ran.code).toBe(1);
    expect(JSON.parse(ran.stdout).problems[0].kind).toBe("unreadable line");
  });

  it("exits 2 when the ledger cannot be read", async () => {
    const ran = await runScript(SCRIPT, ["--ledger", "missing.txt"], folder);
    expect(ran.code).toBe(2);
  });
});
