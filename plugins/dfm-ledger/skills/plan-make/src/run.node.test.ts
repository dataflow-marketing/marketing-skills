// plan-make's dist/run.js run as Claude runs it.

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { runScript } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));
const ARGS = ["--ledger", "ledger.txt", "--settings", "settings.txt"];
const made: string[] = [];
let folder = "";

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-plan-make-"));
  made.push(folder);
  await writeFile(join(folder, "settings.txt"), "spec 1\ntime zone: Australia/Melbourne\n");
});

afterAll(async () => {
  for (const each of made) {
    await rm(each, { recursive: true, force: true });
  }
});

describe("plan-make dist/run.js", () => {
  it("previews the starter plan and writes nothing", async () => {
    const ran = await runScript(SCRIPT, ARGS, folder);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("every week check your profiles");
    await expect(readFile(join(folder, "ledger.txt"), "utf8")).rejects.toThrow();
  });

  it("starts the ledger on --go with the followers told", async () => {
    const ran = await runScript(SCRIPT, [...ARGS, "--followers", "120", "--go"], folder);
    expect(ran.code).toBe(0);
    expect(await readFile(join(folder, "ledger.txt"), "utf8")).toContain("fact total followers: 120");
  });

  it("never writes over a ledger", async () => {
    await writeFile(join(folder, "ledger.txt"), "spec 1\n");
    const ran = await runScript(SCRIPT, [...ARGS, "--go"], folder);
    expect(ran.code).toBe(2);
    expect(await readFile(join(folder, "ledger.txt"), "utf8")).toBe("spec 1\n");
  });
});
