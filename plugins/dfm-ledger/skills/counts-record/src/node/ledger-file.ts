// Node edge: reads the ledger and settings, writes the ledger back.

import { readFile, writeFile } from "node:fs/promises";
import { expandHome } from "@dataflow-marketing/core/node";

export async function readText(path: string): Promise<string | undefined> {
  try {
    return await readFile(expandHome(path), "utf8");
  } catch {
    return undefined;
  }
}

export async function writeText(path: string, text: string): Promise<void> {
  await writeFile(expandHome(path), text, "utf8");
}
