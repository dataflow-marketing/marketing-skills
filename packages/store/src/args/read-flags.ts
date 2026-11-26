// Reads a skill's command line: each value flag once with its value, --json and a mode flag allowed.
// Anything else is a problem, never guessed at. The usage line is given back with the problem.

import { isModeFlag } from "@dataflow-marketing/core";

export type FlagsResult = { ok: true; values: Record<string, string> } | { ok: false; problem: string };

export type FlagRules = {
  valueFlags: readonly string[];
  required: readonly string[];
  usage: string;
};

export function readFlags(args: readonly string[], rules: FlagRules): FlagsResult {
  const values: Record<string, string> = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];
    if (arg === "--json" || isModeFlag(arg)) {
      continue;
    }
    if (rules.valueFlags.includes(arg) && value !== undefined && !value.startsWith("--")) {
      values[arg] = value;
      index += 1;
      continue;
    }
    return { ok: false, problem: `Not understood: ${arg}. Use: ${rules.usage}` };
  }

  const missing = rules.required.filter((flag) => !values[flag]);
  if (missing.length > 0) {
    return { ok: false, problem: `Missing ${missing.join(", ")}. Use: ${rules.usage}` };
  }
  return { ok: true, values };
}
