// site-add's dist/run.js, run with Node alone on a settings file in a temporary folder.

import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it } from "vitest";
import {
  COFFEE_SHOP_ADDRESS,
  COFFEE_SHOP_ADMIN_KEY,
  COFFEE_SHOP_KEY_NAME,
  COFFEE_SHOP_SITE_LINE,
} from "../../../fixtures/coffee-shop.ts";
import { runScript } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));
const SETTINGS_START = "spec 1\ntime zone: Australia/Melbourne\nkeys file: ~/.config/dfm/.env\n";

let folder = "";
let settings = "";

function siteArgs(...mode: string[]): string[] {
  return ["--name", "coffee-shop", "--address", COFFEE_SHOP_ADDRESS, "--key-name", COFFEE_SHOP_KEY_NAME, "--settings", settings, ...mode];
}

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-site-add-"));
  settings = join(folder, "settings.txt");
  await writeFile(settings, SETTINGS_START);
});

describe("site-add dist/run.js", () => {
  it("previews by default and writes nothing", async () => {
    const ran = await runScript(SCRIPT, siteArgs(), { cwd: folder });
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("preview: nothing written");
    expect(ran.stdout).toContain(COFFEE_SHOP_SITE_LINE);
    expect(await readFile(settings, "utf8")).toBe(SETTINGS_START);
  });

  it("appends the line on --go, reads it back and writes a run log line", async () => {
    const ran = await runScript(SCRIPT, siteArgs("--go"), { cwd: folder });
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("read back: the site is there");
    expect(await readFile(settings, "utf8")).toBe(`${SETTINGS_START}${COFFEE_SHOP_SITE_LINE}\n`);

    const runLog = await readFile(join(folder, "run-log.txt"), "utf8");
    expect(runLog).toContain(`| dfm-ghost:site-add | site added | settings ${settings} | before: (none) | after: ${COFFEE_SHOP_SITE_LINE}`);
  });

  it("adds nothing the second time", async () => {
    await runScript(SCRIPT, siteArgs("--go"), { cwd: folder });
    const again = await runScript(SCRIPT, siteArgs("--go"), { cwd: folder });
    expect(again.code).toBe(0);
    expect(again.stdout).toContain("nothing to add");
    expect(await readFile(settings, "utf8")).toBe(`${SETTINGS_START}${COFFEE_SHOP_SITE_LINE}\n`);
  });

  it("starts a settings file that is not there yet, with the time zone it is given", async () => {
    settings = join(folder, "new-settings.txt");
    const newFile = ["--time-zone", "Australia/Melbourne", "--keys-file", "~/.config/dfm/.env"];
    const ran = await runScript(SCRIPT, siteArgs("--go", ...newFile), { cwd: folder });
    expect(ran.code).toBe(0);
    expect(await readFile(settings, "utf8")).toBe(`${SETTINGS_START}${COFFEE_SHOP_SITE_LINE}\n`);
  });

  it("asks for the time zone before starting a settings file and writes nothing", async () => {
    settings = join(folder, "new-settings.txt");
    const ran = await runScript(SCRIPT, siteArgs("--go"), { cwd: folder });
    expect(ran.code).toBe(2);
    expect(ran.stdout).toContain("--time-zone");
    await expect(readFile(settings, "utf8")).rejects.toThrow();
  });

  it("reads back with --read-back", async () => {
    const missing = await runScript(SCRIPT, siteArgs("--read-back"), { cwd: folder });
    expect(missing.code).toBe(1);
    await runScript(SCRIPT, siteArgs("--go"), { cwd: folder });
    const there = await runScript(SCRIPT, siteArgs("--read-back", "--json"), { cwd: folder });
    expect(there.code).toBe(0);
    expect(JSON.parse(there.stdout).problems).toEqual([]);
  });

  it("refuses an address that is not https:// and writes nothing", async () => {
    const args = ["--name", "coffee-shop", "--address", "http://coffee-shop.example", "--key-name", COFFEE_SHOP_KEY_NAME, "--settings", settings, "--go"];
    const ran = await runScript(SCRIPT, args, { cwd: folder });
    expect(ran.code).toBe(2);
    expect(await readFile(settings, "utf8")).toBe(SETTINGS_START);
  });

  it("refuses a key given in place of its variable, writes nothing and never prints it", async () => {
    const args = ["--name", "coffee-shop", "--address", COFFEE_SHOP_ADDRESS, "--key-name", COFFEE_SHOP_ADMIN_KEY, "--settings", settings, "--go"];
    const ran = await runScript(SCRIPT, args, { cwd: folder });
    expect(ran.code).toBe(2);
    expect(`${ran.stdout}${ran.stderr}`).not.toContain(COFFEE_SHOP_ADMIN_KEY);
    expect(await readFile(settings, "utf8")).toBe(SETTINGS_START);
  });

  it("refuses two modes at once", async () => {
    const ran = await runScript(SCRIPT, siteArgs("--preview", "--go"), { cwd: folder });
    expect(ran.code).toBe(2);
  });

  it("turns a public site into the Ghost site on --go, with one line for the site", async () => {
    await writeFile(settings, `${SETTINGS_START}site coffee-shop: public ${COFFEE_SHOP_ADDRESS}\n`);
    const ran = await runScript(SCRIPT, siteArgs("--go"), { cwd: folder });
    expect(ran.code).toBe(0);
    expect(await readFile(settings, "utf8")).toBe(`${SETTINGS_START}${COFFEE_SHOP_SITE_LINE}\n`);
  });

  it("takes out a public line left beside the same Ghost line, then reads back one line for the site", async () => {
    await writeFile(settings, `${SETTINGS_START}site coffee-shop: public ${COFFEE_SHOP_ADDRESS}\n${COFFEE_SHOP_SITE_LINE}\n`);
    const ran = await runScript(SCRIPT, siteArgs("--go"), { cwd: folder });
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("took out of");
    expect(await readFile(settings, "utf8")).toBe(`${SETTINGS_START}${COFFEE_SHOP_SITE_LINE}\n`);
  });
});
