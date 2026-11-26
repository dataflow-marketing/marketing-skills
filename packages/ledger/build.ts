// Builds the line parser from its grammar into src/read/lines.js, which is committed.

import { readFile, writeFile } from "node:fs/promises";
import { generateLines } from "./build/generate-lines.ts";
import { GRAMMAR, PARSER } from "./build/paths.ts";

async function main(): Promise<void> {
  const grammar = await readFile(GRAMMAR, "utf8");
  await writeFile(PARSER, generateLines(grammar));
  process.stdout.write("built src/read/lines.js\n");
}

await main();
