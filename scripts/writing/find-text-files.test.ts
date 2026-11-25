import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { findTextFiles } from "./find-text-files.ts";

let folder = "";

beforeAll(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-find-text-"));
  const files = [
    "README.md",
    "spec/notes.txt",
    "package.json",
    "src/run.ts",
    ".github/workflows/ci.yml",
    "writing/find-breaks.test.ts",
    "node_modules/some-package/README.md",
    "dist/notes.md",
    ".wrangler/state.json",
  ];
  for (const file of files) {
    await mkdir(join(folder, file, ".."), { recursive: true });
    await writeFile(join(folder, file), "text\n");
  }
});

afterAll(async () => {
  await rm(folder, { recursive: true, force: true });
});

describe("findTextFiles", () => {
  it("finds .md, .txt, .json, .ts and .yml files and skips node_modules, dist, .wrangler and find-breaks.test.ts", async () => {
    const found = (await findTextFiles(folder)).map((path) => relative(folder, path));
    expect(found).toEqual([".github/workflows/ci.yml", "README.md", "package.json", "spec/notes.txt", "src/run.ts"]);
  });
});
