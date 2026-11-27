// dfm-content:profile-compare's dist/run.js run as Claude runs it.

import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

const exec = promisify(execFile);
const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));
const MONTH_ONE = "spec 1\n=== read from the site ===\nwhat it offers:\nCoffee from 6.30. Plant milk is 50 cents extra.\n";
const MONTH_TWO = "spec 1\n=== read from the site ===\nwhat it offers:\nCoffee from 6.30. Plant milk costs nothing extra.\n";
const made: string[] = [];
let folder = "";

async function run(...args: string[]): Promise<{ code: number; stdout: string }> {
  try {
    const { stdout } = await exec("node", [SCRIPT, ...args], { cwd: folder });
    return { code: 0, stdout };
  } catch (error) {
    const failed = error as { code: number; stdout: string };
    return { code: failed.code, stdout: failed.stdout };
  }
}

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-profile-compare-"));
  made.push(folder);
  await writeFile(join(folder, "one.txt"), MONTH_ONE);
  await writeFile(join(folder, "two.txt"), MONTH_TWO);
});

afterAll(async () => {
  for (const each of made) {
    await rm(each, { recursive: true, force: true });
  }
});

describe("dfm-content:profile-compare dist/run.js", () => {
  it("shows what changed between two reads", async () => {
    const ran = await run("--before", "one.txt", "--after", "two.txt");
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("what it offers:\n- Plant milk is 50 cents extra.\n+ Plant milk costs nothing extra.");
  });

  it("lines profiles up side by side", async () => {
    const ran = await run("--side-by-side", "a=one.txt", "b=two.txt");
    expect(ran.stdout).toContain("## what it offers\na: Coffee from 6.30. Plant milk is 50 cents extra.\nb: Coffee from 6.30. Plant milk costs nothing extra.");
  });

  it("refuses a profile it cannot read", async () => {
    const ran = await run("--before", "one.txt", "--after", "missing.txt");
    expect(ran.code).toBe(2);
  });
});
