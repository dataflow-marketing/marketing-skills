// Reads the command line: two profiles of one business over time; or several businesses side by side.
//   --before <profile> --after <profile>            what changed between two reads
//   --side-by-side <name>=<profile> ...              each part, then what each business's profile says in it
// [--json] gives the same as data.

export type CompareArgs =
  | { mode: "over time"; before: string; after: string }
  | { mode: "side by side"; profiles: { name: string; file: string }[] };

export type ArgsResult = { ok: true; args: CompareArgs } | { ok: false; problem: string };

export const USAGE = "node dist/run.js --before <profile> --after <profile> | --side-by-side <name>=<profile> <name>=<profile> ... [--json]";

export function readArgs(args: readonly string[]): ArgsResult {
  const rest = args.filter((arg) => arg !== "--json");
  if (rest[0] === "--side-by-side") {
    const profiles = rest.slice(1).map(namedProfile);
    if (profiles.length < 2 || profiles.some((each) => each === undefined)) {
      return { ok: false, problem: `Name two or more profiles as name=file. Use: ${USAGE}` };
    }
    return { ok: true, args: { mode: "side by side", profiles: profiles as { name: string; file: string }[] } };
  }

  const before = valueOf(rest, "--before");
  const after = valueOf(rest, "--after");
  if (!before || !after || rest.length !== 4) {
    return { ok: false, problem: `Name the profile before and the profile after. Use: ${USAGE}` };
  }
  return { ok: true, args: { mode: "over time", before, after } };
}

function namedProfile(arg: string): { name: string; file: string } | undefined {
  const at = arg.indexOf("=");
  return at > 0 && at < arg.length - 1 ? { name: arg.slice(0, at), file: arg.slice(at + 1) } : undefined;
}

function valueOf(args: readonly string[], flag: string): string | undefined {
  const at = args.indexOf(flag);
  return at >= 0 ? args[at + 1] : undefined;
}
