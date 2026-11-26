// Node edge: reads the text and its sources from disk.
// A file that cannot be read is a failure: the check cannot run without it.

import { readFile } from "node:fs/promises";
import type { CheckFiles } from "../read-args.ts";
import type { Source } from "../types.ts";

export type ReadResult = { ok: true; text: string; sources: Source[] } | { ok: false; problem: string };

export async function readTextFiles(files: CheckFiles): Promise<ReadResult> {
  const text = await readOne(files.text);
  if (text === undefined) {
    return { ok: false, problem: `Cannot read the text: ${files.text}` };
  }

  const sources: Source[] = [];
  for (const name of files.against) {
    const sourceText = await readOne(name);
    if (sourceText === undefined) {
      return { ok: false, problem: `Cannot read the source: ${name}` };
    }
    sources.push({ name, text: sourceText });
  }

  return { ok: true, text, sources };
}

async function readOne(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, "utf8");
  } catch {
    return undefined;
  }
}
