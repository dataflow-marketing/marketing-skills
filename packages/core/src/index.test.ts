// The test for index.ts: every work module it shares keeps a Worker's limits (no Node APIs).
// Only the edge folders (src/node and src/build) may import from node:. Test files are not work modules.

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SOURCE = fileURLToPath(new URL("./", import.meta.url));
const EDGE_FOLDERS = new Set(["node", "build"]);
// "node:" anything, a bare Node module name or a dynamic import of either
const NODE_IMPORT =
  /(?:from\s+|import\s*\(\s*|import\s+)["'](?:node:|(?:fs|path|os|child_process|process|buffer|crypto)["'/])/;

function usesNode(text: string): boolean {
  return NODE_IMPORT.test(text) || text.includes("process.") || /\bBuffer\b/.test(text);
}

async function workModules(folder: string): Promise<string[]> {
  const found: string[] = [];
  const entries = await readdir(folder, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(folder, entry.name);
    if (entry.isDirectory() && !EDGE_FOLDERS.has(entry.name)) {
      found.push(...(await workModules(path)));
    }
    if (entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
      found.push(path);
    }
  }
  return found;
}

describe("the Node check itself", () => {
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

describe("work modules", () => {
  it("import nothing from Node", async () => {
    const withNode: string[] = [];
    for (const file of await workModules(SOURCE)) {
      const text = await readFile(file, "utf8");
      if (usesNode(text)) {
        withNode.push(file);
      }
    }
    expect(withNode).toEqual([]);
  });
});
