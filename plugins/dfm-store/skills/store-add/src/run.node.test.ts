// store-add's dist/run.js, run with Node alone. It writes settings only and never calls Ghost.

import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { runScript } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));
const SETTINGS = `spec 1
time zone: Australia/Melbourne
site coffee-shop: ghost https://coffee-shop.example key in COFFEE_SHOP_GHOST_ADMIN_KEY
keys file: .env
`;
const ADD = ["--store", "members", "--settings", "settings.txt", "--connector", "ghost", "--where", "coffee-shop"];
const BIND = ["--object", "ledger", "--business", "coffee-shop", "--place", "owner@coffee-shop.example next"];

async function folder(): Promise<string> {
  const made = await mkdtemp(join(tmpdir(), "dfm-store-add-"));
  await writeFile(join(made, "settings.txt"), SETTINGS);
  return made;
}

describe("store-add", () => {
  it("previews the lines and writes nothing", async () => {
    const dir = await folder();
    const ran = await runScript(SCRIPT, [...ADD, ...BIND], { cwd: dir });
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("Would add to settings.txt:\nstore members: ghost coffee-shop\nbinding ledger coffee-shop: members owner@coffee-shop.example next");
    expect(await readFile(join(dir, "settings.txt"), "utf8")).toBe(SETTINGS);
  });

  it("adds them with --go, logs and reads back", async () => {
    const dir = await folder();
    const ran = await runScript(SCRIPT, [...ADD, ...BIND, "--go"], { cwd: dir });
    expect(ran.code).toBe(0);
    expect(await readFile(join(dir, "settings.txt"), "utf8")).toBe(
      `${SETTINGS}store members: ghost coffee-shop\nbinding ledger coffee-shop: members owner@coffee-shop.example next\n`,
    );
    expect(await readFile(join(dir, "run-log.txt"), "utf8")).toContain("dfm-store:store-add | store lines added");
    expect((await runScript(SCRIPT, [...ADD, ...BIND, "--read-back"], { cwd: dir })).code).toBe(0);
  });

  it("leaves lines already there alone", async () => {
    const dir = await folder();
    await runScript(SCRIPT, [...ADD, "--go"], { cwd: dir });
    const ran = await runScript(SCRIPT, [...ADD, "--go"], { cwd: dir });
    expect(ran.stdout).toContain("Already in settings.txt");
    expect((await readFile(join(dir, "settings.txt"), "utf8")).match(/store members/g)).toHaveLength(1);
  });

  it("refuses a Ghost store for a site settings do not have", async () => {
    const dir = await folder();
    const ran = await runScript(SCRIPT, ["--store", "members", "--settings", "settings.txt", "--connector", "ghost", "--where", "bakery", "--go"], { cwd: dir });
    expect(ran.code).toBe(2);
    expect(await readFile(join(dir, "settings.txt"), "utf8")).toBe(SETTINGS);
  });

  it("adds a rest store and a binding by the business's name", async () => {
    const dir = await folder();
    const rest = ["--store", "api", "--settings", "settings.txt", "--connector", "rest", "--where", "https://api.coffee-shop.example", "--key-name", "COFFEE_SHOP_STORE_KEY"];
    const bind = ["--object", "ledger", "--business", "coffee-shop", "--place", "coffee-shop"];
    const ran = await runScript(SCRIPT, [...rest, ...bind, "--go"], { cwd: dir });
    expect(ran.code).toBe(0);
    expect(await readFile(join(dir, "settings.txt"), "utf8")).toBe(
      `${SETTINGS}store api: rest https://api.coffee-shop.example key in COFFEE_SHOP_STORE_KEY\nbinding ledger coffee-shop: api coffee-shop\n`,
    );
  });
});
