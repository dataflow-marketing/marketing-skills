// Node edge: reads the words file and its check report from disk
// and whether the report was made after the words file last changed.

import { readFile, stat } from "node:fs/promises";
import { expandHome } from "@dataflow-marketing/core/node";

export type Inputs = {
  wordsText: string;
  reportText?: string;
  reportIsNewer: boolean;
};

export type InputsResult = { ok: true; inputs: Inputs } | { ok: false; problem: string };

export async function readInputs(wordsPath: string, reportPath: string | undefined): Promise<InputsResult> {
  const wordsText = await readOne(wordsPath);
  if (wordsText === undefined) {
    return { ok: false, problem: `Cannot read the words file: ${wordsPath}` };
  }
  if (reportPath === undefined) {
    return { ok: true, inputs: { wordsText, reportIsNewer: false } };
  }

  const reportText = await readOne(reportPath);
  if (reportText === undefined) {
    return { ok: false, problem: `Cannot read the check report: ${reportPath}` };
  }
  const reportIsNewer = await isNewer(reportPath, wordsPath);
  return { ok: true, inputs: { wordsText, reportText, reportIsNewer } };
}

async function readOne(path: string): Promise<string | undefined> {
  try {
    return await readFile(expandHome(path), "utf8");
  } catch {
    return undefined;
  }
}

// The same moment counts as newer: a report saved straight after the check
// can share the words file's time on a coarse clock.
async function isNewer(reportPath: string, wordsPath: string): Promise<boolean> {
  const report = await stat(expandHome(reportPath));
  const words = await stat(expandHome(wordsPath));
  return report.mtimeMs >= words.mtimeMs;
}
