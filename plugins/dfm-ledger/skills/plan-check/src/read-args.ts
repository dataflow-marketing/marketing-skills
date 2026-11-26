// Reads the command line: the ledger to check and, when given, the settings it is checked with.
// --ledger <file> [--settings <file>] [--json]

export type CheckFiles = {
  ledger: string;
  settings?: string;
};

export type ArgsResult = { ok: true; files: CheckFiles } | { ok: false; problem: string };

export const USAGE = "node dist/run.js --ledger <file> [--settings <file>] [--json]";

export function readArgs(args: readonly string[]): ArgsResult {
  let ledger: string | undefined;
  let settings: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];

    if (arg === "--json") {
      continue;
    }
    if (arg === "--ledger" && isValue(value)) {
      ledger = value;
      index += 1;
      continue;
    }
    if (arg === "--settings" && isValue(value)) {
      settings = value;
      index += 1;
      continue;
    }
    return { ok: false, problem: `Not understood: ${arg}. Use: ${USAGE}` };
  }

  if (!ledger) {
    return { ok: false, problem: `Name a ledger. Use: ${USAGE}` };
  }
  const files: CheckFiles = { ledger };
  if (settings) {
    files.settings = settings;
  }
  return { ok: true, files };
}

function isValue(value: string | undefined): value is string {
  return value !== undefined && !value.startsWith("--");
}
