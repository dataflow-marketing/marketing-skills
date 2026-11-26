import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { nodeInWorkModules, usesNode } from "./node-in-work-modules.ts";

describe("usesNode", () => {
  it("catches every way of reaching Node", () => {
    expect(usesNode('import { readFile } from "node:fs/promises";')).toBe(true);
    expect(usesNode('import { join } from "node:path";')).toBe(true);
    expect(usesNode('import "node:fs";')).toBe(true);
    expect(usesNode('const fs = await import("node:fs");')).toBe(true);
    expect(usesNode('import { readFileSync } from "fs";')).toBe(true);
    expect(usesNode("const bytes = Buffer.from(text);")).toBe(true);
    expect(usesNode("const home = process.env.HOME;")).toBe(true);
  });

  it("leaves web standard code alone", () => {
    expect(usesNode('import { parseSettings } from "./settings/parse-settings.ts";')).toBe(false);
    expect(usesNode("const bytes = new TextEncoder().encode(text);")).toBe(false);
  });
});

describe("nodeInWorkModules", () => {
  let folder = "";

  afterAll(async () => {
    await rm(folder, { recursive: true, force: true });
  });

  it("names a work module that reaches Node and leaves edges and tests alone", async () => {
    folder = await mkdtemp(join(tmpdir(), "dfm-node-check-"));
    await mkdir(join(folder, "node"));
    await writeFile(join(folder, "pure.ts"), "export const a = 1;\n");
    await writeFile(join(folder, "leaky.ts"), 'import { readFile } from "node:fs/promises";\n');
    await writeFile(join(folder, "leaky.test.ts"), 'import { readFile } from "node:fs/promises";\n');
    await writeFile(join(folder, "run.ts"), 'import { readFile } from "node:fs/promises";\n');
    await writeFile(join(folder, "node", "edge.ts"), 'import { readFile } from "node:fs/promises";\n');
    expect(await nodeInWorkModules(folder, ["node", "run.ts"])).toEqual([join(folder, "leaky.ts")]);
  });
});
