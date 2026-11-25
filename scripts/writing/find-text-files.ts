// Node edge: finds every .md, .txt, .json, .ts and .yml file under a folder,
// skipping node_modules, dist, .git, .wrangler and the one test file that holds breaks on purpose.

import { readdir } from "node:fs/promises";
import { extname, join } from "node:path";

const CHECKED_EXTENSIONS = new Set([".md", ".txt", ".json", ".ts", ".yml"]);

// find-breaks.test.ts feeds the check em dashes, emojis and commas on purpose
const SKIPPED_FILES = new Set(["find-breaks.test.ts"]);
const SKIPPED_FOLDERS = new Set(["node_modules", "dist", ".git", ".wrangler"]);

export async function findTextFiles(folder: string): Promise<string[]> {
  const found: string[] = [];
  const entries = await readdir(folder, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) {
      if (!SKIPPED_FOLDERS.has(entry.name)) {
        found.push(...(await findTextFiles(path)));
      }
      continue;
    }
    if (entry.isFile() && CHECKED_EXTENSIONS.has(extname(entry.name)) && !SKIPPED_FILES.has(entry.name)) {
      found.push(path);
    }
  }

  return found.sort();
}
