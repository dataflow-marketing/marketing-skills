// Node edge: keeps what was read from the site as two new files in the folder: home.txt and one of llms-full.txt
// or pages.txt (the pages its sitemap lists).
// It never writes over a file: what was read before is the person's to keep or delete.

import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type SiteFiles = { homeFile: string; pagesFile: string };

export type WriteResult = { ok: true; files: SiteFiles } | { ok: false; problem: string };

export async function writeSiteFiles(folder: string, home: string, pages: string, pagesName: string): Promise<WriteResult> {
  const files = { homeFile: join(folder, "home.txt"), pagesFile: join(folder, pagesName) };
  for (const file of [files.homeFile, files.pagesFile]) {
    if (await exists(file)) {
      return { ok: false, problem: `${file} is already there. Delete it or name another folder with --folder.` };
    }
  }
  await mkdir(folder, { recursive: true });
  await writeFile(files.homeFile, home);
  await writeFile(files.pagesFile, pages);
  return { ok: true, files };
}

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}
