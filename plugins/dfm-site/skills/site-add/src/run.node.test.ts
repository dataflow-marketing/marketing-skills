// dfm-site:site-add's dist/run.js run as Claude runs it.

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { COFFEE_SHOP_ADDRESS, COFFEE_SHOP_SITE_LINE } from "../../../fixtures/coffee-shop.ts";
import { runScript } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));
const SETTINGS_START = "spec 1\ntime zone: Australia/Melbourne\n";
const made: string[] = [];
let folder = "";
let settings = "";

function siteArgs(...more: string[]): string[] {
  return ["--name", "coffee-shop", "--address", COFFEE_SHOP_ADDRESS, "--settings", settings, ...more];
}

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-site-add-"));
  made.push(folder);
  settings = join(folder, "settings.txt");
});

afterAll(async () => {
  for (const each of made) {
    await rm(each, { recursive: true, force: true });
  }
});

describe("dfm-site:site-add dist/run.js", () => {
  it("previews by default and writes nothing", async () => {
    await writeFile(settings, SETTINGS_START);
    const ran = await runScript(SCRIPT, siteArgs(), folder);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("preview: nothing written");
    expect(await readFile(settings, "utf8")).toBe(SETTINGS_START);
  });

  it("starts a settings file with the time zone and the public site, then reads it back", async () => {
    const ran = await runScript(SCRIPT, siteArgs("--go", "--time-zone", "Australia/Melbourne"), folder);
    expect(ran.code).toBe(0);
    expect(await readFile(settings, "utf8")).toBe(`${SETTINGS_START}${COFFEE_SHOP_SITE_LINE}\n`);
    const back = await runScript(SCRIPT, siteArgs("--read-back"), folder);
    expect(back.code).toBe(0);
  });
});
