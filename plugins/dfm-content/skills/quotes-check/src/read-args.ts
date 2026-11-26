// Reads the command line: the text to check and the source or sources to check it against.
// --text <file> --against <file> [--against <file> ...] [--json]

export type CheckFiles = {
  text: string;
  against: string[];
};

export type ArgsResult = { ok: true; files: CheckFiles } | { ok: false; problem: string };

export const USAGE = "node dist/run.js --text <file> --against <file> [--against <file>] [--json]";

export function readArgs(args: readonly string[]): ArgsResult {
  let text: string | undefined;
  const against: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];

    if (arg === "--json") {
      continue;
    }
    if ((arg === "--text" || arg === "--against") && isValue(value)) {
      if (arg === "--text") {
        text = value;
      } else {
        against.push(value);
      }
      index += 1;
      continue;
    }
    return { ok: false, problem: `Not understood: ${arg}. Use: ${USAGE}` };
  }

  if (!text || against.length === 0) {
    return { ok: false, problem: `Name a text and its source. Use: ${USAGE}` };
  }
  return { ok: true, files: { text, against } };
}

function isValue(value: string | undefined): value is string {
  return value !== undefined && !value.startsWith("--");
}
