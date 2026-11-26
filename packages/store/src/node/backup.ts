// Node edge: copies an object into the backups folder before every change (spec/store.md, rule 2).
// The folder is the settings' backups line (by default backups/ beside the settings file); a relative backups line is
// read from the settings file's folder. Backups may hold a business's plan: the folder is the owner's alone
// (700) and each file too (600). A name already taken gets -2, -3: a backup is never overwritten.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { expandHome } from "@dataflow-marketing/core/node";

export function backupsFolder(settingsPath: string, backupsLine: string | undefined): string {
  const settingsFolder = dirname(resolve(expandHome(settingsPath)));
  if (backupsLine === undefined) {
    return join(settingsFolder, "backups");
  }
  return resolve(settingsFolder, expandHome(backupsLine));
}

export async function writeBackup(folder: string, name: string, text: string): Promise<string> {
  await mkdir(folder, { recursive: true, mode: 0o700 });
  for (let copy = 1; copy < 100; copy += 1) {
    const path = join(folder, copy === 1 ? name : name.replace(/\.txt$/, `-${copy}.txt`));
    try {
      await writeFile(path, text, { encoding: "utf8", flag: "wx", mode: 0o600 });
      return path;
    } catch (error) {
      if ((error as { code?: string }).code !== "EEXIST") {
        throw error;
      }
    }
  }
  throw new Error(`Too many backups named ${name} in ${folder}.`);
}
