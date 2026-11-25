// The Worker version of reading a key: the key comes from the Worker's env
// (a secret or a variable binding) instead of the keys file.

import { findKey } from "./find-key.ts";
import type { Keys } from "./parse-keys-file.ts";

export function keyFromEnv(env: Record<string, unknown>, keyName: string): string {
  const keys: Keys = {};
  const value = env[keyName];
  if (typeof value === "string") {
    keys[keyName] = value;
  }
  return findKey(keys, keyName);
}
