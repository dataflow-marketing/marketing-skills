// Node edge for tests: finds the work modules under a folder that reach Node.
// A work module keeps a Worker's limits. The edges (folders or files named as edges) may use Node; test files are
// not work modules. Used by core's own guard and by each plugin's.

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// "node:" anything, a bare Node module name or a dynamic import of either
const NODE_IMPORT =
  /(?:from\s+|import\s*\(\s*|import\s+)["'](?:node:|(?:fs|path|os|child_process|process|buffer|crypto)["'/])/;

export function usesNode(text: string): boolean {
  return NODE_IMPORT.test(text) || text.includes("process.") || /\bBuffer\b/.test(text);
}

// The work modules under a folder that reach Node; edges are names of folders or files to leave out
export async function nodeInWorkModules(folder: string, edges: string[]): Promise<string[]> {
  const withNode: string[] = [];
  for (const file of await workModules(folder, new Set(edges))) {
    if (usesNode(await readFile(file, "utf8"))) {
      withNode.push(file);
    }
  }
  return withNode;
}

async function workModules(folder: string, edges: Set<string>): Promise<string[]> {
  const found: string[] = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (edges.has(entry.name)) {
      continue;
    }
    if (entry.isDirectory()) {
      found.push(...(await workModules(path, edges)));
    }
    if (entry.isFile() && isWorkModule(entry.name)) {
      found.push(path);
    }
  }
  return found;
}

function isWorkModule(fileName: string): boolean {
  return fileName.endsWith(".ts") && !fileName.endsWith(".test.ts");
}
