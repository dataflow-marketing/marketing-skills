// profile-make's dist/run.js run as Claude runs it, against the coffee shop's made up site (fake-site-preload.ts).

import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { COFFEE_SHOP_ADDRESS } from "../../../fixtures/coffee-shop-site.ts";

const exec = promisify(execFile);
const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));
const PRELOAD = new URL("../../../fixtures/fake-site-preload.ts", import.meta.url).href;
const made: string[] = [];
let folder = "";

type Ran = { code: number; stdout: string; stderr: string };

async function run(args: string[], site = "on"): Promise<Ran> {
  try {
    const { stdout, stderr } = await exec("node", ["--import", PRELOAD, SCRIPT, ...args], {
      cwd: folder,
      env: { ...process.env, FAKE_SITE: site },
    });
    return { code: 0, stdout, stderr };
  } catch (error) {
    const failed = error as { code: number; stdout: string; stderr: string };
    return { code: failed.code, stdout: failed.stdout, stderr: failed.stderr };
  }
}

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-profile-make-"));
  made.push(folder);
});

afterAll(async () => {
  for (const each of made) {
    await rm(each, { recursive: true, force: true });
  }
});

describe("profile-make dist/run.js", () => {
  it("keeps the home page and /llms-full.txt and prints the counted part", async () => {
    const ran = await run(["--address", COFFEE_SHOP_ADDRESS]);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("pages: 1, posts: 2 (in /llms-full.txt)");
    expect(await readFile(join(folder, "site", "home.txt"), "utf8")).toContain("Good coffee on your way to work.");
    expect(await readFile(join(folder, "site", "llms-full.txt"), "utf8")).toContain("### Stamp card");
  });

  it("stops and offers the sitemap when the site has no /llms-full.txt", async () => {
    const ran = await run(["--address", COFFEE_SHOP_ADDRESS], "no-llms-full");
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("--from-sitemap");
  });

  it("reads the pages the sitemap lists with --from-sitemap", async () => {
    const ran = await run(["--address", COFFEE_SHOP_ADDRESS, "--from-sitemap"], "no-llms-full");
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("pages: 1, posts: 2 (in the sitemap)");
    expect(await readFile(join(folder, "site", "pages.txt"), "utf8")).toContain("### Stamp card");
  });

  it("never writes over what was read before", async () => {
    await run(["--address", COFFEE_SHOP_ADDRESS]);
    const again = await run(["--address", COFFEE_SHOP_ADDRESS]);
    expect(again.code).toBe(2);
    expect(again.stderr).toContain("is already there");
  });
});
