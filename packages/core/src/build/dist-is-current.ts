// Node edge: says whether a committed dist file is what its source builds today.
// It builds the source in memory and compares it with the file on disk.
// A dist file that is out of date, edited by hand or missing is caught.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { build } from "esbuild";
import { bundleOptions } from "./bundle-options.ts";
import type { ScriptBundle } from "./bundle-options.ts";

export type DistCheck = {
  current: boolean;
  reason: string;
};

export async function distIsCurrent(bundle: ScriptBundle): Promise<DistCheck> {
  const expected = await buildInMemory(bundle);
  const committed = await readCommitted(bundle);

  if (committed === undefined) {
    return { current: false, reason: `${bundle.outfile} is missing: run pnpm build` };
  }
  if (committed !== expected) {
    return { current: false, reason: `${bundle.outfile} differs from its source: run pnpm build` };
  }
  return { current: true, reason: `${bundle.outfile} matches its source` };
}

async function buildInMemory(bundle: ScriptBundle): Promise<string> {
  const options = { ...bundleOptions(bundle), write: false };
  const result = await build(options);
  const files = result.outputFiles ?? [];
  if (files.length !== 1) {
    throw new Error(`expected one built file, got ${files.length}`);
  }
  return files[0].text;
}

async function readCommitted(bundle: ScriptBundle): Promise<string | undefined> {
  const path = join(bundle.skillFolder, bundle.outfile);
  try {
    return await readFile(path, "utf8");
  } catch {
    return undefined;
  }
}
