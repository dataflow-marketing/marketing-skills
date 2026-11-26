// Copies spec/ into every plugin: a skill installed on its own has the spec beside it. Claude Code installs a
// plugin's folder only: a link out to the repo's spec/ is missing on the person's machine.
// A link from the spec to elsewhere in the repo becomes a link to the repo on GitHub.
// Run by `pnpm build`; copy-spec.test.ts fails when a copy is out of date.

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("..", import.meta.url));
const ON_GITHUB = "https://github.com/dataflow-marketing/marketing-skills/blob/develop/";

// a spec file as it is copied: links out of spec/ point to GitHub
export function specCopy(text: string): string {
  return text.replace(/\]\(\.\.\/([^)]+)\)/g, (_link, path: string) => `](${ON_GITHUB}${path})`);
}

export async function specFiles(): Promise<string[]> {
  return (await readdir(join(REPO, "spec"))).filter((name) => /\.(md|txt)$/.test(name)).sort();
}

export async function pluginFolders(): Promise<string[]> {
  const names = await readdir(join(REPO, "plugins"));
  return names.filter((name) => name.startsWith("dfm-")).map((name) => join(REPO, "plugins", name));
}

async function main(): Promise<void> {
  const files = await specFiles();
  for (const plugin of await pluginFolders()) {
    await mkdir(join(plugin, "spec"), { recursive: true });
    for (const file of files) {
      await writeFile(join(plugin, "spec", file), specCopy(await readFile(join(REPO, "spec", file), "utf8")));
    }
    process.stdout.write(`copied the spec into ${join(plugin.slice(REPO.length), "spec")}\n`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
