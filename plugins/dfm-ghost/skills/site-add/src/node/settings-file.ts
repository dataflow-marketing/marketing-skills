// Node edge: reads and appends to the settings file.
// Reading gives back undefined when the file is not there yet. Writing the whole file is only for a replaced line.

import { appendFile, readFile, writeFile } from "node:fs/promises";
import { expandHome } from "@dataflow-marketing/core/node";

export async function readSettingsText(settingsPath: string): Promise<string | undefined> {
  try {
    return await readFile(expandHome(settingsPath), "utf8");
  } catch {
    return undefined;
  }
}

export async function appendSettingsText(settingsPath: string, text: string): Promise<void> {
  await appendFile(expandHome(settingsPath), text, "utf8");
}

export async function writeSettingsText(settingsPath: string, text: string): Promise<void> {
  await writeFile(expandHome(settingsPath), text, "utf8");
}
