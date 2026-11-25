// Finds one named key.
// A missing key is an error that names the key, never its value.
// Nothing secret ever reaches the terminal or Claude.

import type { Keys } from "./parse-keys-file.ts";

export class MissingKeyError extends Error {
  readonly keyName: string;

  constructor(keyName: string) {
    super(`No key named ${keyName}. Add it to the keys file named in settings.`);
    this.name = "MissingKeyError";
    this.keyName = keyName;
  }
}

export function findKey(keys: Keys, keyName: string): string {
  const value = keys[keyName];
  if (value === undefined || value === "") {
    throw new MissingKeyError(keyName);
  }
  return value;
}
