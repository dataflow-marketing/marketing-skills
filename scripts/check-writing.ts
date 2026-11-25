// pnpm check: every .md, .txt and .json file in the repo keeps the writing rules.
// No em dashes, no comma before "and", "but", "so" or "or", no emojis.
// Exit code 0 when every file keeps them, 1 when any break is found.

import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { findBreaks } from "./writing/find-breaks.ts";
import type { WritingBreak } from "./writing/find-breaks.ts";
import { findTextFiles } from "./writing/find-text-files.ts";
import { readText } from "./writing/read-text.ts";

async function main(): Promise<number> {
  const repoRoot = fileURLToPath(new URL("..", import.meta.url));
  const files = await findTextFiles(repoRoot);
  let breakCount = 0;

  for (const file of files) {
    const text = await readText(file);
    const breaks = findBreaks(text);
    for (const found of breaks) {
      printBreak(relative(repoRoot, file), found);
    }
    breakCount += breaks.length;
  }

  printSummary(files.length, breakCount);
  if (breakCount > 0) {
    return 1;
  }
  return 0;
}

function printBreak(file: string, found: WritingBreak): void {
  process.stdout.write(`${file}:${found.line}: ${found.rule}: ${found.excerpt}\n`);
}

function printSummary(fileCount: number, breakCount: number): void {
  process.stdout.write(`checked ${fileCount} files: ${breakCount} breaks of the writing rules\n`);
}

process.exitCode = await main();
