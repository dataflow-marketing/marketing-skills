import { mkdtemp, readFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { objectPath, readObjectFile, writeObjectFile } from "./object-file.ts";

describe("the file connector", () => {
  it("reads a relative path from the working folder and ~ from home", () => {
    expect(objectPath("ledger.txt", "/work")).toBe("/work/ledger.txt");
    expect(objectPath("~/dfm/ledger.txt", "/work")).toBe(join(homedir(), "dfm/ledger.txt"));
  });

  it("gives back undefined for a file that is not there", async () => {
    const folder = await mkdtemp(join(tmpdir(), "dfm-store-"));
    expect(await readObjectFile(join(folder, "none.txt"))).toBeUndefined();
  });

  it("makes the folder and writes the text", async () => {
    const folder = await mkdtemp(join(tmpdir(), "dfm-store-"));
    const path = join(folder, "people", "acme.txt");
    await writeObjectFile(path, "goal: 100\n");
    expect(await readFile(path, "utf8")).toBe("goal: 100\n");
    expect(await readObjectFile(path)).toBe("goal: 100\n");
  });
});
