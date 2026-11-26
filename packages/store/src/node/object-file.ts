// Node edge: the file connector. Reads and writes an object kept as a plain text file.
// A path that starts with ~ is under the home folder; any other relative path is under the working folder.
// Reading gives back undefined when the file is not there yet; writing makes its folder first.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { expandHome } from "@dataflow-marketing/core/node";

export function objectPath(path: string, workingFolder: string = process.cwd()): string {
  return resolve(workingFolder, expandHome(path));
}

export async function readObjectFile(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if ((error as { code?: string }).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

export async function writeObjectFile(path: string, text: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, text, "utf8");
}
