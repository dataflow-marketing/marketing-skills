// Reads the command line: the ledger, the settings (for today in the business's time zone), who the plan belongs
// to, where the AI's response is sent and, when there is one, the profile; --out names a new file for the copy.
// --ledger <file> --settings <file> --who <name> --send-to <address> [--profile <file>] [--instructions <file>]
// [--out <file>] [--json]
// --instructions names a template of the person's own in place of the default instructions.

export type CopyArgs = {
  ledger: string;
  settings: string;
  who: string;
  sendTo: string;
  profile?: string;
  instructions?: string;
  out?: string;
};

export type ArgsResult = { ok: true; args: CopyArgs } | { ok: false; problem: string };

export const USAGE =
  "node dist/run.js --ledger <file> --settings <file> --who <name> --send-to <address> [--profile <file>] [--instructions <file>] [--out <file>] [--json]";

const VALUE_FLAGS = ["--ledger", "--settings", "--who", "--send-to", "--profile", "--instructions", "--out"];

export function readArgs(args: readonly string[]): ArgsResult {
  const values: Record<string, string> = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];
    if (arg === "--json") {
      continue;
    }
    if (VALUE_FLAGS.includes(arg) && value !== undefined && !value.startsWith("--")) {
      values[arg] = value;
      index += 1;
      continue;
    }
    return { ok: false, problem: `Not understood: ${arg}. Use: ${USAGE}` };
  }
  const { "--ledger": ledger, "--settings": settings, "--who": who, "--send-to": sendTo } = values;
  if (!ledger || !settings || !who || !sendTo) {
    return { ok: false, problem: `Name the ledger, the settings, who the plan belongs to and where the response is sent. Use: ${USAGE}` };
  }
  const read: CopyArgs = { ledger, settings, who, sendTo };
  if (values["--profile"]) {
    read.profile = values["--profile"];
  }
  if (values["--instructions"]) {
    read.instructions = values["--instructions"];
  }
  if (values["--out"]) {
    read.out = values["--out"];
  }
  return { ok: true, args: read };
}
