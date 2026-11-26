// askai-make's dist/run.js run as Claude runs it, on copies of the coffee shop example.

import { copyFile, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runScript } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));
const EXAMPLES = fileURLToPath(new URL("../../../../../examples/coffee-shop/", import.meta.url));
const ARGS = ["--ledger", "ledger.txt", "--settings", "settings.txt", "--who", "the coffee shop", "--send-to", "hello@coffee-shop.example", "--profile", "profile.txt"];
let folder = "";

beforeAll(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-askai-"));
  await copyFile(join(EXAMPLES, "ledger.txt"), join(folder, "ledger.txt"));
  await copyFile(join(EXAMPLES, "profile.txt"), join(folder, "profile.txt"));
  await writeFile(join(folder, "settings.txt"), "spec 1\ntime zone: Australia/Melbourne\n");
});

afterAll(async () => {
  await rm(folder, { recursive: true, force: true });
});

describe("askai-make dist/run.js", () => {
  it("prints the copy with its three parts", async () => {
    const ran = await runScript(SCRIPT, ARGS, folder);
    expect(ran.code).toBe(0);
    for (const heading of ["=== read this first ===", "=== their website ===", "=== their plan ==="]) {
      expect(ran.stdout).toContain(heading);
    }
  });

  it("writes the copy to a new file with --out; never over one", async () => {
    expect((await runScript(SCRIPT, [...ARGS, "--out", "copy.txt"], folder)).code).toBe(0);
    expect(await readFile(join(folder, "copy.txt"), "utf8")).toContain("This is the marketing plan of the coffee shop");
    expect((await runScript(SCRIPT, [...ARGS, "--out", "copy.txt"], folder)).code).toBe(2);
  });
});
