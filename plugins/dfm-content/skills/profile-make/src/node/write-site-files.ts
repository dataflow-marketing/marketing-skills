// Node edge: keeps what was read from the site as new files in the folder: home.txt, one of llms-full.txt or
// pages.txt (the pages its sitemap lists), counted.txt (the counts the profile's check reads), fingerprints.txt (one
// line a page, for the next read) and, after a read --since an earlier one, changed.txt.
// It never writes over a file: what was read before is the person's to keep or delete.

import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type SiteFiles = { homeFile: string; pagesFile: string; countedFile: string; fingerprintsFile: string; changedFile?: string };

export type WriteResult = { ok: true; files: SiteFiles } | { ok: false; problem: string };

export type SiteTexts = { home: string; pages: string; pagesName: string; counted: string; fingerprints: string; changed?: string };

export async function writeSiteFiles(folder: string, texts: SiteTexts): Promise<WriteResult> {
  const files: SiteFiles = {
    homeFile: join(folder, "home.txt"),
    pagesFile: join(folder, texts.pagesName),
    countedFile: join(folder, "counted.txt"),
    fingerprintsFile: join(folder, "fingerprints.txt"),
  };
  if (texts.changed !== undefined) {
    files.changedFile = join(folder, "changed.txt");
  }
  for (const file of Object.values(files)) {
    if (await exists(file)) {
      return { ok: false, problem: `${file} is already there. Delete it or name another folder with --folder.` };
    }
  }
  await mkdir(folder, { recursive: true });
  await writeFile(files.homeFile, texts.home);
  await writeFile(files.pagesFile, texts.pages);
  await writeFile(files.countedFile, `${texts.counted}\n`);
  await writeFile(files.fingerprintsFile, texts.fingerprints);
  if (files.changedFile && texts.changed !== undefined) {
    await writeFile(files.changedFile, texts.changed);
  }
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
