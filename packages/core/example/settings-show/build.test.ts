// The build proven on the example: dist/run.js is what its source builds today
// and it runs with nothing but Node.

import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterAll, describe, expect, it } from "vitest";
import { distIsCurrent } from "../../src/build/index.ts";
import { settingsShowBundle } from "./bundle.ts";
import { COFFEE_SHOP_SETTINGS } from "../../fixtures/coffee-shop.ts";

const run = promisify(execFile);
const skillFolder = fileURLToPath(new URL("./", import.meta.url));
const bundle = settingsShowBundle(skillFolder);
const made: string[] = [];

afterAll(async () => {
  for (const folder of made) {
    await rm(folder, { recursive: true, force: true });
  }
});

describe("settings-show dist/run.js", () => {
  it("matches what its source builds", async () => {
    const check = await distIsCurrent(bundle);
    expect(check.reason).toBe("dist/run.js matches its source");
    expect(check.current).toBe(true);
  });

  it("runs with Node alone and prints JSON with --json", async () => {
    const folder = await mkdtemp(join(tmpdir(), "dfm-settings-show-"));
    made.push(folder);
    const settingsPath = join(folder, "settings.txt");
    await writeFile(settingsPath, COFFEE_SHOP_SETTINGS);

    const { stdout } = await run("node", [join(skillFolder, "dist/run.js"), settingsPath, "--json"]);
    const printed = JSON.parse(stdout);
    expect(printed.problems).toEqual([]);
    expect(printed.settings.timeZone).toBe("Australia/Melbourne");
  });
});
