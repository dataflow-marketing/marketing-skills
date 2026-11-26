// plan-change's dist/run.js run as Claude runs it, on a copy of the coffee shop ledger.

import { copyFile, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runScript } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));
const EXAMPLES = fileURLToPath(new URL("../../../../../examples/coffee-shop/", import.meta.url));
const ARGS = ["--ledger", "ledger.txt", "--settings", "settings.txt", "--changes", "response.txt"];
const RESPONSE = [
  "Here is what we settled.",
  "Change: every week stamp card reminder on Instagram from 2026-12-07",
  "Change: stamp card reminder on Instagram -> stamp cards started: ? (unknown)",
  "Why: the regulars forget the card.",
].join("\n");
let folder = "";

beforeAll(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-plan-change-"));
  await copyFile(join(EXAMPLES, "ledger.txt"), join(folder, "ledger.txt"));
  await writeFile(join(folder, "settings.txt"), "spec 1\ntime zone: Australia/Melbourne\n");
  await writeFile(join(folder, "response.txt"), RESPONSE);
});

afterAll(async () => {
  await rm(folder, { recursive: true, force: true });
});

describe("plan-change dist/run.js", () => {
  it("previews without writing", async () => {
    const before = await readFile(join(folder, "ledger.txt"), "utf8");
    const ran = await runScript(SCRIPT, ARGS, folder);
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("add to plan: every week stamp card reminder on Instagram from 2026-12-07");
    expect(await readFile(join(folder, "ledger.txt"), "utf8")).toBe(before);
  });

  it("writes on --go, reads it back and logs the run", async () => {
    const ran = await runScript(SCRIPT, [...ARGS, "--go"], folder);
    expect(ran.code).toBe(0);
    const ledger = await readFile(join(folder, "ledger.txt"), "utf8");
    expect(ledger).toContain("every week stamp card reminder on Instagram from 2026-12-07");
    expect(await readFile(join(folder, "run-log.txt"), "utf8")).toContain("dfm-ledger:plan-change");
  });

  it("refuses the whole change when a line is not a ledger line", async () => {
    await writeFile(join(folder, "bad.txt"), "Change: make the posts better\n");
    const ran = await runScript(SCRIPT, ["--ledger", "ledger.txt", "--settings", "settings.txt", "--changes", "bad.txt", "--go"], folder);
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("Not a ledger line: make the posts better");
  });
});
