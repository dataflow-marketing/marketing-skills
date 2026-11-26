// dist/run.js is what its source builds today and it runs with nothing but Node,
// giving exit code 0 when the check passes, 1 when it finds problems and 2 when it cannot run.

import { execFile } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { distIsCurrent } from "@dataflow-marketing/core/build";
import { beforeAll, describe, expect, it } from "vitest";
import { quotesCheckBundle } from "../bundle.ts";
import {
  COFFEE_SHOP_COUNTS,
  COFFEE_SHOP_PROFILE,
  COFFEE_SHOP_SITE,
  DRAFT_WITH_INVENTIONS,
} from "../../../fixtures/coffee-shop.ts";

const run = promisify(execFile);
const pluginFolder = fileURLToPath(new URL("../../../", import.meta.url));
const bundle = quotesCheckBundle(pluginFolder);
const script = join(bundle.skillFolder, bundle.outfile);

type Ran = { code: number; stdout: string };

async function runCheck(args: string[]): Promise<Ran> {
  try {
    const { stdout } = await run("node", [script, ...args]);
    return { code: 0, stdout };
  } catch (error) {
    const failed = error as { code: number; stdout: string };
    return { code: failed.code, stdout: failed.stdout };
  }
}

let folder = "";

beforeAll(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-quotes-check-"));
  await writeFile(join(folder, "profile.txt"), COFFEE_SHOP_PROFILE);
  await writeFile(join(folder, "site.txt"), COFFEE_SHOP_SITE);
  await writeFile(join(folder, "counts.txt"), COFFEE_SHOP_COUNTS);
  await writeFile(join(folder, "draft.txt"), DRAFT_WITH_INVENTIONS);
});

describe("quotes-check dist/run.js", () => {
  it("matches what its source builds", async () => {
    const check = await distIsCurrent(bundle);
    expect(check.reason).toBe("dist/run.js matches its source");
    expect(check.current).toBe(true);
  });

  it("exits 0 when the profile passes", async () => {
    const args = ["--text", join(folder, "profile.txt"), "--against", join(folder, "site.txt"), "--against", join(folder, "counts.txt")];
    const ran = await runCheck(args);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("result: passed");
  });

  it("exits 1 with problems and prints JSON with --json", async () => {
    const ran = await runCheck(["--text", join(folder, "draft.txt"), "--against", join(folder, "site.txt"), "--json"]);
    expect(ran.code).toBe(1);
    expect(JSON.parse(ran.stdout).problems).toBe(4);
  });

  it("exits 2 when a file cannot be read", async () => {
    const ran = await runCheck(["--text", join(folder, "missing.txt"), "--against", join(folder, "site.txt")]);
    expect(ran.code).toBe(2);
  });

  it("exits 2 when no source is named", async () => {
    const ran = await runCheck(["--text", join(folder, "draft.txt")]);
    expect(ran.code).toBe(2);
  });
});
