// Splits a Ghost Admin API key into its two parts.
// Ghost gives the key as id:secret, where the id is 24 hex characters
// and the secret is 64 hex characters.
// A malformed key is an error that never shows the key or its secret.
// Nothing secret ever reaches the terminal or Claude.

export type AdminKey = {
  id: string;
  secret: Uint8Array;
};

const ADMIN_KEY = /^([0-9a-f]{24}):([0-9a-f]{64})$/i;

export class MalformedAdminKeyError extends Error {
  constructor() {
    super("The Ghost Admin API key is not in Ghost's id:secret form. Copy it again from Ghost Admin, Settings, Integrations.");
    this.name = "MalformedAdminKeyError";
  }
}

export function parseAdminKey(key: string): AdminKey {
  const match = ADMIN_KEY.exec(key.trim());
  if (!match) {
    throw new MalformedAdminKeyError();
  }
  return {
    id: match[1],
    secret: hexToBytes(match[2]),
  };
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index++) {
    const pair = hex.slice(index * 2, index * 2 + 2);
    bytes[index] = parseInt(pair, 16);
  }
  return bytes;
}
