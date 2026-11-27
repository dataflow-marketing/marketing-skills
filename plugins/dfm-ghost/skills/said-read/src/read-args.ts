// Reads the command line: the ledger, the settings and, when it is not this week, the week's Monday.
// --ledger <file> --settings <file> [--week <Monday>] [--json]
// said-read only reads: it takes no --go.

export type SaidArgs = {
  ledger: string;
  settings: string;
  week?: string;
};

export type ArgsResult = { ok: true; args: SaidArgs } | { ok: false; problem: string };

export const USAGE = "node dist/run.js --ledger <file> --settings <file> [--week <Monday>] [--json]";

const NAMED = ["--ledger", "--settings", "--week"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function readArgs(args: readonly string[]): ArgsResult {
  const named: Record<string, string> = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];
    if (arg === "--json") {
      continue;
    }
    const hasValue = value !== undefined && !value.startsWith("--");
    if (NAMED.includes(arg) && hasValue) {
      named[arg] = value;
      index += 1;
      continue;
    }
    return { ok: false, problem: `Not understood: ${arg}. Use: ${USAGE}` };
  }

  if (!named["--ledger"] || !named["--settings"]) {
    return { ok: false, problem: `Name the ledger and the settings. Use: ${USAGE}` };
  }
  if (named["--week"] && !DATE.test(named["--week"])) {
    return { ok: false, problem: `A week is its Monday, such as 2026-11-30: ${named["--week"]}` };
  }

  const asked: SaidArgs = { ledger: named["--ledger"], settings: named["--settings"] };
  if (named["--week"]) {
    asked.week = named["--week"];
  }
  return { ok: true, args: asked };
}
