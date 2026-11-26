// Reads the command line: the site's address and the folder to keep what was read in.
// --address <https://...> [--folder <folder>] [--from-sitemap] [--json]
// --from-sitemap reads the pages the sitemap lists, for a site with no /llms-full.txt, once the person says yes.

export type ProfileMakeArgs = {
  address: string;
  folder: string;
  fromSitemap: boolean;
};

export type ArgsResult = { ok: true; args: ProfileMakeArgs } | { ok: false; problem: string };

export const USAGE = "node dist/run.js --address <https://...> [--folder <folder>] [--from-sitemap] [--json]";

const DEFAULT_FOLDER = "site";
const VALUE_FLAGS = ["--address", "--folder"];

export function readArgs(args: readonly string[]): ArgsResult {
  const values: Record<string, string> = {};
  let fromSitemap = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];
    if (arg === "--json") {
      continue;
    }
    if (arg === "--from-sitemap") {
      fromSitemap = true;
      continue;
    }
    if (VALUE_FLAGS.includes(arg) && value !== undefined && !value.startsWith("--")) {
      values[arg] = value;
      index += 1;
      continue;
    }
    return { ok: false, problem: `Not understood: ${arg}. Use: ${USAGE}` };
  }

  const address = values["--address"];
  if (!address) {
    return { ok: false, problem: `Name the site's address with --address. Use: ${USAGE}` };
  }
  return { ok: true, args: { address, folder: values["--folder"] ?? DEFAULT_FOLDER, fromSitemap } };
}
