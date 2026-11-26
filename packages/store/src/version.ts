// The version of an object: SHA-256 of its text as UTF-8, in lowercase hex (spec/store.md).
// An empty or missing object has the version "none".
// The same text always gives the same version: a change made anywhere else shows as a new version.

export const NO_VERSION = "none";

export async function versionOf(text: string | undefined): Promise<string> {
  if (text === undefined || text === "") {
    return NO_VERSION;
  }
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return toHex(new Uint8Array(digest));
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
