import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { readText, writeText } from "./text-file.ts";

let folder = "";

afterAll(async () => {
  await rm(folder, { recursive: true, force: true });
});

describe("text-file", () => {
  it("writes a ledger and reads it back; reads nothing from a missing file", async () => {
    folder = await mkdtemp(join(tmpdir(), "dfm-text-file-"));
    await writeText(join(folder, "ledger.txt"), "spec 1\n");
    expect(await readText(join(folder, "ledger.txt"))).toBe("spec 1\n");
    expect(await readText(join(folder, "missing.txt"))).toBeUndefined();
  });
});
