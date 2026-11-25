// Node edge: reads a settings file and hands its text to the pure parser.

import { readFile } from "node:fs/promises";
import { parseSettings } from "../settings/parse-settings.ts";
import type { SettingsResult } from "../settings/types.ts";
import { expandHome } from "./expand-home.ts";

export async function readSettings(settingsPath: string): Promise<SettingsResult> {
  const text = await readFile(expandHome(settingsPath), "utf8");
  return parseSettings(text);
}
