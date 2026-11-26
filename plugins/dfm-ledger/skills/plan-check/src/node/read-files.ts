// Node edge: reads the ledger and, when named, the settings from disk.
// A file that cannot be read is a failure: the check cannot run without it.

import { readFile } from "node:fs/promises";
import { expandHome } from "@dataflow-marketing/core/node";
import type { CheckFiles } from "../read-args.ts";

export type ReadResult = { ok: true; ledger: string; settings?: string } | { ok: false; problem: string };

export async function readFiles(files: CheckFiles): Promise<ReadResult> {
  const ledger = await readOne(files.ledger);
  if (ledger === undefined) {
    return { ok: false, problem: `Cannot read the ledger: ${files.ledger}` };
  }
  if (files.settings === undefined) {
    return { ok: true, ledger };
  }

  const settings = await readOne(files.settings);
  if (settings === undefined) {
    return { ok: false, problem: `Cannot read the settings: ${files.settings}` };
  }
  return { ok: true, ledger, settings };
}

async function readOne(path: string): Promise<string | undefined> {
  try {
    return await readFile(expandHome(path), "utf8");
  } catch {
    return undefined;
  }
}
