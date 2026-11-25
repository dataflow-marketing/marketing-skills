// distIsCurrent, tried on the settings-show example's bundle.

import { cp, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { settingsShowBundle } from "../../example/settings-show/bundle.ts";
import { distIsCurrent } from "./dist-is-current.ts";

const skillFolder = fileURLToPath(new URL("../../example/settings-show/", import.meta.url));
const bundle = settingsShowBundle(skillFolder);
const made: string[] = [];

afterAll(async () => {
  for (const folder of made) {
    await rm(folder, { recursive: true, force: true });
  }
});

describe("distIsCurrent", () => {
  it("catches a dist file that is missing", async () => {
    const missing = { ...bundle, outfile: "dist/not-built.js" };
    const check = await distIsCurrent(missing);
    expect(check.current).toBe(false);
  });

  it("catches a dist file that differs from what its source builds", async () => {
    const folder = await mkdtemp(join(tmpdir(), "dfm-stale-"));
    made.push(folder);
    const stale = join(folder, "run.js");
    await cp(join(skillFolder, "dist/run.js"), stale);
    await writeFile(stale, "// one changed byte\n", { flag: "a" });
    const check = await distIsCurrent({ ...bundle, outfile: relative(skillFolder, stale) });
    expect(check.current).toBe(false);
    expect(check.reason).toMatch(/differs from its source/);
  });
});
