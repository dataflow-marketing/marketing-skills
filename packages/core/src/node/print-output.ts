// Node edge: prints a script's result in the mode asked for.

import { formatOutput } from "../output/format-output.ts";
import type { ScriptResult } from "../output/format-output.ts";
import type { OutputMode } from "../output/output-mode.ts";

export function printOutput(result: ScriptResult, mode: OutputMode): void {
  const output = formatOutput(result, mode);
  process.stdout.write(`${output}\n`);
}
