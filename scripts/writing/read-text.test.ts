import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { readText } from "./read-text.ts";

let folder = "";

afterAll(async () => {
  await rm(folder, { recursive: true, force: true });
});

describe("readText", () => {
  it("reads a file as text", async () => {
    folder = await mkdtemp(join(tmpdir(), "dfm-read-text-"));
    const file = join(folder, "notes.md");
    await writeFile(file, "The coffee shop opens at seven.\n");
    expect(await readText(file)).toBe("The coffee shop opens at seven.\n");
  });
});
