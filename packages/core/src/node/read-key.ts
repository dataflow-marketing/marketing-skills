// Node edge: reads one named key from the keys file.
// The key goes straight to the script that needs it; it is never printed.

import { readFile } from "node:fs/promises";
import { findKey } from "../keys/find-key.ts";
import { parseKeysFile } from "../keys/parse-keys-file.ts";
import { expandHome } from "./expand-home.ts";

export async function readKey(keysFilePath: string, keyName: string): Promise<string> {
  const text = await readFile(expandHome(keysFilePath), "utf8");
  const keys = parseKeysFile(text);
  return findKey(keys, keyName);
}
