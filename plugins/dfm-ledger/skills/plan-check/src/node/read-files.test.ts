import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { readFiles } from "./read-files.ts";

let folder = "";

afterAll(async () => {
  await rm(folder, { recursive: true, force: true });
});

describe("readFiles", () => {
  it("reads the ledger and settings; fails on one it cannot read", async () => {
    folder = await mkdtemp(join(tmpdir(), "dfm-plan-check-"));
    await writeFile(join(folder, "ledger.txt"), "spec 1\n");
    expect(await readFiles({ ledger: join(folder, "ledger.txt") })).toEqual({ ok: true, ledger: "spec 1\n" });
    expect((await readFiles({ ledger: join(folder, "missing.txt") })).ok).toBe(false);
  });
});
