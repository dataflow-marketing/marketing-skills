// The test for generate-lines.ts: the committed parser is what its grammar builds today.

import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { generateLines } from "./generate-lines.ts";
import { GRAMMAR, PARSER } from "./paths.ts";

describe("src/read/lines.js", () => {
  it("matches what grammar/lines.peggy builds", async () => {
    const built = generateLines(await readFile(GRAMMAR, "utf8"));
    expect(await readFile(PARSER, "utf8")).toBe(built);
  });
});
