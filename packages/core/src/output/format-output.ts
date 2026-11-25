// Gives back what a script prints: its text for a person or its data as JSON.
// A script works out both; the mode picks one.

import type { OutputMode } from "./output-mode.ts";

export type ScriptResult = {
  text: string;
  data: unknown;
};

export function formatOutput(result: ScriptResult, mode: OutputMode): string {
  if (mode === "json") {
    return JSON.stringify(result.data, null, 2);
  }
  return result.text;
}
